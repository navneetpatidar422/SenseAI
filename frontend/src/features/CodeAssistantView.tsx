import React, { useState } from 'react';
import { Code2, Sparkles, Download, Copy, Play } from 'lucide-react';
import { streamApi } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const CodeAssistantView: React.FC = () => {
  const [platform, setPlatform] = useState('ESP32');
  const [language, setLanguage] = useState('C++');
  const [prompt, setPrompt] = useState('');
  const [generatedOutput, setGeneratedOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const PLATFORMS = ['Arduino Uno', 'ESP32', 'Raspberry Pi', 'NodeMCU ESP8266', 'PlatformIO'];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setGeneratedOutput('');

    try {
      await streamApi(
        '/code/generate',
        { platform, language, prompt },
        (token) => setGeneratedOutput((prev) => prev + token),
        () => setIsGenerating(false),
        (err) => {
          console.error('Code generation error:', err);
          setIsGenerating(false);
        }
      );
    } catch (e) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
      {/* Configuration Form */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-border-subtle">
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Firmware Code Generator</h2>
            <p className="text-xs text-text-secondary">Generate production-ready C++ / MicroPython firmware sketches.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Target Platform Selector */}
          <div>
            <label className="block font-semibold text-text-primary mb-2">Target Hardware Platform</label>
            <div className="grid grid-cols-3 gap-2">
              {PLATFORMS.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`p-2.5 rounded-xl border font-semibold transition-all ${
                    platform === p
                      ? 'bg-accent-primary text-white border-accent-primary shadow-sm'
                      : 'bg-surface-raised border-border-subtle text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Language Toggle */}
          <div>
            <label className="block font-semibold text-text-primary mb-2">Programming Language</label>
            <div className="flex space-x-2">
              {['C++', 'MicroPython'].map((lang) => (
                <button
                  type="button"
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 p-2 rounded-lg border font-semibold transition-all ${
                    language === lang
                      ? 'bg-accent-primary text-white border-accent-primary'
                      : 'bg-surface-raised border-border-subtle text-text-secondary'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Description */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Firmware Functional Requirements <span className="text-semantic-danger">*</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Read analog sensor pin 34 every 5 seconds, average 10 readings, and publish JSON telemetry over Wi-Fi HTTP POST..."
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-3 text-text-primary outline-none focus:border-accent-primary min-h-[7rem]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-accent-primary hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Firmware Code...' : 'Generate Code & Explanation'}</span>
          </button>
        </form>
      </div>

      {/* Generated Code & Explanation Output */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary mb-4 flex items-center space-x-2">
            <Play className="w-4 h-4 text-accent-primary" />
            <span>Generated Code & Hardware Explanation</span>
          </h3>

          {!generatedOutput && !isGenerating && (
            <div className="text-center py-24 text-text-tertiary text-xs">
              Configure target platform and describe functional requirements to generate code.
            </div>
          )}

          {generatedOutput && <MarkdownRenderer content={generatedOutput} isStreaming={isGenerating} />}
        </div>
      </div>
    </div>
  );
};

export default CodeAssistantView;
