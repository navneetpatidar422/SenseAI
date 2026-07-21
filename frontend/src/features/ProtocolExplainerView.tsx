import React, { useState, useEffect } from 'react';
import { Network, CheckSquare, Sparkles, Layers } from 'lucide-react';
import { Protocol } from '../types';
import { fetchApi, streamApi } from '../lib/api';
import MermaidDiagram from '../components/MermaidDiagram';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const ProtocolExplainerView: React.FC = () => {
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [activeProtocol, setActiveProtocol] = useState<Protocol | null>(null);
  const [comparisonText, setComparisonText] = useState('');
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    fetchApi<Protocol[]>('/protocols')
      .then((data) => {
        setProtocols(data);
        if (data.length > 0 && !activeProtocol) setActiveProtocol(data[0]);
      })
      .catch((err) => console.error('Protocols fetch error:', err));
  }, []);

  const CATEGORIES = ['All', 'Wireless', 'Wired', 'Industrial', 'Web'];

  const filtered = protocols.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  );

  const toggleSelectForCompare = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
    } else {
      if (selectedSlugs.length < 4) {
        setSelectedSlugs([...selectedSlugs, slug]);
      }
    }
  };

  const handleRunCompare = async () => {
    if (selectedSlugs.length < 2 || isComparing) return;
    setIsComparing(true);
    setComparisonText('');

    try {
      await streamApi(
        '/protocols/compare',
        { slugs: selectedSlugs },
        (token) => setComparisonText((prev) => prev + token),
        () => setIsComparing(false),
        (err) => {
          console.error('Compare stream error:', err);
          setIsComparing(false);
        }
      );
    } catch (e) {
      setIsComparing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Category Filter & Compare Trigger Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-border-subtle p-4 rounded-xl">
        <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-white'
                  : 'bg-surface-raised text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <span className="text-xs text-text-tertiary">
            Selected for comparison: <strong className="text-accent-primary">{selectedSlugs.length}/4</strong>
          </span>
          <button
            onClick={handleRunCompare}
            disabled={selectedSlugs.length < 2 || isComparing}
            className="bg-accent-primary hover:bg-accent-hover disabled:opacity-50 text-white text-xs px-4 py-2 rounded-lg font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Comparing...' : 'Compare Selected'}</span>
          </button>
        </div>
      </div>

      {/* Comparison Output Stream Section */}
      {comparisonText && (
        <div className="bg-surface border border-border-subtle p-6 rounded-2xl">
          <h3 className="font-bold text-sm text-text-primary mb-3">AI Multi-Protocol Comparison</h3>
          <MarkdownRenderer content={comparisonText} isStreaming={isComparing} />
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Protocol Grid List */}
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {filtered.map((p) => {
            const isChecked = selectedSlugs.includes(p.slug);
            return (
              <div
                key={p.id}
                onClick={() => setActiveProtocol(p)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                  activeProtocol?.slug === p.slug
                    ? 'bg-accent-primary/10 border-accent-primary'
                    : 'bg-surface border-border-subtle hover:bg-surface-raised'
                }`}
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-text-primary">{p.name}</h3>
                  </div>
                  <span className="inline-block text-[10px] uppercase font-bold text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded mt-1">
                    {p.category} • {p.layer} Layer
                  </span>
                  <p className="text-xs text-text-secondary mt-1.5 line-clamp-2">{p.summary}</p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelectForCompare(p.slug);
                  }}
                  className={`p-1.5 rounded-lg border text-xs font-semibold shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-accent-primary text-white border-accent-primary'
                      : 'bg-surface-raised border-border-subtle text-text-tertiary hover:text-text-primary'
                  }`}
                  title="Select for side-by-side comparison"
                >
                  <CheckSquare className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Protocol Detail View */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl p-6 space-y-6">
          {activeProtocol ? (
            <>
              <div className="border-b border-border-subtle pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-text-primary">{activeProtocol.name}</h2>
                  <span className="text-xs bg-accent-primary/10 text-accent-primary px-3 py-1 rounded-full font-semibold">
                    OSI: {activeProtocol.layer} Layer
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2">{activeProtocol.summary}</p>
              </div>

              {/* Specs Grid */}
              <div>
                <h4 className="font-bold text-xs text-text-primary mb-3">Protocol Specifications</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  {Object.entries(activeProtocol.specs || {}).map(([k, v]) => (
                    <div key={k} className="p-3 bg-surface-raised border border-border-subtle rounded-lg">
                      <span className="uppercase text-[10px] font-bold text-text-tertiary">{k}</span>
                      <p className="font-semibold text-text-primary mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mermaid Architecture Diagram */}
              {activeProtocol.mermaidDiagram && (
                <div>
                  <h4 className="font-bold text-xs text-text-primary mb-2">Network Architecture Topology</h4>
                  <MermaidDiagram chart={activeProtocol.mermaidDiagram} />
                </div>
              )}

              {/* Pros & Cons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl">
                  <h5 className="font-bold text-semantic-success mb-2">Advantages</h5>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    {activeProtocol.pros?.map((pro, i) => (
                      <li key={i}>{pro}</li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-500/5 border border-rose-500/20 p-4 rounded-xl">
                  <h5 className="font-bold text-semantic-danger mb-2">Limitations</h5>
                  <ul className="list-disc list-inside space-y-1 text-text-secondary">
                    {activeProtocol.cons?.map((con, i) => (
                      <li key={i}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-text-tertiary text-xs">Select a protocol to view specification details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProtocolExplainerView;
