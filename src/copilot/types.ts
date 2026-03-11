
import { RunState, SystemState } from '../types';

export interface WorkContext {
  scenario: string | null;
  module: string;
  subModule: string;
  flowStep?: string;
  entity?: { type: string; id: string; name: string };
  userIntent?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  lastAction?: string;
  run?: RunState;
  system_state?: SystemState;
}

export interface CopilotActionDefinition {
  id: string;
  label: string;
  icon?: any; // Lucide icon component
  handler: (context: WorkContext, payload?: any) => Promise<void> | void;
}

export interface CopilotContent {
  title: string;
  content: string;
  actions: string[]; // Action IDs
  type?: 'info' | 'warning' | 'success';
  cards?: CopilotCard[];
}

export interface DrawerSection {
  title: string;
  content: string;
  type?: 'info' | 'warning' | 'analysis' | 'suggestion';
}

export interface DrawerContent {
  title: string;
  sections: DrawerSection[];
  actions: string[]; // Action IDs
  cards?: CopilotCard[];
}

export interface CopilotCard {
  title: string;
  items: string[];
}

export interface CopilotPlugin {
  id: string;
  name: string;
  match: (context: WorkContext) => boolean;
  renderBubble: (context: WorkContext) => CopilotContent | null;
  renderDrawer: (context: WorkContext) => DrawerContent | null;
}

export interface CopilotScript {
  message: string;
  cards?: CopilotCard[];
  actions: { label: string; event: string; primary?: boolean }[];
}

export interface StateMachineConfig {
  id: string;
  scene: string;
  copilotName: string;
  roles: string[];
  initial: string;
  states: Record<string, {
    label: string;
    entry: string[];
    ui?: {
      bubble?: { priority: string; maxWidth: number; avoidSelectors: string[] };
      drawer?: { enabled: boolean; width: number };
    };
    transitions: { event: string; target: string; guard?: string }[];
  }>;
  guards: Record<string, string>;
  actions: Record<string, { type: string; effect: string }>;
}
