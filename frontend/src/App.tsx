import React, { useState } from 'react';
import Layout from './components/Layout';
import DashboardView from './features/DashboardView';
import ChatView from './features/ChatView';
import TroubleshooterView from './features/TroubleshooterView';
import SensorHubView from './features/SensorHubView';
import ProtocolExplainerView from './features/ProtocolExplainerView';
import CodeAssistantView from './features/CodeAssistantView';
import ProjectBuilderView from './features/ProjectBuilderView';
import ComponentRecommendationView from './features/ComponentRecommendationView';
import FaultDiagnosisView from './features/FaultDiagnosisView';
import LearningModeView from './features/LearningModeView';
import PromptLibraryView from './features/PromptLibraryView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'chat':
        return <ChatView />;
      case 'troubleshoot':
        return <TroubleshooterView />;
      case 'sensors':
        return <SensorHubView />;
      case 'protocols':
        return <ProtocolExplainerView />;
      case 'code':
        return <CodeAssistantView />;
      case 'projects':
        return <ProjectBuilderView />;
      case 'components':
        return <ComponentRecommendationView />;
      case 'fault':
        return <FaultDiagnosisView />;
      case 'learning':
        return <LearningModeView />;
      case 'prompts':
        return <PromptLibraryView setActiveTab={setActiveTab} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </Layout>
  );
};

export default App;
