import React, { useState } from 'react';
import { FolderPlus, Sparkles, Save, Check } from 'lucide-react';
import { streamApi, fetchApi } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const ProjectBuilderView: React.FC = () => {
  const [idea, setIdea] = useState('');
  const [budget, setBudget] = useState(3000);
  const [currency, setCurrency] = useState('INR (₹)');
  const [microcontroller, setMicrocontroller] = useState('ESP32');
  const [sensors, setSensors] = useState<string[]>(['DHT22', 'Soil Moisture']);
  const [sensorInput, setSensorInput] = useState('');
  const [planOutput, setPlanOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleAddSensor = () => {
    if (sensorInput.trim()) {
      setSensors([...sensors, sensorInput.trim()]);
      setSensorInput('');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isGenerating) return;

    setIsGenerating(true);
    setPlanOutput('');
    setSaved(false);

    try {
      await streamApi(
        '/projects/generate',
        { idea, budget, currency, microcontroller, sensors },
        (token) => setPlanOutput((prev) => prev + token),
        () => setIsGenerating(false),
        (err) => {
          console.error('Project generation error:', err);
          setIsGenerating(false);
        }
      );
    } catch (e) {
      setIsGenerating(false);
    }
  };

  const handleSaveProject = async () => {
    try {
      await fetchApi('/projects', {
        method: 'POST',
        body: JSON.stringify({
          title: idea.substring(0, 35),
          idea,
          budget,
          currency,
          microcontroller,
          architectureDiagram: '',
          estimatedTotalCost: budget * 0.7,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('Save project failed:', e);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
      {/* Intake Form */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-border-subtle">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">End-to-End Project Planner</h2>
            <p className="text-xs text-text-secondary">Turn your IoT idea into a 7-section blueprint & itemized BOM.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Idea Description */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Project Concept / Goal <span className="text-semantic-danger">*</span>
            </label>
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. Solar powered smart agricultural irrigation system monitoring soil moisture across 4 zones with automated solenoid valves..."
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-3 text-text-primary outline-none focus:border-accent-primary min-h-[6rem]"
              required
            />
          </div>

          {/* Budget & Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-text-primary mb-1">Target Budget</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-primary mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none"
              >
                <option value="INR (₹)">INR (₹)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* Microcontroller */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">Target Controller</label>
            <select
              value={microcontroller}
              onChange={(e) => setMicrocontroller(e.target.value)}
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none"
            >
              <option value="ESP32">ESP32 (Wi-Fi + BLE dual-core)</option>
              <option value="Arduino Uno R3">Arduino Uno R3 (8-bit classic)</option>
              <option value="Raspberry Pi Pico W">Raspberry Pi Pico W (RP2040)</option>
              <option value="Raspberry Pi 4 Model B">Raspberry Pi 4 Model B (SBC)</option>
            </select>
          </div>

          {/* Sensors Multi Select */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">Peripherals / Sensors Available</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={sensorInput}
                onChange={(e) => setSensorInput(e.target.value)}
                placeholder="Add sensor or actuator..."
                className="flex-1 bg-surface-raised border border-border-subtle rounded-lg p-2 text-text-primary outline-none"
              />
              <button
                type="button"
                onClick={handleAddSensor}
                className="bg-surface-raised border border-border-subtle px-3 rounded-lg font-medium"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {sensors.map((s, idx) => (
                <span key={idx} className="bg-cyan-500/10 text-cyan-500 border border-cyan-500/20 px-2 py-0.5 rounded text-[11px] flex items-center space-x-1">
                  <span>{s}</span>
                  <button type="button" onClick={() => setSensors(sensors.filter((_, i) => i !== idx))}>×</button>
                </span>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating || !idea.trim()}
            className="w-full bg-accent-primary hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isGenerating ? 'Synthesizing Architecture & BOM Plan...' : 'Generate 7-Section Project Plan'}</span>
          </button>
        </form>
      </div>

      {/* Output Blueprint Card */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
            <h3 className="text-base font-bold text-text-primary">Generated Project Blueprint</h3>
            {planOutput && !isGenerating && (
              <button
                onClick={handleSaveProject}
                className="flex items-center space-x-1 text-xs bg-surface-raised border border-border-subtle hover:bg-accent-primary hover:text-white px-3 py-1.5 rounded-lg transition-all"
              >
                {saved ? <Check className="w-3.5 h-3.5 text-semantic-success" /> : <Save className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved to Projects' : 'Save Plan'}</span>
              </button>
            )}
          </div>

          {!planOutput && !isGenerating && (
            <div className="text-center py-24 text-text-tertiary text-xs">
              Input your project idea and constraints to receive a full architecture blueprint, roadmap, and itemized component pricing.
            </div>
          )}

          {planOutput && <MarkdownRenderer content={planOutput} isStreaming={isGenerating} />}
        </div>
      </div>
    </div>
  );
};

export default ProjectBuilderView;
