export interface Chat {
  id: string;
  title: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
}

export interface Sensor {
  id: string;
  slug: string;
  name: string;
  category: 'Environmental' | 'Motion' | 'Gas' | 'Electrical' | 'Pressure' | 'Proximity' | 'Optical' | 'Biometric';
  description: string;
  aliases: string[];
  specs: {
    voltage: string;
    interface: string;
    range: string;
    accuracy: string;
    powerConsumption: string;
  };
  pinout: Array<{ pin: string; function: string; note: string }>;
  sampleCode: Record<string, string>;
  calibrationGuide: string;
  industrialUse: string;
  commonMistakes: string[];
}

export interface Protocol {
  id: string;
  slug: string;
  name: string;
  category: 'Wireless' | 'Wired' | 'Industrial' | 'Web';
  layer: 'Application' | 'Transport' | 'Network' | 'Data Link' | 'Physical';
  summary: string;
  mermaidDiagram: string;
  specs: {
    range: string;
    power: string;
    dataRate: string;
    topology: string;
    latency: string;
    cost: string;
  };
  pros: string[];
  cons: string[];
  realWorldUseCases: string[];
}

export interface ProjectPlan {
  id?: string;
  title: string;
  idea: string;
  budget: number;
  currency: string;
  microcontroller: string;
  architectureDiagram: string;
  components: Array<{
    name: string;
    quantity: number;
    estimatedPrice: number;
    notes: string;
  }>;
  connectionFlow: string[];
  roadmap: Array<{
    phase: string;
    title: string;
    description: string;
    duration: string;
  }>;
  estimatedTotalCost: number;
  challenges: Array<{
    challenge: string;
    mitigation: string;
  }>;
  futureImprovements: string[];
}

export interface ComponentRecommendation {
  category: string;
  recommendedComponent: string;
  priceBand: string;
  rationale: string;
  tradeoffVsAlternative: string;
  alternativeComponent: string;
}

export interface FaultDiagnosisResult {
  healthScore: number;
  rationale: string;
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  probableFaults: Array<{
    fault: string;
    probabilityPercent: number;
    description: string;
  }>;
  suggestedActions: string[];
  safetyWarnings: string[];
}

export interface TroubleshooterResult {
  rankedCauses: Array<{
    cause: string;
    confidencePercent: number;
    description: string;
  }>;
  recommendedFixes: string[];
  safetyWarnings: string[];
  testingChecklist: string[];
  preventionTips: string[];
}

export interface LearningLesson {
  id: string;
  topic: string;
  title: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: Array<{
    stepNumber: number;
    title: string;
    content: string;
    analogy?: string;
    exampleCode?: string;
  }>;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  practiceTask: {
    title: string;
    instructions: string;
  };
}

export interface LearningProgress {
  topicId: string;
  topicTitle: string;
  currentStep: number;
  totalSteps: number;
  completed: boolean;
  quizPassed: boolean;
  updatedAt: string;
}

export interface PromptItem {
  id: string;
  category: 'Troubleshooting' | 'Sensors' | 'Protocols' | 'Code' | 'Project Ideas' | 'Learning';
  title: string;
  preview: string;
  content: string;
  targetFeature: string;
  isFavorite: boolean;
}

export interface GlobalSearchResult {
  category: 'Sensors' | 'Protocols' | 'Projects' | 'Chats' | 'Prompts' | 'Learning';
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

export interface DashboardData {
  recentActivity: Array<{
    id: string;
    type: 'chat' | 'troubleshoot' | 'project' | 'lesson';
    title: string;
    timestamp: string;
    route: string;
  }>;
  pinnedChats: Chat[];
  streak: {
    count: number;
    lastActiveDate: string;
    heatStrip: boolean[];
  };
  popularSensors: Sensor[];
  trendingTopics: Array<{
    title: string;
    category: string;
    summary: string;
    route: string;
  }>;
}
