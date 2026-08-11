import React, { useState, useRef } from 'react';
import { GenerationSourceType, Deck } from '../types';
import { LoadingRocket } from './LoadingRocket';
import { soundEngine } from '../lib/soundEngine';
import { Camera, Upload, X, MessageSquare, AlertCircle, ArrowRight } from 'lucide-react';

interface CardGeneratorModalProps {
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
}

export const CardGeneratorModal: React.FC<CardGeneratorModalProps> = ({
  onClose,
  onDeckCreated,
}) => {
  const [sourceType] = useState<GenerationSourceType>('photo');
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [specialization, setSpecialization] = useState<string>('');
  const [cardCount, setCardCount] = useState<number>(8);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Web Camera Snapshot state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // File Upload Handler for Photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImageBase64(reader.result as string);
        soundEngine.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  // Start Camera Stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      soundEngine.playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access camera. Please allow camera permissions or upload an image file.');
      setIsCameraActive(false);
    }
  };

  // Capture Camera Snapshot
  const captureCameraSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setSelectedImageBase64(dataUrl);
        soundEngine.playClick();

        // Stop camera tracks
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        setIsCameraActive(false);
      }
    }
  };

  // Submit Generation Request to Express /api/generate-cards
  const handleGenerate = async () => {
    setErrorMsg(null);
    if (!selectedImageBase64) {
      setErrorMsg('Please upload a picture or snap a camera photo first.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceType: 'photo',
          image: selectedImageBase64,
          imageBase64: selectedImageBase64,
          specialization,
          cardCount,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate cards from backend');
      }

      const data = await response.json();
      soundEngine.playLevelUp();

      const newDeck: Deck = {
        id: 'deck_' + Date.now(),
        title: data.deckTitle || 'Photo Study Deck',
        description: data.description || data.deckDescription || 'AI generated flashcard collection from photo.',
        category: data.category || 'General',
        cards: (data.cards || []).map((c: any, index: number) => ({
          id: 'gen_' + Date.now() + '_' + index,
          front: c.front,
          back: c.back,
          hint: c.hint,
          extra: c.extra,
          imageUrl: selectedImageBase64 || undefined,
          tags: c.tags || ['photo-cards'],
          interval: 1,
          repetition: 0,
          easeFactor: 2.5,
          nextReviewDate: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onDeckCreated(newDeck);
    } catch (err: any) {
      console.error('Generation Error:', err);
      setErrorMsg(err.message || 'An error occurred while generating flashcards.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-xl glass-panel rounded-3xl p-5 sm:p-6 text-zinc-100 shadow-2xl relative overflow-hidden flex flex-col max-h-[88vh] border border-purple-500/30">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              Photo to Flashcards Engine
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Convert photos, textbook pages, or study documents into flashcard decks
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            title="Close popup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto py-5 space-y-6 flex-1 pr-1">
          {isGenerating ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <LoadingRocket />
              <div className="text-sm font-extrabold text-white">
                AI Vision analyzing image and extracting concepts...
              </div>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                Gemini Vision AI is scanning your photo for text, formulas, diagrams, and definitions to generate custom active-recall questions.
              </p>
            </div>
          ) : (
            <>
              {/* Input Options Body */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 cursor-pointer glass-card p-5 text-center transition-all hover:-translate-y-1 group">
                    <Upload className="w-6 h-6 mx-auto mb-2 text-purple-300 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-extrabold text-white block">Upload Picture / Document</span>
                    <span className="text-[11px] text-zinc-400">Supports PNG, JPG, WEBP, PDF</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={startCamera}
                    className="flex-1 glass-card p-5 text-center transition-all text-white cursor-pointer hover:-translate-y-1 group"
                  >
                    <Camera className="w-6 h-6 mx-auto mb-2 text-purple-300 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-extrabold block">Take Camera Photo</span>
                    <span className="text-[11px] text-zinc-400">Use Device Camera</span>
                  </button>
                </div>

                {/* Camera Live Stream Box */}
                {isCameraActive && (
                  <div className="glass-card p-4 text-center space-y-3">
                    <video ref={videoRef} autoPlay playsInline className="w-full max-h-64 object-cover rounded-2xl border border-white/15" />
                    <button
                      onClick={captureCameraSnapshot}
                      className="btn-premium btn-premium-purple px-6 py-2.5"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                {/* Image Preview */}
                {selectedImageBase64 && (
                  <div className="glass-card p-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={selectedImageBase64} alt="Selected" className="w-12 h-12 object-cover rounded-xl border border-white/15" />
                      <span className="text-xs font-medium text-zinc-200">Picture loaded successfully</span>
                    </div>
                    <button
                      onClick={() => setSelectedImageBase64(null)}
                      className="text-xs text-red-400 font-bold hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Custom Instructions */}
              <div className="glass-card p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase text-zinc-300 font-bold flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-300" />
                    <span>Custom Instructions (Optional)</span>
                  </label>
                </div>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. 'Emphasize definitions and key exam terms'"
                  className="w-full bg-zinc-900/60 backdrop-blur-md border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/25"
                />
              </div>

              {/* Card Count Selector */}
              <div className="flex items-center justify-between text-xs text-zinc-300">
                <span className="font-extrabold">Number of Flashcards:</span>
                <div className="flex items-center gap-2">
                  {[5, 8, 12, 15].map((count) => (
                    <button
                      key={count}
                      onClick={() => {
                        soundEngine.playClick();
                        setCardCount(count);
                      }}
                      className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer hover:-translate-y-0.5 ${
                        cardCount === count
                          ? 'bg-white text-zinc-950 font-black shadow-md'
                          : 'bg-zinc-900/60 backdrop-blur-md text-zinc-400 border border-white/10 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message Display */}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-bold text-red-100">AI Vision Processing Notice</div>
                    <p className="leading-relaxed">{errorMsg}</p>
                    {errorMsg.includes("GEMINI_API_KEY") && (
                      <p className="text-[11px] text-amber-300/90 font-medium pt-1">
                        💡 Quick Fix: Click <strong>Settings</strong> in the top left menu of AI Studio, navigate to <strong>Secrets</strong>, and add your <code className="bg-black/40 px-1 py-0.5 rounded text-amber-200">GEMINI_API_KEY</code>.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && (
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="btn-premium btn-premium-dark px-4 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="btn-premium btn-premium-purple px-6 py-2.5"
            >
              <span>Generate Flashcards</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

