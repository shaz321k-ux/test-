import React, { useState } from 'react';
import { Deck, Card } from '../types';
import { soundEngine } from '../lib/soundEngine';
import {
  Download,
  X,
  Plus,
  Search,
  Trash2,
  Image as ImageIcon,
  Upload,
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  Eye,
  Layers,
  Check,
} from 'lucide-react';

interface DeckBrowserModalProps {
  deck: Deck;
  onUpdateDeck: (updatedDeck: Deck) => void;
  onClose: () => void;
}

export const DeckBrowserModal: React.FC<DeckBrowserModalProps> = ({
  deck,
  onUpdateDeck,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Flashcard Form State
  const [newFront, setNewFront] = useState<string>('');
  const [newBack, setNewBack] = useState<string>('');
  const [newHint, setNewHint] = useState<string>('');
  const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

  // Deck Meta State
  const [editedTitle, setEditedTitle] = useState<string>(deck.title);
  const [editedCategory, setEditedCategory] = useState<string>(deck.category || 'General');

  // Success indicator after card creation
  const [justCreatedCount, setJustCreatedCount] = useState<number | null>(null);

  const handleSaveDeckMeta = (newTitle?: string, newCategory?: string) => {
    const titleToSave = (newTitle !== undefined ? newTitle : editedTitle).trim() || 'New Custom Deck';
    const catToSave = (newCategory !== undefined ? newCategory : editedCategory).trim() || 'General';

    if (titleToSave !== deck.title || catToSave !== deck.category) {
      onUpdateDeck({
        ...deck,
        title: titleToSave,
        category: catToSave,
        updatedAt: new Date().toISOString(),
      });
    }
  };

  const handleCardImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewImageUrl(reader.result as string);
        soundEngine.playClick();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    soundEngine.playClick();

    const newCard: Card = {
      id: 'card_' + Date.now(),
      front: newFront.trim(),
      back: newBack.trim(),
      hint: newHint.trim() || undefined,
      imageUrl: newImageUrl || undefined,
      tags: [editedCategory || deck.category || 'General'],
      interval: 1,
      repetition: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
    };

    const updatedCards = [...deck.cards, newCard];
    const updatedDeck: Deck = {
      ...deck,
      title: editedTitle.trim() || 'New Custom Deck',
      category: editedCategory.trim() || 'General',
      cards: updatedCards,
      updatedAt: new Date().toISOString(),
    };

    onUpdateDeck(updatedDeck);

    // Reset inputs
    setNewFront('');
    setNewBack('');
    setNewHint('');
    setNewImageUrl(null);

    // Show clean green tick status
    setJustCreatedCount(updatedCards.length);

    setTimeout(() => {
      const frontInput = document.getElementById('flashcard-front-input') as HTMLTextAreaElement;
      if (frontInput) frontInput.focus();
    }, 100);
  };

  const handleDeleteCard = (cardId: string) => {
    soundEngine.playClick();
    const updatedDeck: Deck = {
      ...deck,
      cards: deck.cards.filter((c) => c.id !== cardId),
      updatedAt: new Date().toISOString(),
    };
    onUpdateDeck(updatedDeck);
  };

  const exportToAnkiCSV = () => {
    soundEngine.playClick();
    const csvRows = deck.cards.map(
      (c) =>
        `"${c.front.replace(/"/g, '""')}","${c.back.replace(
          /"/g,
          '""'
        )}","${(c.hint || '').replace(/"/g, '""')}"`
    );
    const csvContent =
      'data:text/csv;charset=utf-8,' + ['Front,Back,Hint', ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${deck.title.replace(/\s+/g, '_')}_anki.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredCards = deck.cards.filter(
    (c) =>
      c.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.back.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-zinc-950/85 backdrop-blur-xl overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl glass-panel rounded-3xl p-5 sm:p-7 text-zinc-100 shadow-2xl relative my-6 space-y-5 max-h-[92vh] overflow-y-auto border border-white/15">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 sticky -top-5 bg-zinc-950/90 pt-1 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Flashcards Creator</span>
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {deck.cards.length > 0 && (
              <button
                onClick={exportToAnkiCSV}
                className="btn-premium btn-premium-dark px-3 py-1.5 text-xs hidden sm:flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-purple-300" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={() => {
                handleSaveDeckMeta();
                onClose();
              }}
              className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deck Title & Subject Input Tile */}
        <div className="bg-zinc-900/90 border border-white/15 rounded-2xl p-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-white flex items-center gap-1.5">
              <span>New Custom Deck</span>
              <span className="text-base" title="Customizable">✏️</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                Deck Name
              </label>
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => {
                  setEditedTitle(e.target.value);
                  handleSaveDeckMeta(e.target.value, editedCategory);
                }}
                placeholder="e.g., Biology Chapter 1, Spanish Vocab..."
                className="w-full bg-zinc-950/90 border border-purple-500/40 focus:border-purple-400 text-white font-extrabold text-sm px-3.5 py-2 rounded-xl focus:outline-none shadow-inner"
              />
            </div>

            <div>
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-wider block mb-1">
                Category
              </label>
              <input
                type="text"
                value={editedCategory}
                onChange={(e) => {
                  setEditedCategory(e.target.value);
                  handleSaveDeckMeta(editedTitle, e.target.value);
                }}
                placeholder="e.g., Science, General"
                className="w-full bg-zinc-950/90 border border-white/15 focus:border-purple-400 text-zinc-200 font-bold text-xs px-3.5 py-2 rounded-xl focus:outline-none shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Minimalistic Card Creation Tile */}
        <div className="bg-zinc-900/90 border border-white/15 rounded-2xl p-5 space-y-4">
          <form onSubmit={handleAddCard} className="space-y-4">
            
            {/* Front Question & Back Answer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span>Front Question</span>
                </label>
                <textarea
                  id="flashcard-front-input"
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  placeholder="Enter front question..."
                  rows={2}
                  required
                  className="w-full bg-zinc-950/90 border border-white/15 focus:border-purple-400 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none font-medium leading-relaxed shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Back Answer</span>
                </label>
                <textarea
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  placeholder="Enter back answer..."
                  rows={2}
                  required
                  className="w-full bg-zinc-950/90 border border-white/15 focus:border-emerald-400 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none font-medium leading-relaxed shadow-inner"
                />
              </div>
            </div>

            {/* Hint & Image Upload (Optional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hint Clue (Optional)</span>
                </label>
                <input
                  type="text"
                  value={newHint}
                  onChange={(e) => setNewHint(e.target.value)}
                  placeholder="Enter hint clue..."
                  className="w-full bg-zinc-950/90 border border-white/15 focus:border-amber-400 rounded-xl p-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none font-medium shadow-inner"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-sky-300 mb-1 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                  <span>Attached Image (Optional)</span>
                </label>
                <div className="flex items-center gap-2">
                  <label className="flex-1 cursor-pointer bg-zinc-950/90 border border-white/15 hover:border-sky-400 rounded-xl p-2 flex items-center justify-center gap-2 text-xs text-zinc-200 font-semibold transition-all shadow-sm">
                    <Upload className="w-3.5 h-3.5 text-sky-400" />
                    <span>{newImageUrl ? 'Image Attached' : 'Upload Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCardImageUpload}
                      className="hidden"
                    />
                  </label>
                  {newImageUrl && (
                    <button
                      type="button"
                      onClick={() => setNewImageUrl(null)}
                      className="px-2.5 py-1.5 bg-red-500/20 text-red-300 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Live Card Preview (Including Attached Image when uploaded) */}
            {(newFront.trim() || newBack.trim() || newImageUrl) && (
              <div className="bg-zinc-950/90 border border-white/10 p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-300">
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Live Card Preview</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-purple-950/30 border border-purple-500/30 p-2.5 rounded-lg">
                    <span className="text-[10px] font-bold text-purple-300 block mb-0.5">FRONT</span>
                    <span className="text-white font-medium">{newFront || '...'}</span>
                  </div>
                  <div className="bg-emerald-950/30 border border-emerald-500/30 p-2.5 rounded-lg">
                    <span className="text-[10px] font-bold text-emerald-300 block mb-0.5">BACK</span>
                    <span className="text-zinc-200 font-medium">{newBack || '...'}</span>
                  </div>
                </div>

                {/* Show attached image in preview */}
                {newImageUrl && (
                  <div className="bg-sky-950/30 border border-sky-500/30 p-2.5 rounded-lg space-y-1">
                    <span className="text-[10px] font-bold text-sky-300 block">ATTACHED IMAGE PREVIEW</span>
                    <img
                      src={newImageUrl}
                      alt="Card image preview"
                      className="max-h-36 rounded-lg object-contain border border-white/20 bg-black/60 p-1"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-1">
              <button
                type="submit"
                className="btn-premium btn-premium-purple px-5 py-2.5 text-xs font-bold flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4 text-white" />
                <span>Save & Add Flashcard</span>
              </button>
            </div>

          </form>
        </div>

        {/* Dedicated Success Tile when a flashcard is created */}
        {justCreatedCount !== null && (
          <div className="bg-emerald-950/90 border border-emerald-500/60 rounded-2xl p-5 text-emerald-100 space-y-3 shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-white text-base">
                  Flashcard Created!
                </h4>
                <p className="text-emerald-300/90 text-xs font-medium mt-0.5">
                  Card successfully saved to this deck ({justCreatedCount} total {justCreatedCount === 1 ? 'card' : 'cards'}).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-emerald-500/30 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  const frontInput = document.getElementById('flashcard-front-input') as HTMLTextAreaElement;
                  if (frontInput) {
                    frontInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    frontInput.focus();
                  }
                }}
                className="btn-premium btn-premium-purple px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Add another flashcard</span>
              </button>
            </div>
          </div>
        )}

        {/* Deck Cards List Tile */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Cards in Deck ({deck.cards.length})
              </h3>
            </div>

            {deck.cards.length > 0 && (
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-zinc-950/80 border border-white/10 rounded-xl pl-7 pr-2.5 py-1 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-white/25"
                />
              </div>
            )}
          </div>

          <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
            {filteredCards.length === 0 ? (
              <div className="text-center py-6 text-zinc-500 text-xs font-medium bg-zinc-900/40 border border-white/10 rounded-xl p-4">
                No flashcards created yet. Fill out the fields above to add cards.
              </div>
            ) : (
              filteredCards.map((card, idx) => (
                <div
                  key={card.id}
                  className="glass-card p-3.5 flex items-start justify-between gap-3 border border-white/10 hover:border-white/20 transition-all rounded-xl text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-500/30">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-white">{card.front}</span>
                    </div>
                    <div className="text-zinc-300 pl-7 text-[11px] leading-relaxed">
                      {card.back}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCard(card.id)}
                    className="p-1.5 text-zinc-500 hover:text-red-400 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
