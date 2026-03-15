
export type UserRole = 'ADMIN' | 'MANAGER' | 'OPERATOR';
export type CopilotMode = 'mini' | 'expanded' | 'hidden';
export type PowerOpsState = 'S0_OVERVIEW' | 'S1_ANOMALY' | 'S2_PLAN' | 'S3_DISPATCH' | 'S4_TRACKING' | 'S5_LEDGER' | 'S6_REVIEW';

export type PowerOpsWorkbenchStep = 
  | 'COLLECTION' 
  | 'ANALYSIS' 
  | 'DIAGNOSIS' 
  | 'PLANNING' 
  | 'DISPATCH' 
  | 'TRACKING' 
  | 'ALERT' 
  | 'DECISION' 
  | 'REPORT' 
  | 'STORAGE';

export type PowerOpsSubModule = 'HOME' | 'WORKBENCH' | 'ASSETS' | 'TICKETS' | 'LEDGER' | 'REPORTS';

export type LowAltitudeSubModule = 
  | 'SITUATION_OVERVIEW' 
  | 'TASK_CENTER' 
  | 'EVENT_CENTER' 
  | 'ALGORITHM_CENTER' 
  | 'OPERATIONS_CENTER';

export interface CopilotMessageCard {
  type: 'info' | 'warning' | 'action';
  title: string;
  content: string;
}

export interface CopilotAction {
  label: string;
  actionId: string;
  payload?: any;
}

export interface CopilotResponse {
  id: string; // Script ID for debugging
  role: string;
  module: string;
  title: string;
  messageCards: CopilotMessageCard[];
  actions: CopilotAction[];
  timestamp?: number;
}

export type RunStage = 'collect' | 'diagnose' | 'execute' | 'accept';

export type DiagnosisStatus = 'AI_PROPOSED' | 'HUMAN_REVIEWED_MATCH' | 'HUMAN_REVIEWED_CONFLICT' | 'RESOLVED_CONFIRMED';

export interface RunState {
  runId: string;
  stage: RunStage;
  furthestStage: RunStage;
  station: { id: string; name: string };
  dataSource: { 
    type: "excel" | "api"; 
    fileName?: string; 
    apiName?: string; 
    uploadedAt?: number; 
  };
  evidenceChain: {
    metricsCards: Array<{ key: string; title: string; value: string; unit?: string; delta?: string; level?: string }>;
    diagnosis: { 
      status: DiagnosisStatus;
      aiConclusion: string;
      humanConclusion?: string;
      finalConclusion?: string;
      conclusion: string; // Legacy field for backward compatibility
      confidence: string; 
      reasonBullets: string[] 
    };
    verification: {
      uav: { enabled: boolean; status: "idle" | "requested" | "completed"; progress: number; image?: string; resultSummary?: string };
      manual: { enabled: boolean; status: "idle" | "requested" | "completed"; resultSummary?: string; isConflict?: boolean };
    };
    recommendedPlans: Array<{ id: string; name?: string; title?: string; desc?: string; cost: string; benefitDelta?: string; riskLevel?: string; tags?: string; duration?: string; recommended?: boolean }>;
    knowledgeDrafts: Array<{
      id: string;
      type: 'DIAGNOSIS_CONFLICT_CASE';
      aiConclusion: string;
      humanConclusion: string;
      conflictPoint: string;
      resolution: string;
      lesson: string;
      tags: string[];
      status: 'draft' | 'saved';
    }>;
  };
  execution: {
    selectedPlanId?: string;
    mitigationCycle: number;
    tasks: Array<{
      id: string;
      title: string;
      ownerType: "human" | "robot" | "uav";
      ownerName: string;
      status: "draft" | "pending_confirm" | "assigned" | "in_progress" | "delayed" | "completed";
      progress: number;
      dueAt?: number;
      feedback?: string;
      attachments?: string;
    }>;
    progressLogs: Array<{
      ts: number;
      taskId: string;
      progress: number;
      note: string;
      reporter: string;
    }>;
    risks: Array<{ 
      id: string; 
      level: "low" | "mid" | "high"; 
      title: string; 
      triggerReason: string; 
      status: "open" | "mitigating" | "closed";
      mitigationCycle?: number;
      resolvedAt?: number;
    }>;
    mitigations: Array<{ 
      id: string; 
      riskId: string; 
      cycle: number;
      title: string; 
      rootCause?: string;
      options?: Array<{ id: string; label: string; impact: string }>;
      selectedOptionId?: string;
      actions: string; 
      status: "draft" | "pending_confirm" | "approved" | "rejected" | "executing" | "done" 
    }>;
  };
  acceptance: {
    criteria: Array<{ id: string; name: string; target: string; current: string; unit: string; pass: boolean }>;
    status: "not_set" | "checking" | "accepted" | "fail";
    confirmedByHuman: boolean;
    criteriaConfirmed?: boolean;
    metrics?: { pr: string; recovery: string };
    score?: number;
  };
  knowledgeDeposit?: boolean;
  outputs: {
    report: { status: "idle" | "generating" | "ready"; fileName?: string; downloadUrl?: string };
    caseRecord: { status: "idle" | "saved"; caseId?: string };
    knowledgeRecord: { status: "idle" | "saved"; knowledgeId?: string };
  };
  auditLog: Array<{ ts: number; eventType: string; message: string; payload?: any }>;
}

export type RunEvent =
  | 'RESET_RUN'
  | 'STAGE_NAVIGATED'
  | 'DATA_UPLOADED'
  | 'ANALYSIS_REQUESTED'
  | 'ANALYSIS_COMPLETED'
  | 'VERIFICATION_REQUESTED'
  | 'VERIFICATION_PROGRESS_UPDATED'
  | 'VERIFICATION_COMPLETED'
  | 'MANUAL_VERIFICATION_REQUESTED'
  | 'MANUAL_VERIFICATION_COMPLETED'
  | 'PLAN_SELECTED'
  | 'PLAN_CONFIRMED'
  | 'TASKS_CREATED'
  | 'TASK_OWNER_CONFIRMED'
  | 'TASK_ASSIGNED'
  | 'PROGRESS_UPDATED'
  | 'RISK_TRIGGERED'
  | 'MITIGATION_PLAN_CREATED'
  | 'MITIGATION_CONFIRMED'
  | 'ACCEPTANCE_CRITERIA_SET'
  | 'ACCEPTANCE_CRITERIA_CONFIRMED'
  | 'ACCEPTANCE_CHECKED'
  | 'ACCEPTANCE_PASSED'
  | 'ACCEPTANCE_FAILED'
  | 'REPORT_GENERATED'
  | 'REPORT_PREVIEWED'
  | 'REPORT_DOWNLOADED'
  | 'CASE_SAVED'
  | 'KNOWLEDGE_SAVED'
  | 'CASE_LIBRARY_OPENED'
  | 'KNOWLEDGE_LIBRARY_OPENED'
  | 'ITEM_DETAIL_OPENED'
  | 'DOWNLOAD_REPORT_CLICKED'
  | 'DIAG_CONFLICT'
  | 'DIAGNOSIS_RESOLVED'
  | 'DIAGNOSIS_CONFLICT_RAISED'
  | 'E_REINIT_AUTH'
  | 'AUTH_REINIT_SUCCESS'
  | 'RELOAD_PAGE'
  | 'KNOWLEDGE_DRAFT_UPDATED'
  | 'KNOWLEDGE_DRAFT_ARCHIVED'
  | 'MITIGATION_EXECUTED'
  | 'AI_DIAGNOSIS_COMPLETED'
  | 'HUMAN_REVIEW_COMPLETED'
  | 'TASK_STARTED'
  | 'TASK_COMPLETED'
  | 'ACCEPTANCE_COMPLETED';

export interface SystemState {
  run_id: string;
  current_stage: string;
  diagnosis_result: string;
  task_status: string;
  risk_status: string;
  acceptance_status: string;
  knowledge_status: string;
}

export interface DynamicTicket {
  ticket_id: string;
  run_id: string;
  ticket_name: string;
  ticket_type: string;
  source: string;
  station: string;
  assignee: string;
  priority: string;
  status: string;
  created_at: number;
  expires_at: number;
  description?: string;
}

export interface DynamicReport {
  report_id: string;
  run_id: string;
  report_title: string;
  report_type: string;
  source: string;
  station: string;
  created_at: number;
  expires_at: number;
  file_size: string;
  status: string;
  summary: string;
  preview_data: {
    diagnosis_conclusion: string;
    task_result: string;
    risk_result: string;
    acceptance_result: string;
    knowledge_result: string;
  };
}

export interface AgentAction {
  action_id: string;
  action_type: 'create_work_order' | 'schedule_inspection' | 'generate_report';
  action_title: string;
  action_description: string;
  target_module: 'work_order_center' | 'report_center';
  execution_status: 'pending' | 'executing' | 'completed' | 'failed';
}

export interface GlobalState {
  currentModule: string;
  currentSubModule: string;
  currentScenario: string | null;
  currentUserRole: UserRole | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  copilotMode: CopilotMode;
  copilotContextKey: string;
  copilotMessages: CopilotResponse | null;
  selectedEntityId: string | null;
  highlightedNodeId: string | null;
  run: RunState;
  system_state: SystemState;
  powerOpsState?: PowerOpsState;
  powerOpsWorkbenchStep?: PowerOpsWorkbenchStep;
  powerOpsSubModule?: PowerOpsSubModule;
  lowAltitudeSubModule?: LowAltitudeSubModule;
  flyDataAuthStatus: 'valid' | 'invalid' | 'reinitializing';
  powerOpsWorkbenchData?: any;
  powerOpsClosedLoopLedger?: any[];
  // Agentic Feedback
  tasks?: any[];
  recentActions?: any[];
  // Memory System (v4)
  adviceAcceptedCount: number;
  adviceIgnoredCount: number;
  conflictCount: number;
  sessionStats: {
    suggestionsCount: number;
    tasksExecuted: number;
    riskLevelChange: 'stable' | 'increased' | 'decreased';
  };
  // Knowledge Engine State (v4)
  knowledgeEngine: {
    selectedBases: string[];
    graphData: {
      nodes: any[];
      links: any[];
    };
    rules: {
      id: string;
      name: string;
      weight: number;
      enabled: boolean;
      impact: string;
    }[];
    tags: {
      id: string;
      name: string;
      category: 'industry' | 'enterprise' | 'risk' | 'behavior' | 'policy';
      confidence?: number;
      evidence?: string;
    }[];
    testResult: any | null;
    activeIndustry: string;
    conflictLogs: {
      id: string;
      timestamp: number;
      scenario: string;
      ruleName: string;
      aiWeight: number;
      userWeight: number;
      riskLevel: 'high' | 'medium' | 'low';
      remark: string;
    }[];
  };
  knowledgeLedger: any[];
  dynamic_ticket_store: DynamicTicket[];
  dynamic_report_store: DynamicReport[];
  agent_actions: AgentAction[];
}

export type Action =
  | { type: 'SET_ROUTE_CONTEXT'; payload: { module: string; subModule: string; scenario: string | null } }
  | { type: 'LOGIN'; payload: UserRole }
  | { type: 'LOGOUT' }
  | { type: 'SET_COPILOT_MODE'; payload: CopilotMode }
  | { type: 'UPDATE_COPILOT_MESSAGE'; payload: CopilotResponse }
  | { type: 'SELECT_ENTITY'; payload: string | null }
  | { type: 'HIGHLIGHT_NODE'; payload: string | null }
  | { type: 'UPDATE_TASK_STATUS'; payload: { taskId: string; status: string } }
  | { type: 'NUDGE_ALL_TASKS' }
  | { type: 'ADD_ACTION_LOG'; payload: { type: string; desc: string } }
  // Memory System Actions
  | { type: 'RECORD_DECISION'; payload: 'accept' | 'ignore' | 'conflict' }
  | { type: 'INCREMENT_SESSION_STAT'; payload: 'suggestions' | 'tasks' }
  | { type: 'UPDATE_RISK_CHANGE'; payload: 'stable' | 'increased' | 'decreased' }
  // Knowledge Engine Actions
  | { type: 'KE_SET_INDUSTRY'; payload: string }
  | { type: 'KE_TOGGLE_BASE'; payload: string }
  | { type: 'KE_UPDATE_RULE_WEIGHT'; payload: { id: string; weight: number } }
  | { type: 'KE_SET_TEST_RESULT'; payload: any }
  | { type: 'KE_ADD_NODE'; payload: any }
  | { type: 'KE_ADD_TAG'; payload: any }
  | { type: 'KE_SET_GRAPH_DATA'; payload: any }
  | { type: 'KE_ADD_LEDGER_ENTRY'; payload: any }
  | { type: 'KE_ADD_MULTIPLE_ELEMENTS'; payload: { nodes: any[]; links: any[]; tags: any[] } }
  | { type: 'KE_SET_SELECTED_BASES'; payload: string[] }
  | { type: 'KE_ADD_CONFLICT_LOG'; payload: any }
  | { type: 'DISPATCH_RUN_EVENT'; payload: { event: RunEvent; data?: any; details: string; silent?: boolean } }
  | { type: 'SET_POWEROPS_STATE'; payload: PowerOpsState }
  | { type: 'SET_POWEROPS_WORKBENCH_STEP'; payload: PowerOpsWorkbenchStep }
  | { type: 'SET_POWEROPS_SUBMODULE'; payload: PowerOpsSubModule }
  | { type: 'SET_LOWALTITUDE_SUBMODULE'; payload: LowAltitudeSubModule }
  | { type: 'UPDATE_POWEROPS_WORKBENCH_DATA'; payload: any }
  | { type: 'ADD_POWEROPS_LEDGER_ENTRY'; payload: any }
  | { type: 'UPSERT_DYNAMIC_TICKET'; payload: DynamicTicket }
  | { type: 'UPDATE_DYNAMIC_TICKET_STATUS'; payload: { ticket_id: string; status: string } }
  | { type: 'DELETE_DYNAMIC_TICKET'; payload: string }
  | { type: 'CLEANUP_EXPIRED_TICKETS' }
  | { type: 'UPSERT_DYNAMIC_REPORT'; payload: DynamicReport }
  | { type: 'CLEANUP_EXPIRED_REPORTS' }
  | { type: 'EXECUTE_AGENT_ACTION'; payload: string }
  | { type: 'ADD_AGENT_ACTION'; payload: AgentAction }
  | { type: 'AUTH_REINIT_SUCCESS' }
  | { type: 'SET_FLYDATA_AUTH_STATUS'; payload: 'valid' | 'invalid' | 'reinitializing' };
