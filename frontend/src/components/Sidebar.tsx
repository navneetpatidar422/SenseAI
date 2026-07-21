import React from 'react';
import {
  LayoutDashboard,
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
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export const FEATURES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'chat', label: 'AI Engineering Chat', icon: MessageSquare },
  { id: 'troubleshoot', label: 'Smart Troubleshooter', icon: Wrench },
  { id: 'sensors', label: 'Sensor Knowledge Hub', icon: Cpu },
  { id: 'protocols', label: 'Protocol Explainer', icon: Network },
  { id: 'code', label: 'Code Assistant', icon: Code2 },
  { id: 'projects', label: 'Project Builder', icon: FolderPlus },
  { id: 'components', label: 'Component Recs', icon: Layers },
  { id: 'fault', label: 'Industrial Fault Diag', icon: Activity },
  { id: 'learning', label: 'Learning Mode', icon: GraduationCap },
  { id: 'prompts', label: 'Prompt Library', icon: BookOpen },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const { chats, createNewChat, selectChat, activeChatId } = useChatStore();

  return (
    <aside
      className={`bg-surface border-r border-border-subtle flex flex-col transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } hidden md:flex sticky top-14 h-[calc(100vh-3.5rem)]`}
    >
      {/* Toggle Collapse */}
      <div className="p-3 flex justify-end border-b border-border-subtle/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-surface-raised text-text-tertiary hover:text-text-primary transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
        {FEATURES.map((feat) => {
          const Icon = feat.icon;
          const isActive = activeTab === feat.id;
          return (
            <button
              key={feat.id}
              onClick={() => setActiveTab(feat.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:bg-surface-raised hover:text-text-primary'
              }`}
              title={collapsed ? feat.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span className="truncate">{feat.label}</span>}
            </button>
          );
        })}

        {/* Chat History Section */}
        {!collapsed && (
          <div className="pt-4 border-t border-border-subtle/50 mt-4 px-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-tertiary">
                Recent Chats
              </span>
              <button
                onClick={() => {
                  createNewChat();
                  setActiveTab('chat');
                }}
                className="p-1 text-accent-primary hover:bg-accent-primary/10 rounded transition-colors"
                title="New Chat"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => {
                    selectChat(chat.id);
                    setActiveTab('chat');
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs truncate transition-colors ${
                    activeChatId === chat.id
                      ? 'bg-surface-raised text-accent-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-raised/50'
                  }`}
                >
                  {chat.pinned ? '📌 ' : ''}
                  {chat.title}
                </button>
              ))}
              {chats.length === 0 && (
                <div className="text-xs text-text-tertiary italic px-1">No saved chats</div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
