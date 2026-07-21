import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { useSearchStore } from '../stores/useSearchStore';
import { fetchApi } from '../lib/api';
import { GlobalSearchResult } from '../types';

interface GlobalSearchModalProps {
  onNavigate: (route: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ onNavigate }) => {
  const { isOpen, closeSearch } = useSearchStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        useSearchStore.getState().toggleSearch();
      } else if (e.key === 'Escape' && isOpen) {
        closeSearch();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeSearch]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await fetchApi<{ results: GlobalSearchResult[] }>(`/search?q=${encodeURIComponent(query)}`);
        setResults(data.results);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search query error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (result: GlobalSearchResult) => {
    closeSearch();
    onNavigate(result.route);
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-border-subtle rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-border-subtle bg-surface-raised">
          <Search className="w-5 h-5 text-text-tertiary mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleListKeyDown}
            placeholder="Search sensors, protocols, projects, chats..."
            className="flex-1 bg-transparent border-none outline-none text-text-primary text-base placeholder-text-tertiary font-medium"
          />
          {query && (
            <button onClick={() => setQuery('')} className="p-1 text-text-tertiary hover:text-text-primary">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-2">
          {loading && (
            <div className="p-4 text-center text-xs text-text-tertiary">Searching SenseAI knowledge base...</div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-sm text-text-secondary">No direct match found for &quot;{query}&quot;</p>
              <button
                onClick={() => {
                  closeSearch();
                  onNavigate(`/chat?q=${encodeURIComponent(query)}`);
                }}
                className="mt-3 inline-flex items-center space-x-2 text-xs bg-accent-primary text-white px-3 py-1.5 rounded-lg"
              >
                <span>Ask AI Assistant about &quot;{query}&quot;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {!query && (
            <div className="p-4 text-xs text-text-tertiary">
              Type to search across <span className="font-semibold text-text-primary">30+ Sensors</span>, <span className="font-semibold text-text-primary">10 Protocols</span>, <span className="font-semibold text-text-primary">Saved Projects</span>, and <span className="font-semibold text-text-primary">Engineering Prompts</span>.
            </div>
          )}

          {results.map((res, idx) => (
            <div
              key={`${res.category}-${res.id}`}
              onClick={() => handleSelect(res)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                idx === selectedIndex ? 'bg-accent-primary/10 border border-accent-primary/30' : 'hover:bg-surface-raised'
              }`}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-raised text-accent-primary border border-border-subtle">
                    {res.category}
                  </span>
                  <span className="font-semibold text-sm text-text-primary">{res.title}</span>
                </div>
                <p className="text-xs text-text-tertiary mt-1 line-clamp-1">{res.subtitle}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-text-tertiary" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border-subtle bg-surface-raised/50 flex justify-between items-center text-[11px] text-text-tertiary">
          <span>Navigate with <kbd className="bg-canvas border border-border-subtle px-1 rounded">↑</kbd> <kbd className="bg-canvas border border-border-subtle px-1 rounded">↓</kbd></span>
          <span>Select <kbd className="bg-canvas border border-border-subtle px-1 rounded">Enter</kbd></span>
          <span>Close <kbd className="bg-canvas border border-border-subtle px-1 rounded">Esc</kbd></span>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
