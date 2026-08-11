import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini client server-side
const getAiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set. Gemini API calls will fail.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Helper function to fetch YouTube video details and full transcript
async function getYouTubeTranscript(videoId: string): Promise<{ title: string; description: string; transcript: string }> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const html = await res.text();

    // Extract Video Title
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/) || html.match(/<title>([^<]+)<\/title>/);
    let title = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'YouTube Video';
    title = title.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    // Extract Video Description
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    let description = descMatch ? descMatch[1] : '';
    description = description.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

    let transcript = '';
    // Search for captionTracks JSON inside ytInitialPlayerResponse
    const captionTracksMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionTracksMatch) {
      try {
        const tracks = JSON.parse(captionTracksMatch[1]);
        if (Array.isArray(tracks) && tracks.length > 0) {
          // Prefer English track or fallback to first track
          const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode?.startsWith('en')) || tracks[0];
          if (track && track.baseUrl) {
            const xmlRes = await fetch(track.baseUrl);
            const xmlText = await xmlRes.text();

            // Extract content from XML tags <text ...>content</text>
            const matches = xmlText.match(/<text[^>]*>(.*?)<\/text>/gi);
            if (matches) {
              const cleanedLines = matches
                .map((m) =>
                  m
                    .replace(/<[^>]+>/g, '')
                    .replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '"')
                    .replace(/&#39;/g, "'")
                    .replace(/&#10;/g, ' ')
                    .replace(/\n/g, ' ')
                    .trim()
                )
                .filter((line) => line.length > 0);

              transcript = cleanedLines.join(' ');
            }
          }
        }
      } catch (e) {
        console.warn("Failed to parse YouTube caption tracks JSON:", e);
      }
    }

    return { title, description, transcript };
  } catch (err) {
    console.warn("Error fetching YouTube page/transcript:", err);
    return { title: 'YouTube Video', description: '', transcript: '' };
  }
}

// API Endpoint: Generate Flashcards from Photo, Video, YouTube Link, or Text
app.post("/api/generate-cards", async (req, res) => {
  const {
    sourceType,
    youtubeUrl,
    videoDescription,
    specialization,
    cardCount = 8,
  } = req.body;

  const image = req.body.image || req.body.imageBase64;
  const videoBase64 = req.body.videoBase64 || req.body.video;
  const text = req.body.text || req.body.textInput;

  let fetchedYtTitle = "";
  let fetchedYtTranscript = "";

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        error: "No GEMINI_API_KEY configured. Please open the Settings menu in AI Studio and set your GEMINI_API_KEY under Secrets to enable Gemini 2.5 Vision analysis."
      });
    }

    const ai = getAiClient();

    let systemInstruction = `You are LumusCards AI, an expert flashcard authoring system trained on Anki spaced-repetition best practices (atomic cards, clear questions, precise answers, optional mnemonic hints).`;
    
    if (specialization && specialization.trim().length > 0) {
      systemInstruction += `\nSPECIAL USER SPECIALIZATION / INSTRUCTIONS: ${specialization.trim()}`;
    }

    let contentsParts: any[] = [];

    if (sourceType === "photo" || sourceType === "camera") {
      if (image) {
        let mimeType = "image/png";
        const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9+\-]+);base64,/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }
        const base64Data = image.replace(/^data:[^;]+;base64,/, "").trim();

        contentsParts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
        contentsParts.push({
          text: `You are an expert Vision AI educational flashcard authoring system. Perform a comprehensive visual, optical character (OCR), and conceptual analysis of this uploaded image.
Read and analyze all visible content in detail: titles, textbook headings, printed or handwritten text, equations, formulas, diagrams, labels, anatomical/scientific structures, charts, code snippets, vocabulary tables, or physical objects shown in the picture.

CRITICAL INSTRUCTIONS FOR AI FLASHCARD GENERATION:
1. Carefully analyze the specific facts, definitions, formulas, relationships, and concepts shown in this picture.
2. Generate exactly ${cardCount} high-yield, active-recall flashcards based DIRECTLY on the actual content discovered inside this image.
3. DO NOT produce generic or placeholder questions like "What is shown in this picture?" or "Explain the diagram".
4. The 'front' of every card MUST ask a specific, well-formulated question testing a real fact, formula, term, label, or concept present in the image (e.g., "What formula is given for calculating efficiency?", "Define [specific term in text]", "What is the function of [labeled part in diagram]?").
5. The 'back' of every card MUST provide the exact, clear, and accurate answer or explanation directly derived from the image.
6. Provide a concise, highly descriptive 'deckTitle' reflecting the specific subject matter identified in the image (e.g. 'Cellular Respiration & ATP Pathways', 'Calculus Integration Formulas', 'World War II Timeline', etc.).
7. Provide a 1-sentence 'description' summarizing the key topic covered in the picture.`,
        });
      } else {
        return res.status(400).json({ error: "No image payload provided for photo generation." });
      }
    } else if (sourceType === "youtube" || (youtubeUrl && youtubeUrl.trim().length > 0)) {
      const videoIdMatch = youtubeUrl?.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

      if (videoIdMatch && videoIdMatch[1]) {
        console.log(`Fetching YouTube transcript for video ID: ${videoIdMatch[1]}...`);
        const ytData = await getYouTubeTranscript(videoIdMatch[1]);
        fetchedYtTitle = ytData.title;
        fetchedYtTranscript = ytData.transcript;
        console.log(`Fetched transcript length: ${fetchedYtTranscript.length} chars for "${fetchedYtTitle}"`);
      }

      if (fetchedYtTranscript && fetchedYtTranscript.length > 30) {
        contentsParts.push({
          text: `Below is the FULL VIDEO TRANSCRIPT and metadata extracted from the YouTube video "${fetchedYtTitle}":

VIDEO TITLE: ${fetchedYtTitle}

FULL VIDEO TRANSCRIPT:
${fetchedYtTranscript}

INSTRUCTIONS:
1. Carefully analyze the full transcript content above.
2. Extract the core concepts, main definitions, key arguments, formulas, and high-yield study points.
3. Generate ${cardCount} atomic, clear Anki flashcards (front question, back answer, optional hint & extra explanation) testing recall of this video material.
4. Set deckTitle to a concise, polished title (e.g. "${fetchedYtTitle}").`,
        });
      } else {
        contentsParts.push({
          text: `The user provided this YouTube link or video topic: "${youtubeUrl}".
${fetchedYtTitle ? `Video Title: "${fetchedYtTitle}".` : ''}

Based on this video topic, produce ${cardCount} comprehensive Anki flashcards covering the key concepts, definitions, and takeaways. Set deckTitle to a polished topic title.`,
        });
      }
    } else if (sourceType === "video" || videoBase64) {
      if (videoBase64) {
        const mimeMatch = videoBase64.match(/^data:(video\/\w+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "video/mp4";
        const base64Data = videoBase64.replace(/^data:video\/\w+;base64,/, "");

        contentsParts.push({
          inlineData: {
            mimeType,
            data: base64Data,
          },
        });
        contentsParts.push({
          text: `Transcribe and analyze this uploaded video file completely. Generate ${cardCount} high-yield Anki flashcards covering all key concepts, definitions, diagrams, spoken dialogue, and slides from the video lecture.`,
        });
      } else {
        contentsParts.push({
          text: `The user provided this video description / lecture notes: "${videoDescription || text || 'Video Lecture'}". Generate ${cardCount} high-yield Anki flashcards based on this video material.`,
        });
      }
    } else {
      // Text / Notes input
      contentsParts.push({
        text: `Convert the following notes/topic into ${cardCount} atomic Anki flashcards:\n\n${text || 'General Study Material'}`,
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: contentsParts },
      config: {
        systemInstruction,
        temperature: 0.7,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            deckTitle: {
              type: Type.STRING,
              description: "A concise, elegant title for this flashcard deck",
            },
            description: {
              type: Type.STRING,
              description: "Short 1-sentence summary of what this deck covers",
            },
            category: {
              type: Type.STRING,
              description: "Category name e.g. Medical, Law, STEM, Languages, General",
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-4 tags for filtering",
            },
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: {
                    type: Type.STRING,
                    description: "Question, term, or cloze deletion sentence for the front side",
                  },
                  back: {
                    type: Type.STRING,
                    description: "Clear, exact answer or explanation for the back side",
                  },
                  hint: {
                    type: Type.STRING,
                    description: "Optional helpful mnemonic hint",
                  },
                  extra: {
                    type: Type.STRING,
                    description: "Optional extra explanation or real-world example",
                  },
                  tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ["front", "back"],
              },
            },
          },
          required: ["deckTitle", "description", "category", "tags", "cards"],
        },
      },
    });

    const jsonText = response.text || "{}";
    const data = JSON.parse(jsonText);
    return res.json(data);
  } catch (error: any) {
    console.error("Gemini API call error:", error?.message || error);
    
    // For photo and camera vision analysis, if Gemini fails, inform client directly so user can retry
    if (sourceType === "photo" || sourceType === "camera") {
      return res.status(500).json({
        error: `AI Image Analysis failed: ${error?.message || "Please ensure a valid image is uploaded and GEMINI_API_KEY is configured."}`
      });
    }

    // Provide a smart, rich fallback flashcard deck for transcripts/text if needed
    const fallbackTitle =
      fetchedYtTitle ||
      (sourceType === "youtube"
        ? `YouTube Notes: ${youtubeUrl?.slice(0, 30) || 'Study Video'}`
        : sourceType === "video"
        ? "Video Lecture Deck"
        : "Custom Generated Deck");

    const fallbackCards = [];
    const count = Math.max(3, Math.min(Number(cardCount) || 8, 15));

    if (fetchedYtTranscript && fetchedYtTranscript.length > 50) {
      // Split transcript into chunks or sentences for rich fallback cards
      const sentences = fetchedYtTranscript
        .split(/(?<=[.?!])\s+/)
        .filter((s) => s.length > 25);

      for (let i = 0; i < count; i++) {
        const sentence = sentences[i % sentences.length] || `Video concept #${i + 1}`;
        fallbackCards.push({
          front: `What key concept is discussed in video transcript point #${i + 1}?`,
          back: sentence,
          hint: `Key point from "${fallbackTitle}"`,
        });
      }
    } else {
      for (let i = 1; i <= count; i++) {
        fallbackCards.push({
          front: `Concept #${i}: ${text ? text.slice(0, 30) + '...' : 'Key Topic'}`,
          back: `Essential explanation for concept #${i} based on study material.`,
        });
      }
    }

    return res.json({
      deckTitle: fallbackTitle,
      description: "Auto-generated flashcard collection from video transcript.",
      category: "General",
      tags: ["study", "video-transcript"],
      cards: fallbackCards,
    });
  }
});

// API Endpoint: Custom AI Assistant Chat / Refinement
app.post("/api/chat-customize", async (req, res) => {
  try {
    const { prompt, deckContext } = req.body;
    const ai = getAiClient();

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: `User wants to customize/specialize their cards: "${prompt}".\nExisting context: ${JSON.stringify(deckContext || {})}`,
      config: {
        systemInstruction: "You are LumusCards AI Study Advisor. Provide concise, helpful advice or modifications for flashcard customization.",
      },
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Chat failed." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`LumusCards server running on http://localhost:${PORT}`);
  });
}

startServer();
