import React from 'react';
import { Search, Sun, Moon, Cpu, Sparkles } from 'lucide-react';
import { useThemeStore } from '../stores/useThemeStore';
import { useSearchStore } from '../stores/useSearchStore';

interface NavbarProps {
  currentFeatureTitle: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentFeatureTitle }) => {
  const { theme, toggleTheme } = useThemeStore();
  const { openSearch } = useSearchStore();

  return (
    <header className="h-14 bg-surface border-b border-border-subtle px-4 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 text-accent-primary">
          <Cpu className="w-5 h-5" />
          <span className="font-bold text-base tracking-tight text-text-primary">SenseAI</span>
        </div>
        <span className="text-text-tertiary">/</span>
        <span className="text-sm font-semibold text-text-secondary">{currentFeatureTitle}</span>
      </div>

      <div className="flex items-center space-x-3">
        {/* Global Search Button */}
        <button
          onClick={openSearch}
          className="flex items-center space-x-2 bg-surface-raised border border-border-subtle hover:border-accent-primary/50 text-text-secondary px-3 py-1.5 rounded-lg text-xs transition-all w-48 sm:w-64 justify-between"
        >
          <div className="flex items-center space-x-2">
            <Search className="w-3.5 h-3.5 text-text-tertiary" />
            <span>Search sensors, protocols...</span>
          </div>
          <kbd className="hidden sm:inline-block bg-canvas border border-border-subtle text-text-tertiary px-1.5 py-0.5 rounded text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-surface-raised hover:bg-border-subtle/50 text-text-secondary hover:text-text-primary transition-colors"
          title="Toggle Light / Dark Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Status Badge */}
        <div className="hidden md:flex items-center space-x-1.5 bg-accent-primary/10 border border-accent-primary/20 text-accent-primary px-2.5 py-1 rounded-full text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>v1.0 Ready</span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
