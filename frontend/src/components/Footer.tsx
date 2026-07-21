import React from 'react';
import { Heart, Sparkles, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const teamMembers = ['Navneet', 'Vansh', 'Akshit', 'Himanshu'];

  return (
    <footer className="mt-12 pt-6 pb-6 border-t border-border-subtle bg-surface/50 rounded-2xl p-6 text-xs text-text-secondary">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand & Team Info */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
            <Code2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-text-primary text-sm">SenseAI</span>
              <span className="text-text-tertiary text-xs">•</span>
              <span className="font-semibold text-accent-primary flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>Team Learners 404</span>
              </span>
            </div>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Engineered for Industrial IoT Learning, Development & Diagnostics
            </p>
          </div>
        </div>

        {/* Center: Teammates Badges */}
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="text-[11px] text-text-tertiary font-medium mr-1">Created by:</span>
          {teamMembers.map((member) => (
            <span
              key={member}
              className="bg-surface-raised hover:bg-accent-primary/10 border border-border-subtle hover:border-accent-primary/30 text-text-primary px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all shadow-xs flex items-center space-x-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
              <span>{member}</span>
            </span>
          ))}
        </div>

        {/* Right: Copyright */}
        <div className="flex items-center space-x-1 text-[11px] text-text-tertiary">
          <span>Made with</span>
          <Heart className="w-3.5 h-3.5 text-semantic-danger fill-semantic-danger animate-pulse inline" />
          <span>by <strong className="text-text-secondary">Learners 404</strong></span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
