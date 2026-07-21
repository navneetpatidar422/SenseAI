import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Star, ArrowRight } from 'lucide-react';
import { PromptItem } from '../types';
import { fetchApi } from '../lib/api';

interface PromptLibraryViewProps {
  setActiveTab: (tab: string) => void;
}

export const PromptLibraryView: React.FC<PromptLibraryViewProps> = ({ setActiveTab }) => {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    fetchApi<PromptItem[]>('/prompts')
      .then(setPrompts)
      .catch((err) => console.error('Prompts load error:', err));
  }, []);

  const CATEGORIES = ['All', 'Troubleshooting', 'Sensors', 'Protocols', 'Code', 'Project Ideas', 'Learning'];

  const toggleFavorite = async (id: string, currentFav: boolean) => {
    try {
      if (currentFav) {
        await fetchApi(`/prompts/${id}/favorite`, { method: 'DELETE' });
      } else {
        await fetchApi(`/prompts/${id}/favorite`, { method: 'POST' });
      }
      setPrompts(prompts.map((p) => (p.id === id ? { ...p, isFavorite: !currentFav } : p)));
    } catch (e) {
      console.error('Favorite toggle failed:', e);
    }
  };

  const filtered = prompts.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.preview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFav = !showFavoritesOnly || p.isFavorite;
    return matchesCat && matchesSearch && matchesFav;
  });

  const handleUsePrompt = (p: PromptItem) => {
    const route = p.targetFeature;
    if (route.startsWith('/troubleshoot')) setActiveTab('troubleshoot');
    else if (route.startsWith('/sensors')) setActiveTab('sensors');
    else if (route.startsWith('/protocols')) setActiveTab('protocols');
    else if (route.startsWith('/code')) setActiveTab('code');
    else if (route.startsWith('/projects')) setActiveTab('projects');
    else if (route.startsWith('/learning')) setActiveTab('learning');
    else setActiveTab('chat');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-surface border border-border-subtle p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ready-made prompts..."
            className="w-full bg-surface-raised border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'bg-surface-raised text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition-colors ${
              showFavoritesOnly
                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                : 'bg-surface-raised border-border-subtle text-text-tertiary hover:text-text-primary'
            }`}
            title="Show Starred Favorites"
          >
            <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* Prompts Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-surface hover:bg-surface-raised border border-border-subtle hover:border-accent-primary/40 p-4 rounded-xl flex flex-col justify-between transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                  {prompt.category}
                </span>
                <button
                  onClick={() => toggleFavorite(prompt.id, prompt.isFavorite)}
                  className="text-text-tertiary hover:text-amber-500 p-1"
                >
                  <Star className={`w-4 h-4 ${prompt.isFavorite ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
              </div>

              <h3 className="font-bold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                {prompt.title}
              </h3>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{prompt.preview}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle/50 flex items-center justify-between">
              <span className="text-[10px] text-text-tertiary">Feature: {prompt.targetFeature}</span>
              <button
                onClick={() => handleUsePrompt(prompt)}
                className="text-xs font-semibold text-accent-primary hover:underline flex items-center space-x-1"
              >
                <span>Use Prompt</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PromptLibraryView;
