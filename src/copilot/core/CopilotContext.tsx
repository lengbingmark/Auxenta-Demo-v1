import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { WorkContext } from '../types';
import { useLocation } from 'react-router-dom';
import { ChatMessage, PersonaEngine, BubbleModel, DrawerModel } from './PersonaEngine';
import { useGlobalStore } from '../../store/GlobalStore';

export interface ChatSession {
  id: string;
  timestamp: number;
  messages: ChatMessage[];
  title: string;
}

interface CopilotState {
  context: WorkContext;
  contextKey: string;
  isDrawerOpen: boolean;
  isExpanded: boolean;
  activePluginId: string | null;
  lastTriggerTime: number;
  isQuietMode: boolean;
  // New Chat State
  chatHistory: ChatMessage[];
  sessions: ChatSession[];
  currentSessionId: string;
  isThinking: boolean;
  notification: { title: string; content: string; type?: 'info' | 'warning' | 'success' | 'error'; isLarge?: boolean; actions?: any[] } | null;
  // Engine Models
  bubbleModel: BubbleModel | null;
  drawerModel: DrawerModel | null;
}

type Action =
  | { type: 'UPDATE_CONTEXT'; payload: Partial<WorkContext> & { globalState?: any } }
  | { type: 'TOGGLE_DRAWER'; payload?: boolean }
  | { type: 'TOGGLE_EXPAND'; payload?: boolean }
  | { type: 'SET_ACTIVE_PLUGIN'; payload: string | null }
  | { type: 'TRIGGER_COPILOT'; payload: number }
  | { type: 'TOGGLE_QUIET_MODE' }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_THINKING'; payload: boolean }
  | { type: 'SET_NOTIFICATION'; payload: { title: string; content: string; type?: 'info' | 'warning' | 'success' | 'error'; isLarge?: boolean; actions?: any[] } | null }
  | { type: 'NEW_CHAT' }
  | { type: 'LOAD_SESSION'; payload: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_SESSIONS'; payload: ChatSession[] }
  | { type: 'CLEAR_CHAT' };

const initialState: CopilotState = {
  context: {
    scenario: null,
    module: 'overview',
    subModule: '',
  },
  contextKey: '',
  isDrawerOpen: false,
  isExpanded: false,
  activePluginId: null,
  lastTriggerTime: 0,
  isQuietMode: false,
  chatHistory: [],
  sessions: [],
  currentSessionId: `session-${Date.now()}`,
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
        newContext.run?.evidenceChain.verification.uav.progress !== undefined ? `p${newContext.run.evidenceChain.verification.uav.progress}` : '',
        newContext.page_context
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
    case 'TOGGLE_EXPAND':
      return {
        ...state,
        isExpanded: action.payload !== undefined ? action.payload : !state.isExpanded,
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
    case 'ADD_MESSAGE': {
      const newHistory = [...state.chatHistory, action.payload];
      // Auto-save session when message added
      const updatedSessions = state.sessions.map(s => 
        s.id === state.currentSessionId ? { ...s, messages: newHistory, timestamp: Date.now() } : s
      );
      
      // If current session not in list (new session), add it
      const finalSessions = updatedSessions.find(s => s.id === state.currentSessionId) 
        ? updatedSessions 
        : [...updatedSessions, { 
            id: state.currentSessionId, 
            timestamp: Date.now(), 
            messages: newHistory, 
            title: action.payload.role === 'user' ? action.payload.content.slice(0, 20) : '新会话' 
          }];

      return {
        ...state,
        chatHistory: newHistory,
        sessions: finalSessions
      };
    }
    case 'NEW_CHAT': {
      const newSessionId = `session-${Date.now()}`;
      return {
        ...state,
        currentSessionId: newSessionId,
        chatHistory: [],
      };
    }
    case 'LOAD_SESSION': {
      const session = state.sessions.find(s => s.id === action.payload);
      if (!session) return state;
      return {
        ...state,
        currentSessionId: session.id,
        chatHistory: session.messages,
      };
    }
    case 'CLEAR_HISTORY':
      return {
        ...state,
        sessions: state.sessions.filter(s => s.id === state.currentSessionId),
      };
    case 'SET_SESSIONS':
      return {
        ...state,
        sessions: action.payload,
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
  const { state: globalState, dispatch: globalDispatch } = useGlobalStore();
  const location = useLocation();
  const prevModuleRef = React.useRef<string | null>(null);
  const prevScenarioRef = React.useRef<string | null>(null);
  const prevSubModuleRef = React.useRef<string | null>(null);
  const prevStageRef = React.useRef<string | null>(null);

  // Persistence & Cleanup
  useEffect(() => {
    const saved = localStorage.getItem('liangzai_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const validSessions = parsed.filter((s: ChatSession) => (now - s.timestamp) < 24 * 60 * 60 * 1000);
        dispatch({ type: 'SET_SESSIONS', payload: validSessions });
      } catch (e) {
        console.error('Failed to load sessions', e);
      }
    }
  }, []);

  useEffect(() => {
    if (state.sessions.length > 0) {
      localStorage.setItem('liangzai_sessions', JSON.stringify(state.sessions));
    }
  }, [state.sessions]);

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

    let page_context: any = undefined;
    if (module === 'scenario' && scenarioFromPath === 'powerops') {
      if (globalState.powerOpsSubModule === 'HOME') page_context = 'home';
      else if (globalState.powerOpsSubModule === 'ASSETS') page_context = 'asset_ledger';
      else if (globalState.powerOpsSubModule === 'TICKETS') page_context = 'work_order_center';
      else if (globalState.powerOpsSubModule === 'REPORTS') page_context = 'report_center';
      else if (globalState.powerOpsSubModule === 'WORKBENCH') page_context = 'workbench';
    }

    // Always sync run state and system state for scenario context
    const runPayload = module === 'scenario' ? { run: globalState.run, system_state: globalState.system_state } : { system_state: globalState.system_state };

    // Only dispatch if something actually changed to avoid unnecessary re-renders
    const isRouteChange = prevModuleRef.current !== module || prevScenarioRef.current !== scenario || prevSubModuleRef.current !== subModule || state.context.page_context !== page_context;
    
    if (
      state.context.module !== module || 
      state.context.subModule !== subModule ||
      state.context.scenario !== scenario ||
      state.context.page_context !== page_context ||
      (scenario === 'powerops' && state.context.subModule !== globalState.powerOpsSubModule) ||
      (module === 'overview' && (state.bubbleModel === null)) || // Ensure overview gets initialized
      (module === 'scenario' && (
        state.context.run?.stage !== globalState.run.stage ||
        state.context.run?.evidenceChain.diagnosis.status !== globalState.run.evidenceChain.diagnosis.status ||
        state.context.run?.execution.mitigationCycle !== globalState.run.execution.mitigationCycle ||
        state.context.run?.outputs.caseRecord.status !== globalState.run.outputs.caseRecord.status ||
        state.context.run?.outputs.knowledgeRecord.status !== globalState.run.outputs.knowledgeRecord.status ||
        state.context.run?.evidenceChain.verification.uav.status !== globalState.run.evidenceChain.verification.uav.status ||
        state.context.run?.evidenceChain.verification.uav.progress !== globalState.run.evidenceChain.verification.uav.progress ||
        state.context.system_state?.current_stage !== globalState.system_state.current_stage ||
        state.context.system_state?.task_status !== globalState.system_state.task_status ||
        state.context.system_state?.diagnosis_result !== globalState.system_state.diagnosis_result ||
        state.context.system_state?.risk_status !== globalState.system_state.risk_status
      ))
    ) {
      dispatch({
        type: 'UPDATE_CONTEXT',
        payload: {
          module,
          subModule,
          scenario,
          page_context,
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
        scenario === 'powerops' ? globalState.run.stage : undefined,
        page_context,
        globalState
      );
      
      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: welcome.content,
          timestamp: Date.now(),
          type: 'text',
          suggestions: welcome.suggestions,
          actions: welcome.actions
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
    globalState.run.evidenceChain.verification.uav.progress,
    globalState.system_state.current_stage,
    globalState.system_state.task_status,
    globalState.system_state.diagnosis_result,
    globalState.system_state.risk_status
  ]);

  // Listen for external notifications
  useEffect(() => {
    const handleNotification = (e: any) => {
      dispatch({ type: 'SET_NOTIFICATION', payload: e.detail });
    };
    
    const handleUserAction = (e: any) => {
      const { event, label, source, payload } = e.detail;
      if (source === 'workflow') return;

      if (event === 'NAV_TO_MODULE' && payload?.module) {
        globalDispatch({ type: 'SET_POWEROPS_SUBMODULE', payload: payload.module });
        return;
      }

      if (event === 'E_VIEW_TASKS') {
        globalDispatch({ type: 'SET_POWEROPS_SUBMODULE', payload: 'TICKETS' });
      }

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

    const handleAgentPropose = (e: any) => {
      const { action_type, action_title, action_description, target_module } = e.detail;
      const action_id = 'ACT-' + Date.now();
      
      globalDispatch({ type: 'ADD_AGENT_ACTION', payload: {
        action_id,
        action_type,
        action_title,
        action_description,
        target_module: target_module || (action_type === 'generate_report' ? 'report_center' : 'work_order_center'),
        execution_status: 'pending'
      }});

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `agent-propose-${Date.now()}`,
          role: 'assistant',
          content: `检测到风险，我建议执行以下行动：\n\n**${action_title}**\n${action_description}`,
          timestamp: Date.now(),
          type: 'text',
          actions: [
            { label: '确认执行', event: 'EXECUTE_AGENT_ACTION', payload: { action_id, confirmed: true }, primary: true },
            { label: '查看方案', event: 'VIEW_AGENT_ACTION_PLAN', payload: { action_id } }
          ]
        }
      });
      
      dispatch({ type: 'TOGGLE_DRAWER', payload: true });
    };

    const handleAgentExecute = (e: any) => {
      const { action_id, confirmed } = e.detail;
      const agentAction = globalState.agent_actions.find(a => a.action_id === action_id);
      
      if (!agentAction) return;

      // If not confirmed, redirect to plan view
      if (!confirmed) {
        handleAgentViewPlan({ detail: { action_id } });
        return;
      }

      globalDispatch({ type: 'EXECUTE_AGENT_ACTION', payload: action_id });
      
      const moduleName = agentAction.target_module === 'work_order_center' ? '工单中心' : '报告中心';
      const moduleKey = agentAction.target_module === 'work_order_center' ? 'TICKETS' : 'REPORTS';
      const successTitle = agentAction.action_type === 'generate_report' ? '报告已生成' : '任务已创建';

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `agent-exec-${Date.now()}`,
          role: 'assistant',
          content: `${agentAction.action_title}已完成，并已写入【${moduleName}】。您可以立即前往查看执行进度。`,
          timestamp: Date.now(),
          type: 'receipt',
          receipt: {
            status: 'success',
            title: successTitle,
            details: `任务已成功同步至${moduleName}。`
          },
          actions: [
            { label: `前往${moduleName}`, event: 'NAV_TO_MODULE', payload: { module: moduleKey, moduleName }, primary: true }
          ]
        }
      });
    };

    const handleAgentViewPlan = (e: any) => {
      const { action_id } = e.detail;
      const agentAction = globalState.agent_actions.find(a => a.action_id === action_id);
      
      if (!agentAction) return;

      const planContent = `### 行动方案详情\n\n` +
        `1. **问题来源**：${agentAction.action_description}\n` +
        `2. **建议动作**：${agentAction.action_title}\n` +
        `3. **执行资源**：${agentAction.action_type === 'schedule_inspection' ? '自动化清洗机器人-A01' : 'AI 诊断引擎'}\n` +
        `4. **预计耗时**：${agentAction.action_type === 'generate_report' ? '30秒' : '2小时'}\n` +
        `5. **预计收益修复**：+1.1%\n` +
        `6. **风险等级**：中\n` +
        `7. **执行后查看模块**：${agentAction.target_module === 'work_order_center' ? '工单中心' : '报告中心'}\n\n` +
        `是否确认执行该方案？`;

      dispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `agent-plan-${Date.now()}`,
          role: 'assistant',
          content: planContent,
          timestamp: Date.now(),
          type: 'analysis',
          actions: [
            { label: '确认执行', event: 'EXECUTE_AGENT_ACTION', payload: { action_id, confirmed: true }, primary: true },
            { label: '取消', event: 'CLEAR_CHAT' } // Simple cancel
          ]
        }
      });
    };

    window.addEventListener('copilot-agent-propose', handleAgentPropose);
    window.addEventListener('copilot-agent-execute', handleAgentExecute);
    window.addEventListener('copilot-agent-view-plan', handleAgentViewPlan);
    
    return () => {
      window.removeEventListener('copilot-notification', handleNotification);
      window.removeEventListener('powerops-event', handleUserAction);
      window.removeEventListener('copilot-agent-propose', handleAgentPropose);
      window.removeEventListener('copilot-agent-execute', handleAgentExecute);
      window.removeEventListener('copilot-agent-view-plan', handleAgentViewPlan);
    };
  }, [globalState, globalDispatch]);

  const contextValue = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <CopilotContext.Provider value={contextValue}>
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
