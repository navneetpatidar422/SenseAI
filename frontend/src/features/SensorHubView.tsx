import React, { useState, useEffect } from 'react';
import { Cpu, Search, Check, Copy, FileCode, Sliders, AlertTriangle } from 'lucide-react';
import { Sensor } from '../types';
import { fetchApi, streamApi } from '../lib/api';
import MarkdownRenderer from '../components/MarkdownRenderer';
import CodeViewer from '../components/CodeViewer';

export const SensorHubView: React.FC = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSensor, setActiveSensor] = useState<Sensor | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'pinout' | 'specs' | 'code' | 'calibration' | 'aiExplainer'>('overview');
  const [aiExplanation, setAiExplanation] = useState('');
  const [isExplaining, setIsExplaining] = useState(false);

  useEffect(() => {
    fetchApi<Sensor[]>('/sensors')
      .then((data) => {
        setSensors(data);
        if (data.length > 0 && !activeSensor) setActiveSensor(data[0]);
      })
      .catch((err) => console.error('Sensors fetch error:', err));
  }, []);

  const CATEGORIES = ['All', 'Environmental', 'Motion', 'Gas', 'Electrical', 'Pressure', 'Proximity', 'Optical', 'Biometric'];

  const filteredSensors = sensors.filter((s) => {
    const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
    const matchesQ =
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQ;
  });

  const handleTabChange = async (tab: any) => {
    setActiveTab(tab);
    if (tab === 'aiExplainer' && activeSensor && !aiExplanation) {
      setIsExplaining(true);
      try {
        await streamApi(
          `/sensors/${activeSensor.slug}/explain`,
          { tab: 'deep-dive' },
          (token) => setAiExplanation((prev) => prev + token),
          () => setIsExplaining(false)
        );
      } catch (e) {
        setIsExplaining(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface border border-border-subtle p-4 rounded-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-tertiary absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 30+ sensors (MQ-135, DHT22...)"
            className="w-full bg-surface-raised border border-border-subtle rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary outline-none focus:border-accent-primary"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'bg-surface-raised text-text-secondary hover:text-text-primary'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Sensor Cards Grid & Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sensor Cards List */}
        <div className="lg:col-span-1 space-y-3 max-h-[calc(100vh-14rem)] overflow-y-auto pr-1">
          {filteredSensors.map((sensor) => (
            <div
              key={sensor.id}
              onClick={() => {
                setActiveSensor(sensor);
                setAiExplanation('');
                setActiveTab('overview');
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                activeSensor?.slug === sensor.slug
                  ? 'bg-accent-primary/10 border-accent-primary shadow-sm'
                  : 'bg-surface border-border-subtle hover:bg-surface-raised'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-text-primary">{sensor.name}</h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-surface-raised border border-border-subtle text-accent-primary">
                  {sensor.category}
                </span>
              </div>
              <p className="text-xs text-text-secondary mt-1 line-clamp-2">{sensor.description}</p>
              <div className="mt-2 flex items-center space-x-3 text-[11px] text-text-tertiary">
                <span>VCC: {sensor.specs?.voltage}</span>
                <span>•</span>
                <span>Interface: {sensor.specs?.interface}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Sensor Detail Drawer */}
        <div className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl p-6 flex flex-col justify-between">
          {activeSensor ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-border-subtle pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-xl font-extrabold text-text-primary">{activeSensor.name}</h2>
                    <span className="text-xs bg-accent-primary/10 text-accent-primary px-2.5 py-0.5 rounded-full font-semibold">
                      {activeSensor.category}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{activeSensor.description}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-2 border-b border-border-subtle pb-2 overflow-x-auto">
                {['overview', 'pinout', 'specs', 'code', 'calibration', 'aiExplainer'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                      activeTab === tab
                        ? 'bg-accent-primary text-white'
                        : 'text-text-secondary hover:bg-surface-raised'
                    }`}
                  >
                    {tab === 'aiExplainer' ? 'AI Deep Dive' : tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-text-primary mb-1">Industrial Use Cases</h4>
                    <p className="text-text-secondary bg-surface-raised p-3 rounded-lg border border-border-subtle">
                      {activeSensor.industrialUse}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-text-primary mb-1 text-semantic-danger flex items-center space-x-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Common Mistakes & Pitfalls</span>
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-text-secondary">
                      {activeSensor.commonMistakes?.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'pinout' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-xs text-text-primary">Pinout Configuration</h4>
                  <div className="overflow-x-auto border border-border-subtle rounded-lg">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-surface-raised text-text-primary">
                        <tr>
                          <th className="p-2.5">Pin Name</th>
                          <th className="p-2.5">Function</th>
                          <th className="p-2.5">Engineering Note</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle text-text-secondary">
                        {activeSensor.pinout?.map((p, idx) => (
                          <tr key={idx} className="hover:bg-surface-raised/40">
                            <td className="p-2.5 font-bold font-mono text-accent-primary">{p.pin}</td>
                            <td className="p-2.5">{p.function}</td>
                            <td className="p-2.5 text-text-tertiary">{p.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {Object.entries(activeSensor.specs || {}).map(([k, v]) => (
                    <div key={k} className="p-3 bg-surface-raised rounded-lg border border-border-subtle">
                      <div className="uppercase text-[10px] font-bold text-text-tertiary">{k}</div>
                      <div className="font-semibold text-text-primary mt-0.5">{v}</div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'code' && (
                <div>
                  <CodeViewer
                    code={Object.values(activeSensor.sampleCode || {})[0] || '// Sample code unavailable'}
                    language="cpp"
                  />
                </div>
              )}

              {activeTab === 'calibration' && (
                <div className="bg-surface-raised p-4 rounded-xl border border-border-subtle text-xs text-text-secondary leading-relaxed">
                  <h4 className="font-bold text-text-primary mb-2">Calibration & Setup Procedure</h4>
                  <p>{activeSensor.calibrationGuide}</p>
                </div>
              )}

              {activeTab === 'aiExplainer' && (
                <div className="text-xs text-text-secondary">
                  {!aiExplanation && isExplaining && <div>Generating deep-dive AI analysis for {activeSensor.name}...</div>}
                  {aiExplanation && <MarkdownRenderer content={aiExplanation} isStreaming={isExplaining} />}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-text-tertiary text-xs">Select a sensor to view details</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SensorHubView;
