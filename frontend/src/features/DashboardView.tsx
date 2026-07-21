import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  Wrench,
  Cpu,
  Network,
  Code2,
  FolderPlus,
  Layers,
  Activity,
  GraduationCap,
  BookOpen,
  Zap,
  ArrowRight,
  Flame,
  Clock,
  Pin
} from 'lucide-react';
import { DashboardData } from '../types';
import { fetchApi } from '../lib/api';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi<DashboardData>('/dashboard')
      .then(setData)
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => setLoading(false));
  }, []);

  const QUICK_ACTIONS = [
    { id: 'chat', label: 'Engineering Chat', desc: 'Ask domain questions', icon: MessageSquare, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    { id: 'troubleshoot', label: 'Troubleshooter', desc: 'Hardware fault diagnosis', icon: Wrench, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    { id: 'sensors', label: 'Sensor Hub', desc: 'Specs, pinouts & code', icon: Cpu, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    { id: 'protocols', label: 'Protocol Explainer', desc: 'Compare comm stacks', icon: Network, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
    { id: 'code', label: 'Code Assistant', desc: 'ESP32/Arduino code gen', icon: Code2, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    { id: 'projects', label: 'Project Builder', desc: 'BOM & roadmap plans', icon: FolderPlus, color: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20' },
    { id: 'components', label: 'Component Recs', desc: 'Tradeoff recommendations', icon: Layers, color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
    { id: 'fault', label: 'Fault Diagnosis', desc: 'Health score & priority', icon: Activity, color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
    { id: 'learning', label: 'Learning Mode', icon: GraduationCap, desc: 'Step-by-step lessons', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
    { id: 'prompts', label: 'Prompt Library', desc: 'Ready-made prompts', icon: BookOpen, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-surface to-surface-raised border border-border-subtle p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Welcome back to <span className="text-accent-primary">SenseAI</span>
            </h1>
            <p className="text-sm text-text-secondary mt-1 max-w-2xl">
              Your AI copilot for Industrial IoT learning, sensor pinouts, hardware fault troubleshooting, and firmware code generation.
            </p>
          </div>
          <div className="flex items-center space-x-3 bg-surface border border-border-subtle px-4 py-2.5 rounded-xl shrink-0">
            <Flame className="w-5 h-5 text-semantic-warning animate-pulse" />
            <div>
              <div className="text-xs text-text-tertiary font-medium">Learning Streak</div>
              <div className="text-base font-bold text-text-primary">
                {data?.streak.count || 5} Days Streak!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center space-x-2">
          <Zap className="w-5 h-5 text-accent-primary" />
          <span>Primary Workflows</span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {QUICK_ACTIONS.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.id}
                onClick={() => setActiveTab(act.id)}
                className="bg-surface hover:bg-surface-raised border border-border-subtle hover:border-accent-primary/40 p-4 rounded-xl text-left transition-all group flex flex-col justify-between"
              >
                <div className={`p-2.5 rounded-lg w-fit border mb-3 ${act.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-text-primary group-hover:text-accent-primary transition-colors">
                    {act.label}
                  </h3>
                  <p className="text-[11px] text-text-tertiary mt-0.5 line-clamp-1">{act.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Activity & Pinned Chats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pinned Chats */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5">
            <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center space-x-2">
              <Pin className="w-4 h-4 text-accent-primary" />
              <span>Pinned Conversations</span>
            </h3>
            <div className="space-y-2">
              {data?.pinnedChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveTab('chat')}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-surface-raised/50 hover:bg-surface-raised border border-border-subtle/50 text-left transition-colors"
                >
                  <span className="font-medium text-sm text-text-primary truncate">{chat.title}</span>
                  <ArrowRight className="w-4 h-4 text-text-tertiary" />
                </button>
              ))}
              {(!data?.pinnedChats || data.pinnedChats.length === 0) && (
                <div className="text-xs text-text-tertiary py-3 text-center italic">
                  No pinned chats yet. Pin important conversations to access them quickly here.
                </div>
              )}
            </div>
          </div>

          {/* Popular Sensors Grid */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-text-primary flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-semantic-success" />
                <span>Popular Sensor References</span>
              </h3>
              <button
                onClick={() => setActiveTab('sensors')}
                className="text-xs text-accent-primary hover:underline font-semibold"
              >
                View All Sensors →
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {data?.popularSensors.map((sensor) => (
                <div
                  key={sensor.id}
                  onClick={() => setActiveTab('sensors')}
                  className="p-3 bg-surface-raised border border-border-subtle rounded-lg cursor-pointer hover:border-accent-primary/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-text-primary">{sensor.name}</span>
                    <span className="text-[10px] bg-accent-primary/10 text-accent-primary px-1.5 py-0.5 rounded font-medium">
                      {sensor.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-tertiary mt-1 line-clamp-1">{sensor.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Trending Topics & Streak Heatmap */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="bg-surface border border-border-subtle rounded-xl p-5">
            <h3 className="font-bold text-sm text-text-primary mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-semantic-warning" />
              <span>Trending IIoT Topics</span>
            </h3>
            <div className="space-y-3">
              {data?.trendingTopics.map((topic, i) => (
                <div
                  key={i}
                  onClick={() => setActiveTab('learning')}
                  className="p-3 bg-surface-raised border border-border-subtle/50 rounded-lg cursor-pointer hover:border-accent-primary/30 transition-colors"
                >
                  <span className="text-[10px] font-bold text-accent-primary uppercase tracking-wider">
                    {topic.category}
                  </span>
                  <h4 className="font-semibold text-xs text-text-primary mt-0.5">{topic.title}</h4>
                  <p className="text-[11px] text-text-tertiary mt-1">{topic.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
