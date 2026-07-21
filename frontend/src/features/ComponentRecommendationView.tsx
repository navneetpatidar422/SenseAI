import React, { useState } from 'react';
import { Layers, Sparkles } from 'lucide-react';
import { streamApi } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const ComponentRecommendationView: React.FC = () => {
  const [useCase, setUseCase] = useState('');
  const [categories, setCategories] = useState<string[]>(['Sensors', 'Microcontroller', 'Communication']);
  const [environment, setEnvironment] = useState('Outdoor / Field');
  const [power, setPower] = useState('Solar + Battery');
  const [budget, setBudget] = useState('Economy');
  const [precision, setPrecision] = useState('High Precision');
  const [recommendations, setRecommendations] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const ALL_CATS = ['Sensors', 'Microcontroller', 'Communication', 'Power Supply', 'Display', 'Actuator'];

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      setCategories(categories.filter((c) => c !== cat));
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!useCase.trim() || isGenerating) return;

    setIsGenerating(true);
    setRecommendations('');

    try {
      await streamApi(
        '/components/recommend',
        { categories, useCase, environment, power, budget, precision },
        (token) => setRecommendations((prev) => prev + token),
        () => setIsGenerating(false),
        (err) => {
          console.error('Component recommendation error:', err);
          setIsGenerating(false);
        }
      );
    } catch (e) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
      {/* Requirement Form */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-border-subtle">
          <div className="p-2.5 rounded-lg bg-teal-500/10 text-teal-500 border border-teal-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Component Recommendation Engine</h2>
            <p className="text-xs text-text-secondary">Find ranked hardware options with rationale & tradeoff comparisons.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Application & Project Use Case <span className="text-semantic-danger">*</span>
            </label>
            <textarea
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              placeholder="e.g. Remote weather station measuring ambient pressure and temperature transmitting data over 5km distance..."
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-3 text-text-primary outline-none focus:border-accent-primary min-h-[5rem]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-text-primary mb-2">Requested Component Categories</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATS.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    categories.includes(cat)
                      ? 'bg-accent-primary text-white border-accent-primary'
                      : 'bg-surface-raised border-border-subtle text-text-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Operating Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none"
              >
                <option value="Indoor / Lab">Indoor / Lab Environment</option>
                <option value="Outdoor / Field">Outdoor / Weather Exposed</option>
                <option value="Industrial Factory Floor">Industrial Factory Floor</option>
                <option value="High Vibration / Extreme Heat">High Vibration / Extreme Heat</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-text-primary mb-1">Power Constraint</label>
              <select
                value={power}
                onChange={(e) => setPower(e.target.value)}
                className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none"
              >
                <option value="Mains Power (5V/12V)">Continuous Mains Power (5V/12V)</option>
                <option value="Battery (Coin Cell)">Coin Cell Battery (Ultra Low Power)</option>
                <option value="Solar + Battery">Solar Panel + LiFePO4 Battery</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !useCase.trim()}
            className="w-full bg-accent-primary hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Evaluating Tradeoffs...' : 'Recommend Components'}</span>
          </button>
        </form>
      </div>

      {/* Output Recommendations Card */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary mb-4">Ranked Component Recommendations</h3>
          {!recommendations && !isGenerating && (
            <div className="text-center py-24 text-text-tertiary text-xs">
              State your hardware constraints to evaluate optimal sensor, MCU, and transceiver options.
            </div>
          )}
          {recommendations && <MarkdownRenderer content={recommendations} isStreaming={isGenerating} />}
        </div>
      </div>
    </div>
  );
};

export default ComponentRecommendationView;
