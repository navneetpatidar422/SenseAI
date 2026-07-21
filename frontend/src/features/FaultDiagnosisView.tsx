import React, { useState } from 'react';
import { Activity, Plus, Trash, Sparkles } from 'lucide-react';
import { streamApi } from '../lib/api';
import HealthGauge from '../components/HealthGauge';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const FaultDiagnosisView: React.FC = () => {
  const [equipmentType, setEquipmentType] = useState('Industrial Motor');
  const [parameters, setParameters] = useState([
    { name: 'Vibration Amplitude', value: '4.8', unit: 'mm/s', normal: '< 2.5 mm/s' },
    { name: 'Housing Temperature', value: '82', unit: '°C', normal: '< 65 °C' },
    { name: 'Phase Current A', value: '18.4', unit: 'A', normal: '12.0 A' },
  ]);
  const [diagnosisReport, setDiagnosisReport] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const handleAddParam = () => {
    setParameters([...parameters, { name: '', value: '', unit: '', normal: '' }]);
  };

  const handleRemoveParam = (idx: number) => {
    setParameters(parameters.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEvaluating) return;

    setIsEvaluating(true);
    setDiagnosisReport('');

    try {
      await streamApi(
        '/fault-diagnosis',
        { equipmentType, parameters },
        (token) => setDiagnosisReport((prev) => prev + token),
        () => setIsEvaluating(false),
        (err) => {
          console.error('Fault diagnosis error:', err);
          setIsEvaluating(false);
        }
      );
    } catch (e) {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
      {/* Parameter Entry Form */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-border-subtle">
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Industrial Health Assessment</h2>
            <p className="text-xs text-text-secondary">Analyze multi-sensor machine telemetry to compute health score & fault risk.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-text-primary mb-1">Equipment / Machine Type</label>
            <select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none"
            >
              <option value="Industrial Motor">3-Phase AC Induction Motor</option>
              <option value="Centrifugal Pump">Centrifugal Liquid Pump</option>
              <option value="Rotary Screw Compressor">Rotary Screw Air Compressor</option>
              <option value="Hydraulic Power Unit">Hydraulic Power Pack</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold text-text-primary">Active Telemetry Measurements</label>
              <button
                type="button"
                onClick={handleAddParam}
                className="text-accent-primary font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Sensor Parameter</span>
              </button>
            </div>

            <div className="space-y-2">
              {parameters.map((p, idx) => (
                <div key={idx} className="grid grid-cols-4 gap-2 items-center bg-surface-raised/40 p-2 rounded-lg border border-border-subtle/50">
                  <input
                    type="text"
                    placeholder="Name (e.g. Temp)"
                    value={p.name}
                    onChange={(e) => {
                      const copy = [...parameters];
                      copy[idx].name = e.target.value;
                      setParameters(copy);
                    }}
                    className="bg-surface-raised border border-border-subtle p-1.5 rounded outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (82)"
                    value={p.value}
                    onChange={(e) => {
                      const copy = [...parameters];
                      copy[idx].value = e.target.value;
                      setParameters(copy);
                    }}
                    className="bg-surface-raised border border-border-subtle p-1.5 rounded outline-none font-semibold text-accent-primary"
                  />
                  <input
                    type="text"
                    placeholder="Unit (°C)"
                    value={p.unit}
                    onChange={(e) => {
                      const copy = [...parameters];
                      copy[idx].unit = e.target.value;
                      setParameters(copy);
                    }}
                    className="bg-surface-raised border border-border-subtle p-1.5 rounded outline-none"
                  />
                  <div className="flex items-center space-x-1">
                    <input
                      type="text"
                      placeholder="Normal (<65)"
                      value={p.normal}
                      onChange={(e) => {
                        const copy = [...parameters];
                        copy[idx].normal = e.target.value;
                        setParameters(copy);
                      }}
                      className="bg-surface-raised border border-border-subtle p-1.5 rounded outline-none w-full"
                    />
                    <button type="button" onClick={() => handleRemoveParam(idx)} className="text-text-tertiary hover:text-semantic-danger">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isEvaluating}
            className="w-full bg-accent-primary hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isEvaluating ? 'Evaluating Machine Health...' : 'Compute Health Score & Fault Priority'}</span>
          </button>
        </form>
      </div>

      {/* Assessment Output Card */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
            <h3 className="text-base font-bold text-text-primary">Equipment Health Report</h3>
            {diagnosisReport && <HealthGauge score={62} size={110} />}
          </div>

          {!diagnosisReport && !isEvaluating && (
            <div className="text-center py-24 text-text-tertiary text-xs">
              Input current vibration, temperature, and electrical readings to compute health score.
            </div>
          )}

          {diagnosisReport && <MarkdownRenderer content={diagnosisReport} isStreaming={isEvaluating} />}
        </div>
      </div>
    </div>
  );
};

export default FaultDiagnosisView;
