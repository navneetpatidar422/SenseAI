import React, { useState } from 'react';
import { GraduationCap, Sparkles, BookOpen, CheckCircle, ArrowRight } from 'lucide-react';
import { streamApi } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const LearningModeView: React.FC = () => {
  const [topic, setTopic] = useState('MQTT Protocol Architecture');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [lessonOutput, setLessonOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const TOPICS = [
    'MQTT Protocol Architecture',
    'ESP32 FreeRTOS Dual Core Tasks',
    'I2C Hardware Bus Timing',
    'Modbus RS-485 Industrial Master-Slave',
    'ADC Quantization & Signal Noise Filters',
    'LoRaWAN LPWAN Mesh Security',
  ];

  const handleStartLesson = async (selectedTopic = topic) => {
    if (isGenerating) return;
    setIsGenerating(true);
    setLessonOutput('');

    try {
      await streamApi(
        '/learning/lessons',
        { topic: selectedTopic, difficulty },
        (token) => setLessonOutput((prev) => prev + token),
        () => setIsGenerating(false),
        (err) => {
          console.error('Lesson stream error:', err);
          setIsGenerating(false);
        }
      );
    } catch (e) {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-200">
      {/* Topic Catalog Sidebar */}
      <div className="lg:col-span-1 bg-surface border border-border-subtle p-5 rounded-2xl space-y-4">
        <div className="flex items-center space-x-3 pb-3 border-b border-border-subtle">
          <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500 border border-orange-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-text-primary">IIoT Learning Catalog</h2>
            <p className="text-[11px] text-text-tertiary">Select a concept topic to generate interactive lessons.</p>
          </div>
        </div>

        {/* Difficulty selector */}
        <div>
          <label className="block text-xs font-semibold text-text-primary mb-1.5">Difficulty Tier</label>
          <div className="flex space-x-1">
            {['Beginner', 'Intermediate', 'Advanced'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  difficulty === diff
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'bg-surface-raised text-text-secondary hover:text-text-primary'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Topics List */}
        <div className="space-y-2 pt-2">
          {TOPICS.map((t) => (
            <div
              key={t}
              onClick={() => {
                setTopic(t);
                handleStartLesson(t);
              }}
              className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                topic === t
                  ? 'bg-accent-primary/10 border-accent-primary text-accent-primary font-bold'
                  : 'bg-surface-raised border-border-subtle text-text-secondary hover:text-text-primary'
              }`}
            >
              <span>{t}</span>
              <ArrowRight className="w-3.5 h-3.5 text-text-tertiary" />
            </div>
          ))}
        </div>
      </div>

      {/* Main Lesson Player */}
      <div className="lg:col-span-2 bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
                {difficulty} Level
              </span>
              <h2 className="text-lg font-bold text-text-primary mt-1">{topic}</h2>
            </div>
            <button
              onClick={() => handleStartLesson()}
              disabled={isGenerating}
              className="bg-accent-primary hover:bg-accent-hover text-white text-xs px-3.5 py-2 rounded-lg font-semibold flex items-center space-x-1.5 transition-all shadow-sm disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Synthesizing Lesson...' : 'Generate Interactive Lesson'}</span>
            </button>
          </div>

          {!lessonOutput && !isGenerating && (
            <div className="text-center py-24 text-text-tertiary text-xs">
              Select a topic from the left catalog to start step-by-step learning with code analogies and quizzes.
            </div>
          )}

          {lessonOutput && <MarkdownRenderer content={lessonOutput} isStreaming={isGenerating} />}
        </div>
      </div>
    </div>
  );
};

export default LearningModeView;
