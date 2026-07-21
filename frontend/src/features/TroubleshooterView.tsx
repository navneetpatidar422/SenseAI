import React, { useState } from 'react';
import { Wrench, AlertTriangle, Plus, Trash, CheckSquare, Sparkles } from 'lucide-react';
import { streamApi } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';

export const TroubleshooterView: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [behavior, setBehavior] = useState('intermittent');
  const [errorCodes, setErrorCodes] = useState<string[]>(['BROWNOUT_RESET']);
  const [errorCodeInput, setErrorCodeInput] = useState('');
  const [sensorValues, setSensorValues] = useState<Array<{ key: string; value: string }>>([
    { key: 'VCC Voltage', value: '3.12V' },
  ]);
  const [logs, setLogs] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);

  const handleAddErrorCode = () => {
    if (errorCodeInput.trim()) {
      setErrorCodes([...errorCodes, errorCodeInput.trim()]);
      setErrorCodeInput('');
    }
  };

  const handleAddSensorRow = () => {
    setSensorValues([...sensorValues, { key: '', value: '' }]);
  };

  const handleRemoveSensorRow = (idx: number) => {
    setSensorValues(sensorValues.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim() || isDiagnosing) return;

    setIsDiagnosing(true);
    setDiagnosis('');

    try {
      await streamApi(
        '/troubleshoot',
        { symptoms, behavior, errorCodes, sensorValues, logs },
        (token) => {
          setDiagnosis((prev) => prev + token);
        },
        () => setIsDiagnosing(false),
        (err) => {
          console.error('Troubleshoot stream error:', err);
          setIsDiagnosing(false);
        }
      );
    } catch (e) {
      setIsDiagnosing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-200">
      {/* Intake Form */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl space-y-6">
        <div className="flex items-center space-x-3 pb-4 border-b border-border-subtle">
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-text-primary">Smart Fault Troubleshooter</h2>
            <p className="text-xs text-text-secondary">Input symptoms and sensor data to generate ranked causes & fixes.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Symptoms */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">
              Symptom Description <span className="text-semantic-danger">*</span>
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g. DHT22 sensor returns NaN on ESP32 GPIO 4 when Wi-Fi is active..."
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-3 text-text-primary outline-none focus:border-accent-primary min-h-[5rem]"
              required
            />
          </div>

          {/* Machine Behavior */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">Machine / Hardware Behavior</label>
            <select
              value={behavior}
              onChange={(e) => setBehavior(e.target.value)}
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 text-text-primary outline-none focus:border-accent-primary"
            >
              <option value="intermittent">Intermittent / Occasional Failure</option>
              <option value="constant">Constant Failure / Total Dead</option>
              <option value="on startup">Fails on Power-Up / Startup</option>
              <option value="under load">Fails Under Load / Transmit</option>
            </select>
          </div>

          {/* Error Codes Tag Input */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">Error Codes / Exceptions</label>
            <div className="flex space-x-2 mb-2">
              <input
                type="text"
                value={errorCodeInput}
                onChange={(e) => setErrorCodeInput(e.target.value)}
                placeholder="e.g. E_TIMEOUT, 0x05, BROWNOUT"
                className="flex-1 bg-surface-raised border border-border-subtle rounded-lg p-2 text-text-primary outline-none"
              />
              <button
                type="button"
                onClick={handleAddErrorCode}
                className="bg-surface-raised hover:bg-border-subtle border border-border-subtle px-3 rounded-lg font-medium"
              >
                Add Code
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {errorCodes.map((code, idx) => (
                <span key={idx} className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[11px] font-mono flex items-center space-x-1">
                  <span>{code}</span>
                  <button onClick={() => setErrorCodes(errorCodes.filter((_, i) => i !== idx))}>×</button>
                </span>
              ))}
            </div>
          </div>

          {/* Key-Value Sensor Rows */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-semibold text-text-primary">Measured Sensor/Voltage Values</label>
              <button type="button" onClick={handleAddSensorRow} className="text-accent-primary flex items-center space-x-1 font-semibold">
                <Plus className="w-3 h-3" />
                <span>Add Row</span>
              </button>
            </div>
            <div className="space-y-2">
              {sensorValues.map((row, idx) => (
                <div key={idx} className="flex space-x-2 items-center">
                  <input
                    type="text"
                    placeholder="Parameter (e.g. VCC)"
                    value={row.key}
                    onChange={(e) => {
                      const newVals = [...sensorValues];
                      newVals[idx].key = e.target.value;
                      setSensorValues(newVals);
                    }}
                    className="flex-1 bg-surface-raised border border-border-subtle p-2 rounded-lg outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g. 3.3V)"
                    value={row.value}
                    onChange={(e) => {
                      const newVals = [...sensorValues];
                      newVals[idx].value = e.target.value;
                      setSensorValues(newVals);
                    }}
                    className="flex-1 bg-surface-raised border border-border-subtle p-2 rounded-lg outline-none"
                  />
                  <button type="button" onClick={() => handleRemoveSensorRow(idx)} className="text-text-tertiary hover:text-semantic-danger">
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Logs */}
          <div>
            <label className="block font-semibold text-text-primary mb-1">Console Logs / Serial Output</label>
            <textarea
              value={logs}
              onChange={(e) => setLogs(e.target.value)}
              placeholder="Paste raw serial monitor logs or stack trace..."
              className="w-full bg-surface-raised border border-border-subtle rounded-lg p-2.5 font-mono text-[11px] text-text-primary outline-none min-h-[4rem]"
            />
          </div>

          <button
            type="submit"
            disabled={isDiagnosing || !symptoms.trim()}
            className="w-full bg-accent-primary hover:bg-accent-hover text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isDiagnosing ? 'Analyzing Fault Telemetry...' : 'Generate AI Fault Diagnosis'}</span>
          </button>
        </form>
      </div>

      {/* Output Results Card */}
      <div className="bg-surface border border-border-subtle p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <h3 className="text-base font-bold text-text-primary mb-4 flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-accent-primary" />
            <span>AI Fault Diagnosis Report</span>
          </h3>

          {!diagnosis && !isDiagnosing && (
            <div className="text-center py-16 text-text-tertiary text-xs">
              Fill in hardware symptoms and submit to view structured ranked causes and testing steps.
            </div>
          )}

          {diagnosis && <MarkdownRenderer content={diagnosis} isStreaming={isDiagnosing} />}
        </div>
      </div>
    </div>
  );
};

export default TroubleshooterView;
