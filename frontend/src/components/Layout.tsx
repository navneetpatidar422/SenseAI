import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar, { FEATURES } from './Sidebar';
import GlobalSearchModal from './GlobalSearchModal';
import Footer from './Footer';

interface LayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ activeTab, setActiveTab, children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentFeat = FEATURES.find((f) => f.id === activeTab);
  const title = currentFeat ? currentFeat.label : 'Dashboard';

  const handleNavigate = (route: string) => {
    if (route.startsWith('/sensors')) setActiveTab('sensors');
    else if (route.startsWith('/protocols')) setActiveTab('protocols');
    else if (route.startsWith('/projects')) setActiveTab('projects');
    else if (route.startsWith('/chat')) setActiveTab('chat');
    else if (route.startsWith('/troubleshoot')) setActiveTab('troubleshoot');
    else if (route.startsWith('/code')) setActiveTab('code');
    else if (route.startsWith('/learning')) setActiveTab('learning');
    else if (route.startsWith('/prompts')) setActiveTab('prompts');
    else if (route.startsWith('/components')) setActiveTab('components');
    else if (route.startsWith('/fault')) setActiveTab('fault');
  };

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Navbar currentFeatureTitle={title} />
      <GlobalSearchModal onNavigate={handleNavigate} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full flex-1">{children}</div>
          <div className="max-w-7xl mx-auto w-full">
            <Footer />
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-border-subtle flex items-center justify-around px-2 z-40">
        {FEATURES.slice(0, 5).map((feat) => {
          const Icon = feat.icon;
          const isActive = activeTab === feat.id;
          return (
            <button
              key={feat.id}
              onClick={() => setActiveTab(feat.id)}
              className={`flex flex-col items-center justify-center space-y-1 py-1 px-2 rounded-lg ${
                isActive ? 'text-accent-primary font-bold' : 'text-text-tertiary hover:text-text-secondary'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] truncate max-w-[50px]">{feat.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Layout;
