import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WorkContext } from '../types';
import { useLocation } from 'react-router-dom';
import { ChatMessage, PersonaEngine, BubbleModel, DrawerModel } from './PersonaEngine';
import { useGlobalStore } from '../../store/GlobalStore';

interface CopilotState {
  context: WorkContext;
  contextKey: string;
  isDrawerOpen: boolean;
  activePluginId: string | null;
  lastTriggerTime: number;
  isQuietMode: boolean;
  // New Chat State
  chatHistory: ChatMessage[];
  isThinking: boolean;
  notification: { title: string; content: string; type?: 'info' | 'warning' | 'success' | 'error'; isLarge?: boolean } | null;
  // Engine Models
  bubbleModel: BubbleModel | null;
  drawerModel: DrawerModel | null;
}

type Action =
  | { type: 'UPDATE_CONTEXT'; payload: Partial<WorkContext> & { globalState?: any } }
  | { type: 'TOGGLE_DRAWER'; payload?: boolean }
  | { type: 'SET_ACTIVE_PLUGIN'; payload: string | null }
  | { type: 'TRIGGER_COPILOT'; payload: number }
  | { type: 'TOGGLE_QUIET_MODE' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: { title: string; content: string; type?: 'info' | 'warning' | 'success' | 'error'; isLarge?: boolean } | null }
  | { type: 'CLEAR_CHAT' };

const initialState: CopilotState = {
  context: {
    scenario: null,
    module: 'overview',
    subModule: '',
  },
  contextKey: '',
  isDrawerOpen: false,
  activePluginId: null,
  lastTriggerTime: 0,
  isQuietMode: false,
  chatHistory: [],
  isThinking: false,
  notification: null,
  bubbleModel: null,
  drawerModel: null,
};

const CopilotContext = createContext<{
  state: CopilotState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

function copilotReducer(state: CopilotState, action: Action): CopilotState {
  switch (action.type) {
    case 'UPDATE_CONTEXT': {
      const newContext = { ...state.context, ...action.payload };
      const keyParts = [
        newContext.scenario,
        newContext.module,
        newContext.subModule,
        newContext.flowStep,
        newContext.entity?.id,
        newContext.userIntent,
        newContext.run?.stage,
        newContext.run?.evidenceChain.diagnosis.status,
        newContext.run?.execution.mitigationCycle,
        newContext.run?.outputs.caseRecord.status,
        newContext.run?.outputs.knowledgeRecord.status,
        newContext.run?.evidenceChain.verification.uav.status,
        newContext.run?.evidenceChain.verification.uav.progress !== undefined ? `p${newContext.run.evidenceChain.verification.uav.progress}` : ''
      ];
      const newKey = keyParts.filter(p => p !== undefined && p !== null && p !== '').join('|');
      
      // Calculate Engine Models
      let bubbleModel = state.bubbleModel;
      let drawerModel = state.drawerModel;
      let chatHistory = state.chatHistory;
      
      if (newContext.scenario === 'powerops' && newContext.run) {
        // If on HOME sub-module, use overview engine
        if (newContext.subModule === 'HOME') {
          const engineOutput = PersonaEngine.getOverviewEngineOutput(action.payload.globalState || {}, newContext);
          bubbleModel = engineOutput.bubble;
          drawerModel = engineOutput.drawer;
        } else {
          const engineOutput = PersonaEngine.getPowerOpsEngineOutput(newContext.run, newContext);
          if (engineOutput) {
            bubbleModel = engineOutput.bubble;
            drawerModel = engineOutput.drawer;
          }
        }
      } else if (newContext.module === 'overview') {
        const engineOutput = PersonaEngine.getOverviewEngineOutput(action.payload.globalState || {}, newContext);
        bubbleModel = engineOutput.bubble;
        drawerModel = engineOutput.drawer;
      } else {
        bubbleModel = null;
        drawerModel = null;
      }
      
      const userIntent = action.payload.userIntent;
      const shouldOpenDrawer = userIntent && (
        userIntent.includes('VIEW_TASKS') || 
        userIntent.includes('RISK_TRENDS') || 
        userIntent.includes('GENERATE_PLAN') ||
        userIntent.includes('CLICK_RISK') ||
        userIntent.includes('KPI_DROP') ||
        userIntent.includes('VIEW_DATA') ||
        userIntent.includes('START_DIAGNOSIS') ||
        userIntent.includes('GENERATE_BRIEF') ||
        userIntent.includes('CLICK_GEN') ||
        userIntent.includes('CLICK_REV') ||
        userIntent.includes('CLICK_MONTHLY') ||
        userIntent.includes('CONFIRM_ASSIGNEES') ||
        userIntent.includes('ADJUST_CRITERIA')
      );

      // If opening drawer via intent, add a message to chat history if it's a new intent
      if (shouldOpenDrawer && userIntent !== state.context.userIntent) {
        const content = PersonaEngine.getConversationalSummary(drawerModel, userIntent);
        const thinking = drawerModel?.sections.find(s => s.type === 'analysis')?.content;
        
        chatHistory = [...chatHistory, {
          id: `intent-${Date.now()}`,
          role: 'assistant',
          content: content,
          thinking: thinking,
          timestamp: Date.now(),
          type: 'analysis',
          actions: bubbleModel?.actions
        }];
      }
      
      return {
        ...state,
        context: newContext,
        contextKey: newKey,
        bubbleModel,
        drawerModel,
        chatHistory,
        isDrawerOpen: shouldOpenDrawer ? true : state.isDrawerOpen,
      };
    }
    case 'TOGGLE_DRAWER':
      return {
        ...state,
        isDrawerOpen: action.payload !== undefined ? action.payload : !state.isDrawerOpen,
      };
    case 'SET_ACTIVE_PLUGIN':
      return {
        ...state,
        activePluginId: action.payload,
      };
    case 'TRIGGER_COPILOT':
      return {
        ...state,
        lastTriggerTime: action.payload,
      };
    case 'TOGGLE_QUIET_MODE':
      return {
        ...state,
        isQuietMode: !state.isQuietMode,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload],
      };
    case 'SET_THINKING':
      return {
        ...state,
        isThinking: action.payload,
      };
    case 'SET_NOTIFICATION':
      return {
        ...state,
        notification: action.payload,
      };
    case 'CLEAR_CHAT':
      return {
        ...state,
        chatHistory: [],
      };
    default:
      return state;
  }
}

export const CopilotProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(copilotReducer, initialState);
  const { state: globalState } = useGlobalStore();
  const location = useLocation();
  const prevModuleRef = React.useRef<string | null>(null);
  const prevScenarioRef = React.useRef<string | null>(null);
  const prevSubModuleRef = React.useRef<string | null>(null);
  const prevStageRef = React.useRef<string | null>(null);

  // Auto-update context based on route
  useEffect(() => {
    // Skip context updates on login page
    if (location.pathname === '/login') return;

    const pathParts = location.pathname.split('/').filter(Boolean);
    const module = pathParts[1] || 'overview';
    const scenarioFromPath = pathParts[2] || null;
    
    // Determine subModule: 
    // 1. For scenario/powerops, use globalState.powerOpsSubModule
    // 2. For knowledge-graph, use internal state
    // 3. Otherwise use path
    let subModule = scenarioFromPath;
    if (module === 'scenario' && scenarioFromPath === 'powerops') {
      subModule = globalState.powerOpsSubModule;
    } else if (module === 'knowledge-graph') {
      subModule = state.context.subModule;
    }

    const scenario = module === 'scenario' ? scenarioFromPath : null;
    const isStageChange = scenario === 'powerops' && prevStageRef.current !== globalState.run.stage;

    // Always sync run state for scenario context
    const runPayload = module === 'scenario' ? { run: globalState.run } : {};

    // Only dispatch if something actually changed to avoid unnecessary re-renders
    const isRouteChange = prevModuleRef.current !== module || prevScenarioRef.current !== scenario || prevSubModuleRef.current !== subModule;
    
    if (
      state.context.module !== module || 
      state.context.subModule !== subModule ||
      state.context.scenario !== scenario ||
      (scenario === 'powerops' && state.context.subModule !== globalState.powerOpsSubModule) ||
      (module === 'overview' && (state.bubbleModel === null)) || // Ensure overview gets initialized
      (module === 'scenario' && (
        state.context.run?.stage !== globalState.run.stage ||
        state.context.run?.evidenceChain.diagnosis.status !== globalState.run.evidenceChain.diagnosis.status ||
        state.context.run?.execution.mitigationCycle !== globalState.run.execution.mitigationCycle ||
        state.context.run?.outputs.caseRecord.status !== globalState.run.outputs.caseRecord.status ||
        state.context.run?.outputs.knowledgeRecord.status !== globalState.run.outputs.knowledgeRecord.status ||
        state.context.run?.evidenceChain.verification.uav.status !== globalState.run.evidenceChain.verification.uav.status ||
        state.context.run?.evidenceChain.verification.uav.progress !== globalState.run.evidenceChain.verification.uav.progress
      ))
    ) {
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: {
          module,
          subModule,
          scenario,
          flowStep: undefined,
          entity: undefined,
          userIntent: (isRouteChange || isStageChange) ? undefined : state.context.userIntent, // Clear on route or stage change
          globalState, // Pass globalState for overview engine
          ...runPayload
        }
      });
    }

    if (isRouteChange || isStageChange) {
      // For stage changes, we might NOT want to clear the full chat history, 
      // but the user wants the "first message" or "welcome message" to reflect current state.
      // Let's add a new welcome message when stage changes.
      
      const isActiveRun = scenario === 'powerops' && (globalState.run.stage !== 'collect' || globalState.run.evidenceChain.metricsCards.length > 0);

      // Add Welcome Message
      const welcome = PersonaEngine.getWelcomeMessage(
        module, 
        scenario, 
        globalState.currentUserRole, 
        subModule, 
        scenario === 'powerops' ? globalState.run.stage : undefined
      );
      
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: welcome.content,
          timestamp: Date.now(),
          type: 'text',
          suggestions: welcome.suggestions
        }
      });
    }

    prevModuleRef.current = module;
    prevScenarioRef.current = scenario;
    prevSubModuleRef.current = subModule;
    prevStageRef.current = globalState.run.stage;
  }, [
    location.pathname, 
    globalState.currentModule, 
    globalState.currentScenario, 
    globalState.powerOpsSubModule,
    globalState.currentUserRole, 
    globalState.run.stage,
    globalState.run.auditLog.length,
    globalState.run.evidenceChain.diagnosis.status,
    globalState.run.execution.mitigationCycle,
    globalState.run.outputs.caseRecord.status,
    globalState.run.outputs.knowledgeRecord.status,
    globalState.run.evidenceChain.verification.uav.status,
    globalState.run.evidenceChain.verification.uav.progress
  ]);

  // Listen for external notifications
  useEffect(() => {
    const handleNotification = (e: any) => {
      dispatch({ type: 'SET_NOTIFICATION', payload: e.detail });
    };
    
    const handleUserAction = (e: any) => {
      const { event, label, source } = e.detail;
      if (source === 'workflow') return;
      // Real-time tracking: Add a small "thinking" or "observing" effect
      console.log(`[Copilot] Tracking user action: ${label} (${event})`);
      
      // Optionally add a message or update context to trigger engine re-run
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: {
          userIntent: `USER_ACTION_${event}`,
          globalState
        }
      });
    };

    window.addEventListener('copilot-notification', handleNotification);
    window.addEventListener('powerops-event', handleUserAction);
    
    return () => {
      window.removeEventListener('copilot-notification', handleNotification);
      window.removeEventListener('powerops-event', handleUserAction);
    };
  }, [globalState]);

  return (
    <CopilotContext.Provider value={{ state, dispatch }}>
      {children}
    </CopilotContext.Provider>
  );
};

export const useCopilot = () => {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
};
