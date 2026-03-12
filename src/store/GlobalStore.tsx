import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlobalState, Action, UserRole, RunStage } from '../types';

// Mock Data for Tasks
const MOCK_TASKS = [
  { id: 't1', title: '企业资质审核', status: 'pending', assignee: '张三', dueDate: '2023-10-25' },
  { id: 't2', title: '季度报表归档', status: 'overdue', assignee: '李四', dueDate: '2023-10-20' },
  { id: 't3', title: '招商项目初筛', status: 'pending', assignee: '王五', dueDate: '2023-10-26' },
];

const initialState: GlobalState = {
  currentModule: 'scenario',
  currentSubModule: 'powerops',
  currentScenario: 'powerops',
  currentUserRole: null,
  isAuthenticated: false,
  copilotMode: 'mini',
  copilotContextKey: '',
  copilotMessages: null,
  selectedEntityId: null,
  highlightedNodeId: null,
  run: {
    runId: 'RUN-' + Date.now(),
    stage: 'collect',
    furthestStage: 'collect',
    station: { id: 'STATION-001', name: '某光伏电站' },
    dataSource: { type: 'api' },
    evidenceChain: {
      metricsCards: [],
      diagnosis: { 
        status: 'AI_PROPOSED',
        aiConclusion: '',
        conclusion: '', 
        confidence: '', 
        reasonBullets: [] 
      },
      verification: {
        uav: { enabled: false, status: 'idle', progress: 0 },
        manual: { enabled: false, status: 'idle' }
      },
      recommendedPlans: [],
      knowledgeDrafts: []
    },
    execution: {
      selectedPlanId: undefined,
      mitigationCycle: 0,
      tasks: [],
      progressLogs: [],
      risks: [],
      mitigations: []
    },
    acceptance: {
      criteria: [],
      status: 'not_set',
      confirmedByHuman: false,
      criteriaConfirmed: false
    },
    outputs: {
      report: { status: 'idle' },
      caseRecord: { status: 'idle' },
      knowledgeRecord: { status: 'idle' }
    },
    auditLog: []
  },
  system_state: {
    run_id: 'RUN-' + Date.now(),
    current_stage: 'collect',
    diagnosis_result: 'pending',
    task_status: 'pending',
    risk_status: 'normal',
    acceptance_status: 'pending',
    knowledge_status: 'pending'
  },
  // New Mock State for Agentic Feedback
  tasks: MOCK_TASKS,
  recentActions: [], // Log of actions performed
  // Memory System (v4)
  adviceAcceptedCount: 0,
  adviceIgnoredCount: 0,
  conflictCount: 0,
  sessionStats: {
    suggestionsCount: 0,
    tasksExecuted: 0,
    riskLevelChange: 'stable',
  },
  powerOpsState: 'S0_OVERVIEW',
  powerOpsWorkbenchStep: 'COLLECTION',
  powerOpsSubModule: 'HOME',
  isInitialized: false,
  powerOpsWorkbenchData: {},
  powerOpsClosedLoopLedger: [],
  // Knowledge Ledger
  knowledgeLedger: [],
  dynamic_ticket_store: [],
  dynamic_report_store: [],
  agent_actions: [],
  // Knowledge Engine Initial State
  knowledgeEngine: {
    selectedBases: ['public', 'industry'],
    activeIndustry: 'power',
    conflictLogs: [],
    graphData: {
      nodes: [
        // Core
        { id: 'invest_core', name: '招商运营核心', group: 'core', type: 'concept', desc: '招商运营知识体系的顶层核心，连接产业链、政策与企业。', rules: ['标准准入规则'], cases: ['某高新区招商方法论'] },
        
        // Chains
        { id: 'chain_ai', name: 'AI视觉产业链', group: 'chain', type: 'industry', desc: '涵盖算法研发、芯片设计、摄像头模组及下游集成应用。', rules: ['产业链协同评估规则'], cases: ['苏州工业园AI产业布局'] },
        { id: 'chain_low_altitude', name: '低空经济产业链', group: 'chain', type: 'industry', desc: '包含无人机制造、空域管理系统、低空物流配送等。', rules: ['新兴产业准入标准'], cases: ['深圳低空经济先行示范区'] },
        { id: 'chain_semiconductor', name: '半导体产业链', group: 'chain', type: 'industry', desc: '涉及晶圆代工、封装测试、EDA工具及半导体材料。', rules: ['关键技术自主可控评估'], cases: ['上海张江半导体集群'] },
        { id: 'chain_new_energy', name: '新能源产业链', group: 'chain', type: 'industry', desc: '包括动力电池、充电桩基础设施、整车制造。', rules: ['双碳政策对齐规则'], cases: ['常州新能源之都建设'] },

        // Enterprises
        { id: 'ent_vision_ai', name: '极目视觉 (AI视觉)', group: 'enterprise', type: 'company', tags: ['高新技术', 'B轮', '研发密集'], evidence: '2023年研发投入占比达42%，拥有专利56项。', rules: ['高新企业认定规则'], cases: ['极目视觉落户案例'] },
        { id: 'ent_vision_b', name: '某AI视觉公司B', group: 'enterprise', type: 'company', tags: ['初创型', '天使轮'], desc: '一家专注于工业缺陷检测的AI初创企业。', evidence: '核心算法在特定工业场景下准确率达99.5%。', rules: ['初创企业孵化规则'] },
        { id: 'ent_drone_tech', name: '翼飞科技 (无人机)', group: 'enterprise', type: 'company', tags: ['专精特新', '独角兽'], evidence: '在工业级无人机市场占有率连续三年排名前三。', rules: ['独角兽企业扶持政策'] },
        { id: 'ent_chip_maker', name: '芯源微电子', group: 'enterprise', type: 'company', tags: ['国产替代', 'A轮'], evidence: '核心团队来自国际顶尖半导体公司，具备5nm设计能力。', rules: ['国产替代专项奖励'] },
        { id: 'ent_battery_pro', name: '能动电池', group: 'enterprise', type: 'company', tags: ['固态电池', '制造型'], evidence: '已完成固态电池中试线建设，能量密度提升30%。' },
        { id: 'ent_robot_labs', name: '灵动机器人', group: 'enterprise', type: 'company', tags: ['协作机器人', '天使轮'], evidence: '创始人为国家级领军人才，拥有多项核心算法。' },

        // Policies
        { id: 'policy_tax_break', name: '高新企业税收减免', group: 'policy', type: 'rule', desc: '符合条件的企业可享受15%的优惠所得税率。', rules: ['所得税法实施条例'] },
        { id: 'policy_talent_grant', name: '领军人才安家补贴', group: 'policy', type: 'rule', desc: '对新引进的国家级领军人才给予最高200万补贴。', rules: ['人才引进管理办法'] },
        { id: 'policy_land_use', name: '工业用地优惠政策', group: 'policy', type: 'rule', desc: '对符合产业链导向的项目优先保障用地，地价优惠。', rules: ['土地管理法'] },
        { id: 'policy_r_d_subsidy', name: '研发投入后补助', group: 'policy', type: 'rule', desc: '根据企业年度研发投入额度，给予最高10%的现金奖励。', rules: ['研发费用加计扣除政策'] },

        // Risks
        { id: 'risk_cash_flow', name: '现金流压力', group: 'risk', type: 'risk', desc: '企业近期融资进度不及预期，可能存在短期资金缺口。', rules: ['财务健康度评估规则'], cases: ['某企业因资金链断裂迁出案例'] },
        { id: 'risk_compliance', name: '合规性风险', group: 'risk', type: 'risk', desc: '部分核心技术涉及出口管制，需关注国际政策变动。', rules: ['合规性审查准则'] },
        { id: 'risk_market_volatility', name: '市场波动风险', group: 'risk', type: 'risk', desc: '下游需求受宏观经济影响较大，订单稳定性存疑。' },
        { id: 'risk_tech_bottleneck', name: '技术突破瓶颈', group: 'risk', type: 'risk', desc: '核心算法在极端环境下的稳定性仍需进一步验证。' },
        { id: 'risk_team_stability', name: '核心团队稳定性', group: 'risk', type: 'risk', desc: 'CTO近期有变动传闻，可能影响后续研发进度。' },

        // Evaluation & Decision
        { id: 'eval_profile', name: '企业画像评价', group: 'decision', type: 'process' },
        { id: 'eval_risk', name: '风险综合评估', group: 'decision', type: 'process' },
        { id: 'eval_path', name: '推进路径决策', group: 'decision', type: 'process' },
        { id: 'eval_conclusion', name: '最终评审结论', group: 'decision', type: 'process' },

        // Outcomes
        { id: 'outcome_success', name: '建议签约', group: 'outcome', type: 'result' },
        { id: 'outcome_fail', name: '建议放弃', group: 'outcome', type: 'result' },
        { id: 'outcome_pending', name: '建议观察', group: 'outcome', type: 'result' },
      ],
      links: [
        // Core to Chains
        { source: 'invest_core', target: 'chain_ai', label: '包含' },
        { source: 'invest_core', target: 'chain_low_altitude', label: '包含' },
        { source: 'invest_core', target: 'chain_semiconductor', label: '包含' },
        { source: 'invest_core', target: 'chain_new_energy', label: '包含' },

        // Chains to Enterprises
        { source: 'chain_ai', target: 'ent_vision_ai', label: '适配' },
        { source: 'chain_ai', target: 'ent_vision_b', label: '适配' },
        { source: 'chain_low_altitude', target: 'ent_drone_tech', label: '适配' },
        { source: 'chain_semiconductor', target: 'ent_chip_maker', label: '适配' },
        { source: 'chain_new_energy', target: 'ent_battery_pro', label: '适配' },
        { source: 'chain_ai', target: 'ent_robot_labs', label: '适配' },

        // Enterprises to Policies
        { source: 'ent_vision_ai', target: 'policy_tax_break', label: '符合' },
        { source: 'ent_vision_ai', target: 'policy_r_d_subsidy', label: '符合' },
        { source: 'ent_drone_tech', target: 'policy_talent_grant', label: '符合' },
        { source: 'ent_drone_tech', target: 'policy_land_use', label: '符合' },
        { source: 'ent_chip_maker', target: 'policy_tax_break', label: '符合' },
        { source: 'ent_chip_maker', target: 'policy_talent_grant', label: '符合' },
        { source: 'ent_battery_pro', target: 'policy_land_use', label: '符合' },
        { source: 'ent_robot_labs', target: 'policy_r_d_subsidy', label: '符合' },

        // Enterprises to Risks
        { source: 'ent_vision_ai', target: 'risk_cash_flow', label: '触发' },
        { source: 'ent_drone_tech', target: 'risk_compliance', label: '触发' },
        { source: 'ent_chip_maker', target: 'risk_tech_bottleneck', label: '触发' },
        { source: 'ent_battery_pro', target: 'risk_market_volatility', label: '触发' },
        { source: 'ent_robot_labs', target: 'risk_team_stability', label: '触发' },

        // Enterprises to Evaluation
        { source: 'ent_vision_ai', target: 'eval_profile', label: '输入' },
        { source: 'ent_drone_tech', target: 'eval_profile', label: '输入' },
        { source: 'ent_chip_maker', target: 'eval_profile', label: '输入' },

        // Evaluation flow
        { source: 'eval_profile', target: 'eval_risk', label: '传递' },
        { source: 'eval_risk', target: 'eval_path', label: '传递' },
        { source: 'eval_path', target: 'eval_conclusion', label: '传递' },

        // Conclusion to Outcomes
        { source: 'eval_conclusion', target: 'outcome_success', label: '指向' },
        { source: 'eval_conclusion', target: 'outcome_fail', label: '指向' },
        { source: 'eval_conclusion', target: 'outcome_pending', label: '指向' },

        // Risks to Evaluation
        { source: 'risk_cash_flow', target: 'eval_risk', label: '影响' },
        { source: 'risk_compliance', target: 'eval_risk', label: '影响' },
        { source: 'risk_team_stability', target: 'eval_risk', label: '影响' },

        // Policies to Evaluation
        { source: 'policy_tax_break', target: 'eval_path', label: '支持' },
        { source: 'policy_land_use', target: 'eval_path', label: '支持' },
      ]
    },
    rules: [
      { id: 'r1', name: '企业成长性权重', weight: 0.6, enabled: true, impact: '影响初筛评分' },
      { id: 'r2', name: '现金流风险权重', weight: 0.8, enabled: true, impact: '触发风险预警' },
      { id: 'r3', name: '政策匹配优先级', weight: 0.4, enabled: false, impact: '调整推荐路径' },
      { id: 'r4', name: '团队稳定性系数', weight: 0.5, enabled: true, impact: '影响尽调深度' },
      { id: 'r5', name: '产业链协同权重', weight: 0.7, enabled: true, impact: '决定落地选址' },
    ],
    tags: [
      { id: 't1', name: '高新技术', category: 'industry' },
      { id: 't2', name: '研发密集', category: 'enterprise' },
      { id: 't3', name: '资金链紧张', category: 'risk' },
      { id: 't4', name: '专精特新', category: 'industry' },
      { id: 't5', name: '独角兽', category: 'enterprise' },
      { id: 't6', name: '合规风险', category: 'risk' },
      { id: 't7', name: '人才补贴', category: 'policy' },
      { id: 't8', name: '税收优惠', category: 'policy' },
    ],
    testResult: null,
  }
};

const GlobalContext = createContext<{
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

function globalReducer(state: GlobalState, action: Action): GlobalState {
  try {
    switch (action.type) {
      case 'SET_ROUTE_CONTEXT':
        window.dispatchEvent(new CustomEvent('ModuleChangeEvent', { detail: action.payload }));
        return {
          ...state,
          currentModule: action.payload.module,
          currentSubModule: action.payload.subModule,
          currentScenario: action.payload.scenario,
        };
      case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        currentUserRole: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        currentUserRole: null,
        currentModule: 'login',
      };
    case 'SELECT_ENTITY':
      return {
        ...state,
        selectedEntityId: action.payload,
      };
    case 'HIGHLIGHT_NODE':
      return {
        ...state,
        highlightedNodeId: action.payload,
      };
    // New Actions for Agentic Feedback
    case 'UPDATE_TASK_STATUS': {
      const { taskId, status } = action.payload;
      return {
        ...state,
        tasks: state.tasks?.map(t => t.id === taskId ? { ...t, status } : t),
        recentActions: [{ type: 'task_update', desc: `任务 ${taskId} 状态更新为 ${status}`, time: Date.now() }, ...(state.recentActions || [])],
        sessionStats: {
          ...state.sessionStats,
          tasksExecuted: state.sessionStats.tasksExecuted + 1
        }
      };
    }
    case 'NUDGE_ALL_TASKS': {
      return {
        ...state,
        recentActions: [{ type: 'nudge_all', desc: '已催办所有逾期任务', time: Date.now() }, ...(state.recentActions || [])],
        sessionStats: {
          ...state.sessionStats,
          tasksExecuted: state.sessionStats.tasksExecuted + 2 // Mock count
        }
      };
    }
    case 'ADD_ACTION_LOG': {
      return {
        ...state,
        recentActions: [{ ...action.payload, time: Date.now() }, ...(state.recentActions || [])]
      };
    }
    // Memory System Actions
    case 'RECORD_DECISION': {
      const type = action.payload;
      return {
        ...state,
        adviceAcceptedCount: type === 'accept' ? state.adviceAcceptedCount + 1 : state.adviceAcceptedCount,
        adviceIgnoredCount: type === 'ignore' ? state.adviceIgnoredCount + 1 : state.adviceIgnoredCount,
        conflictCount: type === 'conflict' ? state.conflictCount + 1 : state.conflictCount,
      };
    }
    case 'INCREMENT_SESSION_STAT': {
      const field = action.payload === 'suggestions' ? 'suggestionsCount' : 'tasksExecuted';
      return {
        ...state,
        sessionStats: {
          ...state.sessionStats,
          [field]: state.sessionStats[field] + 1
        }
      };
    }
    case 'UPDATE_RISK_CHANGE': {
      return {
        ...state,
        sessionStats: {
          ...state.sessionStats,
          riskLevelChange: action.payload
        }
      };
    }
    // Knowledge Engine Actions
    case 'KE_SET_INDUSTRY':
      return {
        ...state,
        knowledgeEngine: { ...state.knowledgeEngine, activeIndustry: action.payload }
      };
    case 'KE_TOGGLE_BASE': {
      const bases = state.knowledgeEngine.selectedBases.includes(action.payload)
        ? state.knowledgeEngine.selectedBases.filter(b => b !== action.payload)
        : [...state.knowledgeEngine.selectedBases, action.payload];
      return {
        ...state,
        knowledgeEngine: { ...state.knowledgeEngine, selectedBases: bases }
      };
    }
    case 'KE_UPDATE_RULE_WEIGHT':
      return {
        ...state,
        knowledgeEngine: {
          ...state.knowledgeEngine,
          rules: state.knowledgeEngine.rules.map(r => r.id === action.payload.id ? { ...r, weight: action.payload.weight } : r)
        }
      };
    case 'KE_SET_TEST_RESULT':
      return {
        ...state,
        knowledgeEngine: { ...state.knowledgeEngine, testResult: action.payload }
      };
    case 'KE_ADD_NODE': {
      const exists = state.knowledgeEngine.graphData.nodes.some(n => n.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        knowledgeEngine: {
          ...state.knowledgeEngine,
          graphData: {
            ...state.knowledgeEngine.graphData,
            nodes: [...state.knowledgeEngine.graphData.nodes, action.payload]
          }
        }
      };
    }
    case 'KE_ADD_TAG': {
      const exists = state.knowledgeEngine.tags.some(t => t.id === action.payload.id);
      if (exists) return state;
      return {
        ...state,
        knowledgeEngine: {
          ...state.knowledgeEngine,
          tags: [...state.knowledgeEngine.tags, action.payload]
        }
      };
    }
    case 'KE_SET_GRAPH_DATA':
      return {
        ...state,
        knowledgeEngine: { ...state.knowledgeEngine, graphData: action.payload }
      };
    case 'KE_ADD_LEDGER_ENTRY':
      return {
        ...state,
        knowledgeLedger: [action.payload, ...state.knowledgeLedger]
      };
    case 'KE_ADD_MULTIPLE_ELEMENTS': {
      const newNodes = action.payload.nodes.filter((n: any) => !state.knowledgeEngine.graphData.nodes.some(en => en.id === n.id));
      const newLinks = action.payload.links.filter((l: any) => {
        const sId = l.source.id || l.source;
        const tId = l.target.id || l.target;
        return !state.knowledgeEngine.graphData.links.some(el => {
          const esId = el.source.id || el.source;
          const etId = el.target.id || el.target;
          return esId === sId && etId === tId;
        });
      });
      const newTags = action.payload.tags.filter((t: any) => !state.knowledgeEngine.tags.some(et => et.id === t.id));

      if (newNodes.length === 0 && newLinks.length === 0 && newTags.length === 0) return state;

      return {
        ...state,
        knowledgeEngine: {
          ...state.knowledgeEngine,
          graphData: {
            nodes: [...state.knowledgeEngine.graphData.nodes, ...newNodes],
            links: [...state.knowledgeEngine.graphData.links, ...newLinks]
          },
          tags: [...state.knowledgeEngine.tags, ...newTags]
        }
      };
    }
    case 'KE_SET_SELECTED_BASES':
      return {
        ...state,
        knowledgeEngine: { ...state.knowledgeEngine, selectedBases: action.payload }
      };
    case 'KE_ADD_CONFLICT_LOG':
      return {
        ...state,
        knowledgeEngine: {
          ...state.knowledgeEngine,
          conflictLogs: [action.payload, ...state.knowledgeEngine.conflictLogs]
        }
      };
    case 'DISPATCH_RUN_EVENT': {
      const { event, data, details, silent } = action.payload;
      
      // De-duplication logic: check if the last log is the same as the new one
      const lastLog = state.run.auditLog[0];
      const isDuplicate = lastLog && 
        lastLog.eventType === event && 
        lastLog.message === details &&
        JSON.stringify(lastLog.payload) === JSON.stringify(data);

      const newAuditLog = (silent || isDuplicate)
        ? state.run.auditLog 
        : [
            { ts: Date.now(), eventType: event, message: details, payload: data },
            ...state.run.auditLog
          ];
      
      let newStage = state.run.stage;
      let newRunState = { ...state.run, auditLog: newAuditLog };

      // State transition logic based on events
      switch (event) {
        case 'STAGE_NAVIGATED':
          newStage = data.stage;
          break;
        case 'RESET_RUN':
          const newRunId = 'RUN-' + Date.now();
          return {
            ...state,
            run: {
              ...initialState.run,
              runId: newRunId,
              auditLog: [{ ts: Date.now(), eventType: 'RESET_RUN', message: '重置流程，开始新任务' }]
            },
            system_state: {
              ...initialState.system_state,
              run_id: newRunId
            }
          };
        case 'DATA_UPLOADED':
          newRunState.dataSource = { ...newRunState.dataSource, ...data, uploadedAt: Date.now() };
          if (data.metricsCards) {
            newRunState.evidenceChain.metricsCards = data.metricsCards;
          }
          break;
        case 'ANALYSIS_COMPLETED':
          newRunState.evidenceChain = { 
            ...newRunState.evidenceChain, 
            ...data,
            diagnosis: {
              ...newRunState.evidenceChain.diagnosis,
              ...data.diagnosis,
              aiConclusion: data.diagnosis?.conclusion || '',
              status: 'AI_PROPOSED'
            }
          };
          newStage = 'diagnose';
          break;
        case 'VERIFICATION_REQUESTED':
          newRunState.evidenceChain = {
            ...newRunState.evidenceChain,
            verification: {
              ...newRunState.evidenceChain.verification,
              uav: {
                ...newRunState.evidenceChain.verification.uav,
                status: 'requested',
                progress: 0
              }
            }
          };
          break;
        case 'VERIFICATION_PROGRESS_UPDATED':
          newRunState.evidenceChain = {
            ...newRunState.evidenceChain,
            verification: {
              ...newRunState.evidenceChain.verification,
              uav: {
                ...newRunState.evidenceChain.verification.uav,
                progress: data.progress
              }
            }
          };
          // Add a silent log entry to trigger Copilot re-evaluation if needed
          if (!silent) {
            newRunState.auditLog = [
              { ts: Date.now(), eventType: 'VERIFICATION_PROGRESS_UPDATED', message: `核验进度更新: ${data.progress}%` },
              ...newRunState.auditLog.filter(l => l.eventType !== 'VERIFICATION_PROGRESS_UPDATED') // Keep only the latest progress log
            ];
          }
          break;
        case 'VERIFICATION_COMPLETED':
          newRunState.evidenceChain = {
            ...newRunState.evidenceChain,
            verification: {
              ...newRunState.evidenceChain.verification,
              uav: {
                ...newRunState.evidenceChain.verification.uav,
                status: 'completed',
                progress: 100,
                ...data
              }
            }
          };
          break;
        case 'MANUAL_VERIFICATION_REQUESTED':
          newRunState.evidenceChain.verification.manual.status = 'requested';
          break;
        case 'MANUAL_VERIFICATION_COMPLETED':
          newRunState.evidenceChain.verification.manual = { ...newRunState.evidenceChain.verification.manual, status: 'completed', ...data };
          break;
        case 'PLAN_SELECTED':
          newRunState.execution.selectedPlanId = data.id;
          break;
        case 'PLAN_CONFIRMED':
          newRunState.execution.selectedPlanId = data.id;
          newStage = 'execute';
          break;
        case 'TASKS_CREATED':
          window.dispatchEvent(new CustomEvent('TicketCreatedEvent', { detail: data }));
          newRunState.execution.tasks = data;
          break;
        case 'TASK_OWNER_CONFIRMED':
          newRunState.execution.tasks = newRunState.execution.tasks.map(t => 
            t.id === data.taskId ? { ...t, status: 'assigned', ownerName: data.ownerName, ownerType: data.ownerType } : t
          );
          break;
        case 'TASK_ASSIGNED':
          newRunState.execution.tasks = newRunState.execution.tasks.map(t => 
            t.id === data.taskId ? { ...t, status: 'in_progress' } : t
          );
          break;
        case 'PROGRESS_UPDATED':
          newRunState.execution.tasks = newRunState.execution.tasks.map(t => 
            t.id === data.taskId ? { 
              ...t, 
              progress: data.progress !== undefined ? data.progress : t.progress, 
              status: data.status !== undefined ? data.status : t.status, 
              feedback: data.feedback !== undefined ? data.feedback : t.feedback 
            } : t
          );
          // Add to progress logs if feedback or progress changed
          if (data.feedback || data.progress !== undefined) {
            newRunState.execution.progressLogs = [
              {
                ts: Date.now(),
                taskId: data.taskId,
                progress: data.progress !== undefined ? data.progress : (newRunState.execution.tasks.find(t => t.id === data.taskId)?.progress || 0),
                note: data.feedback || '进度更新',
                reporter: newRunState.execution.tasks.find(t => t.id === data.taskId)?.ownerName || '系统'
              },
              ...newRunState.execution.progressLogs
            ];
          }
          break;
        case 'RISK_TRIGGERED':
          // Avoid duplicate risks for the same reason within the same cycle
          if (!newRunState.execution.risks.some(r => r.triggerReason === data.triggerReason && r.status !== 'closed')) {
            window.dispatchEvent(new CustomEvent('RiskDetectedEvent', { detail: data }));
            newRunState.execution.risks = [{ ...data, mitigationCycle: newRunState.execution.mitigationCycle }, ...newRunState.execution.risks];
          }
          break;
        case 'MITIGATION_PLAN_CREATED':
          // Deduplicate by riskId and cycle
          if (!newRunState.execution.mitigations.some(m => m.riskId === data.riskId && m.cycle === data.cycle)) {
            newRunState.execution.mitigations = [data, ...newRunState.execution.mitigations];
          }
          break;
        case 'MITIGATION_CONFIRMED':
          newRunState.execution.mitigations = newRunState.execution.mitigations.map(m => 
            m.id === data.mitigationId ? { ...m, status: 'executing', selectedOptionId: data.selectedOptionId } : m
          );
          // Update risk status
          const confirmedMitigation = newRunState.execution.mitigations.find(m => m.id === data.mitigationId);
          if (confirmedMitigation) {
            newRunState.execution.risks = newRunState.execution.risks.map(r => 
              r.id === confirmedMitigation.riskId ? { ...r, status: 'mitigating' } : r
            );
            
            // Apply task adjustments if provided
            if (data.adjustedTasks) {
              newRunState.execution.tasks = data.adjustedTasks;
            }
            // Increment cycle if this was a major optimization
            newRunState.execution.mitigationCycle += 1;
          }
          break;
        case 'MITIGATION_EXECUTED':
          newRunState.execution.mitigations = newRunState.execution.mitigations.map(m => 
            m.id === data.mitigationId ? { ...m, status: 'done' } : m
          );
          // Close associated risk
          const mitigation = newRunState.execution.mitigations.find(m => m.id === data.mitigationId);
          if (mitigation) {
            newRunState.execution.risks = newRunState.execution.risks.map(r => 
              r.id === mitigation.riskId ? { ...r, status: 'closed', resolvedAt: Date.now() } : r
            );
          }
          break;
        case 'ACCEPTANCE_CRITERIA_CONFIRMED':
          newRunState.acceptance.criteriaConfirmed = true;
          break;
        case 'DIAG_CONFLICT': {
          const isConflict = data.conclusion === '不一致';
          const aiConclusionVal = newRunState.evidenceChain.diagnosis.aiConclusion;
          const humanConclusionVal = data.humanConclusion || '损耗较为严重，怀疑为大面积积灰导致阴影遮挡，需立即清洗。';
          
          newRunState.evidenceChain.verification.manual = { 
            ...newRunState.evidenceChain.verification.manual, 
            status: 'completed', 
            isConflict: isConflict,
            resultSummary: `人工复核结论：${data.conclusion}`
          };

          newRunState.evidenceChain.diagnosis = {
            ...newRunState.evidenceChain.diagnosis,
            humanConclusion: humanConclusionVal,
            status: isConflict ? 'HUMAN_REVIEWED_CONFLICT' : 'HUMAN_REVIEWED_MATCH',
            finalConclusion: isConflict ? undefined : aiConclusionVal
          };

          // Create Knowledge Draft immediately on conflict
          if (isConflict) {
            const draftId = `KD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            newRunState.evidenceChain.knowledgeDrafts = [
              {
                id: draftId,
                type: 'DIAGNOSIS_CONFLICT_CASE',
                aiConclusion: aiConclusionVal,
                humanConclusion: humanConclusionVal,
                conflictPoint: `AI 诊断结论为“${aiConclusionVal}”，而人工复核结论为“${humanConclusionVal}”。分歧点在于对遮挡成因的判定（AI 倾向于树荫遮挡，人工倾向于环境积灰）。`,
                resolution: '待核验',
                lesson: '在逆变器效率阶梯式下降时，需结合无人机高清影像进一步确认表面反光率，以区分均匀积灰与局部物理遮挡。',
                tags: ['诊断冲突', '积灰识别', '人机协同'],
                status: 'draft'
              },
              ...newRunState.evidenceChain.knowledgeDrafts
            ];
          }

          break;
        }
        case 'DIAGNOSIS_RESOLVED': {
          const resolution = data.resolution; // 'use_human' | 'use_ai' | 're_verify'
          const finalConclusion = resolution === 'use_human' || resolution === 're_verify'
            ? newRunState.evidenceChain.diagnosis.humanConclusion 
            : newRunState.evidenceChain.diagnosis.aiConclusion;

          newRunState.evidenceChain.diagnosis = {
            ...newRunState.evidenceChain.diagnosis,
            finalConclusion: finalConclusion,
            conclusion: finalConclusion || '',
            status: 'RESOLVED_CONFIRMED'
          };

          if (resolution === 're_verify' || resolution === 'use_human') {
            newRunState.evidenceChain.recommendedPlans = [
              { 
                id: 'plan-1', 
                title: '全站自动化清洗', 
                desc: '调度清洗机器人对全站进行深度清洗，预计 PR 恢复 3.5%', 
                cost: '¥12,000', 
                benefitDelta: '+3.5%',
                riskLevel: '低',
                duration: '24h',
                recommended: true
              },
              { 
                id: 'plan-2', 
                title: '人工精准定点清洗', 
                desc: '针对区域 B 进行人工定点清洗，成本较低，但恢复周期较长', 
                cost: '¥4,500', 
                benefitDelta: '+2.8%',
                riskLevel: '中',
                duration: '48h'
              }
            ];
          }

          // Update existing draft or create new one
          const aiConclusionDraft = newRunState.evidenceChain.diagnosis.aiConclusion;
          const humanConclusionDraft = newRunState.evidenceChain.diagnosis.humanConclusion || '损耗严重，怀疑是积灰导致的大面积遮挡。';
          
          if (newRunState.evidenceChain.knowledgeDrafts.length > 0) {
            newRunState.evidenceChain.knowledgeDrafts = newRunState.evidenceChain.knowledgeDrafts.map((d, i) => i === 0 ? {
              ...d,
              resolution: resolution === 'use_human' ? '采纳人工结论' : (resolution === 'use_ai' ? '采纳 AI 结论' : '通过二次核验解决'),
              lesson: resolution === 're_verify' 
                ? '本次案例证实了无人机核验在解决人机分歧中的关键作用。事实证明，厚积灰的电流特征与物理遮挡高度相似，已更新识别规则。'
                : d.lesson,
              status: 'draft'
            } : d);
          } else {
            const draftId = `KD-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            newRunState.evidenceChain.knowledgeDrafts = [
              {
                id: draftId,
                type: 'DIAGNOSIS_CONFLICT_CASE',
                aiConclusion: aiConclusionDraft,
                humanConclusion: humanConclusionDraft,
                conflictPoint: `AI 诊断结论为“${aiConclusionDraft}”，而人工复核结论为“${humanConclusionDraft}”。`,
                resolution: resolution === 'use_human' ? '采纳人工结论' : '采纳 AI 结论',
                lesson: '在逆变器效率阶梯式下降时，需结合无人机高清影像进一步确认表面反光率。',
                tags: ['诊断冲突', '积灰识别', '人机协同'],
                status: 'draft'
              }
            ];
          }

          break;
        }
        case 'KNOWLEDGE_DRAFT_UPDATED':
          newRunState.evidenceChain.knowledgeDrafts = newRunState.evidenceChain.knowledgeDrafts.map(d => 
            d.id === data.id ? { ...d, ...data.updates } : d
          );
          break;
        case 'ACCEPTANCE_CRITERIA_SET':
          newRunState.acceptance.criteria = data;
          newRunState.acceptance.status = 'checking';
          break;
        case 'ACCEPTANCE_CHECKED':
          newRunState.acceptance = { ...newRunState.acceptance, ...data };
          if (data.status === 'accepted') {
            newStage = 'accept';
          } else if (data.status === 'fail') {
            // Handle fail
          }
          break;
        case 'ACCEPTANCE_PASSED':
          newStage = 'accept';
          break;
        case 'ACCEPTANCE_FAILED':
          // Stay in current stage or provide guidance
          break;
        case 'REPORT_PREVIEWED':
          // Just logging
          break;
        case 'REPORT_DOWNLOADED':
          // Just logging
          break;
        case 'CASE_LIBRARY_OPENED':
          // Just logging
          break;
        case 'KNOWLEDGE_LIBRARY_OPENED':
          // Just logging
          break;
        case 'ITEM_DETAIL_OPENED':
          // Just logging
          break;
        case 'REPORT_GENERATED':
          window.dispatchEvent(new CustomEvent('ReportGeneratedEvent', { detail: data }));
          newRunState.outputs.report = { ...newRunState.outputs.report, status: 'ready', ...data };
          break;
        case 'CASE_SAVED':
          newRunState.outputs.caseRecord = { status: 'saved', caseId: data.caseId };
          newRunState.knowledgeDeposit = true;
          break;
        case 'KNOWLEDGE_SAVED':
          newRunState.outputs.knowledgeRecord = { status: 'saved', knowledgeId: data.knowledgeId };
          newRunState.knowledgeDeposit = true;
          // Also mark all drafts as saved when the final archive happens
          newRunState.evidenceChain.knowledgeDrafts = newRunState.evidenceChain.knowledgeDrafts.map(d => ({ ...d, status: 'saved' }));
          break;
        case 'KNOWLEDGE_DRAFT_ARCHIVED':
          newRunState.evidenceChain.knowledgeDrafts = newRunState.evidenceChain.knowledgeDrafts.map(d => 
            d.id === data.id ? { ...d, status: 'saved' } : d
          );
          break;
        case 'DOWNLOAD_REPORT_CLICKED':
          // Just logging
          break;
      }

      // Deduplicate knowledgeDrafts before returning
      if (newRunState.evidenceChain.knowledgeDrafts) {
        const seenIds = new Set();
        newRunState.evidenceChain.knowledgeDrafts = newRunState.evidenceChain.knowledgeDrafts.filter((d: any) => {
          if (seenIds.has(d.id)) return false;
          seenIds.add(d.id);
          return true;
        });
      }

      // Update furthestStage if needed
      const STAGE_ORDER: RunStage[] = ['collect', 'diagnose', 'execute', 'accept'];
      const currentFurthestIndex = STAGE_ORDER.indexOf(newRunState.furthestStage || 'collect');
      const newStageIndex = STAGE_ORDER.indexOf(newStage);
      
      if (newStageIndex > currentFurthestIndex) {
        newRunState.furthestStage = newStage;
      }

      // Update system_state based on events
      let newSystemState = { ...state.system_state };
      switch (event) {
        case 'DATA_UPLOADED':
          newSystemState.current_stage = 'diagnosis';
          break;
        case 'ANALYSIS_COMPLETED':
        case 'AI_DIAGNOSIS_COMPLETED':
          newSystemState.diagnosis_result = 'shading';
          newSystemState.current_stage = 'execution';
          break;
        case 'DIAG_CONFLICT':
          newSystemState.diagnosis_result = 'conflict';
          newSystemState.current_stage = 'diagnosis';
          break;
        case 'DIAGNOSIS_RESOLVED':
          newSystemState.diagnosis_result = (data.resolution === 'use_human' || data.resolution === 're_verify') ? 'dust' : 'shading';
          newSystemState.current_stage = 'execution';
          break;
        case 'TASK_OWNER_CONFIRMED':
        case 'HUMAN_REVIEW_COMPLETED':
          newSystemState.task_status = 'confirmed';
          break;
        case 'TASK_ASSIGNED':
        case 'TASK_STARTED':
          newSystemState.task_status = 'running';
          break;
        case 'RISK_TRIGGERED':
          newSystemState.risk_status = 'warning';
          break;
        case 'PROGRESS_UPDATED':
          if (data.progress === 100) {
            newSystemState.task_status = 'completed';
            newSystemState.current_stage = 'acceptance';
          }
          break;
        case 'TASK_COMPLETED':
          newSystemState.task_status = 'completed';
          newSystemState.current_stage = 'acceptance';
          break;
        case 'ACCEPTANCE_PASSED':
        case 'ACCEPTANCE_COMPLETED':
          newSystemState.acceptance_status = 'passed';
          break;
        case 'KNOWLEDGE_SAVED':
          newSystemState.knowledge_status = 'stored';
          newSystemState.current_stage = 'closed';
          break;
      }

      return {
        ...state,
        run: {
          ...newRunState,
          stage: newStage
        },
        system_state: newSystemState
      };
    }
    case 'SET_POWEROPS_STATE':
      return {
        ...state,
        powerOpsState: action.payload
      };
    case 'SET_POWEROPS_WORKBENCH_STEP':
      return {
        ...state,
        powerOpsWorkbenchStep: action.payload
      };
    case 'SET_POWEROPS_SUBMODULE':
      return {
        ...state,
        powerOpsSubModule: action.payload
      };
    case 'UPDATE_POWEROPS_WORKBENCH_DATA':
      return {
        ...state,
        powerOpsWorkbenchData: { ...state.powerOpsWorkbenchData, ...action.payload }
      };
    case 'ADD_POWEROPS_LEDGER_ENTRY':
      return {
        ...state,
        powerOpsClosedLoopLedger: [action.payload, ...(state.powerOpsClosedLoopLedger || [])]
      };
    case 'UPSERT_DYNAMIC_TICKET': {
      const existsIndex = state.dynamic_ticket_store.findIndex(t => t.run_id === action.payload.run_id);
      let newStore;
      if (existsIndex !== -1) {
        newStore = [...state.dynamic_ticket_store];
        const existing = newStore[existsIndex];
        newStore[existsIndex] = {
          ...action.payload,
          created_at: existing.created_at,
          expires_at: existing.expires_at
        };
      } else {
        window.dispatchEvent(new CustomEvent('TicketCreatedEvent', { detail: action.payload }));
        newStore = [action.payload, ...state.dynamic_ticket_store];
      }
      return { ...state, dynamic_ticket_store: newStore };
    }
    case 'UPDATE_DYNAMIC_TICKET_STATUS': {
      const { ticket_id, status } = action.payload;
      if (status === 'Completed') {
        window.dispatchEvent(new CustomEvent('TicketCompletedEvent', { detail: { ticket_id } }));
      }
      const newStore = state.dynamic_ticket_store.map(t => 
        t.ticket_id === ticket_id ? { ...t, status } : t
      );
      return { ...state, dynamic_ticket_store: newStore };
    }
    case 'DELETE_DYNAMIC_TICKET': {
      const ticket_id = action.payload;
      const newStore = state.dynamic_ticket_store.filter(t => t.ticket_id !== ticket_id);
      return { ...state, dynamic_ticket_store: newStore };
    }
    case 'CLEANUP_EXPIRED_TICKETS': {
      const now = Date.now();
      const newStore = state.dynamic_ticket_store.filter(t => t.expires_at > now);
      if (newStore.length === state.dynamic_ticket_store.length) return state;
      return { ...state, dynamic_ticket_store: newStore };
    }
    case 'UPSERT_DYNAMIC_REPORT': {
      const existsIndex = state.dynamic_report_store.findIndex(r => r.run_id === action.payload.run_id);
      let newStore;
      if (existsIndex !== -1) {
        newStore = [...state.dynamic_report_store];
        const existing = newStore[existsIndex];
        newStore[existsIndex] = {
          ...action.payload,
          created_at: existing.created_at,
          expires_at: existing.expires_at
        };
      } else {
        window.dispatchEvent(new CustomEvent('ReportGeneratedEvent', { detail: action.payload }));
        newStore = [action.payload, ...state.dynamic_report_store];
      }
      return { ...state, dynamic_report_store: newStore };
    }
    case 'CLEANUP_EXPIRED_REPORTS': {
      const now = Date.now();
      const newStore = state.dynamic_report_store.filter(r => r.expires_at > now);
      if (newStore.length === state.dynamic_report_store.length) return state;
      return { ...state, dynamic_report_store: newStore };
    }
    case 'ADD_AGENT_ACTION':
      return {
        ...state,
        agent_actions: [...state.agent_actions, action.payload]
      };
    case 'EXECUTE_AGENT_ACTION': {
      const actionId = action.payload;
      const agentAction = state.agent_actions.find(a => a.action_id === actionId);
      if (!agentAction) return state;

      const updatedActions = state.agent_actions.map(a => 
        a.action_id === actionId ? { ...a, execution_status: 'completed' as const } : a
      );

      let newState = { ...state, agent_actions: updatedActions };

      if (agentAction.action_type === 'create_work_order' || agentAction.action_type === 'schedule_inspection') {
        const newTicket = {
          ticket_id: 'TKT-' + Date.now(),
          run_id: state.run.runId,
          ticket_name: agentAction.action_title,
          ticket_type: agentAction.action_type === 'create_work_order' ? 'AI建议' : '自动调度',
          source: 'AI建议',
          station: state.run.station.name,
          assignee: agentAction.action_type === 'schedule_inspection' ? '清洗机器人' : '待指派',
          priority: 'P1',
          status: '待执行',
          created_at: Date.now(),
          expires_at: Date.now() + 86400000 * 7,
          description: agentAction.action_description
        };
        window.dispatchEvent(new CustomEvent('TicketCreatedEvent', { detail: newTicket }));
        newState.dynamic_ticket_store = [newTicket, ...state.dynamic_ticket_store];
        newState.system_state = { ...newState.system_state, task_status: 'AI_TASK_CREATED' };
      } else if (agentAction.action_type === 'generate_report') {
        const newReport = {
          report_id: 'REP-' + Date.now(),
          run_id: state.run.runId,
          report_title: agentAction.action_title,
          report_type: 'AI分析报告',
          source: '风险分析',
          station: state.run.station.name,
          created_at: Date.now(),
          expires_at: Date.now() + 86400000 * 30,
          file_size: '1.2 MB',
          status: 'ready',
          summary: agentAction.action_description,
          preview_data: {
            diagnosis_conclusion: 'AI 自动生成',
            task_result: '正常',
            risk_result: '已识别',
            acceptance_result: '待评估',
            knowledge_result: '待沉淀'
          }
        };
        window.dispatchEvent(new CustomEvent('ReportGeneratedEvent', { detail: newReport }));
        newState.dynamic_report_store = [newReport, ...state.dynamic_report_store];
        newState.system_state = { ...newState.system_state, knowledge_status: 'AI_REPORT_GENERATED' };
      }

      return newState;
    }
    default:
      return state;
    }
  } catch (error) {
    console.error('Reducer error:', error, action);
    return state;
  }
}

const getInitialState = (): GlobalState => {
  try {
    const savedAuth = localStorage.getItem('auxenta_auth');
    const authData = savedAuth ? JSON.parse(savedAuth) : null;
    
    const savedRun = localStorage.getItem('auxenta_run');
    let runData = savedRun ? JSON.parse(savedRun) : null;

    // Deduplicate knowledgeDrafts if they exist in saved state
    if (runData?.evidenceChain?.knowledgeDrafts) {
      const seenIds = new Set();
      runData.evidenceChain.knowledgeDrafts = runData.evidenceChain.knowledgeDrafts.filter((d: any) => {
        if (seenIds.has(d.id)) return false;
        seenIds.add(d.id);
        return true;
      });
    }

    const savedModule = localStorage.getItem('auxenta_module');
    const moduleData = savedModule ? JSON.parse(savedModule) : null;

    const savedDynamicTickets = localStorage.getItem('auxenta_dynamic_tickets');
    let dynamicTicketsData = savedDynamicTickets ? JSON.parse(savedDynamicTickets) : [];

    const savedDynamicReports = localStorage.getItem('auxenta_dynamic_reports');
    let dynamicReportsData = savedDynamicReports ? JSON.parse(savedDynamicReports) : [];

    // Cleanup expired tickets and reports on load
    const now = Date.now();
    dynamicTicketsData = dynamicTicketsData.filter((t: any) => t.expires_at > now);
    dynamicReportsData = dynamicReportsData.filter((r: any) => r.expires_at > now);

    return {
      ...initialState,
      isInitialized: true,
      isAuthenticated: !!authData,
      currentUserRole: authData?.role || null,
      currentModule: moduleData?.currentModule || initialState.currentModule,
      currentSubModule: moduleData?.currentSubModule || initialState.currentSubModule,
      powerOpsSubModule: moduleData?.powerOpsSubModule || initialState.powerOpsSubModule,
      dynamic_ticket_store: dynamicTicketsData,
      dynamic_report_store: dynamicReportsData,
      run: runData ? { 
        ...initialState.run, 
        ...runData,
        evidenceChain: { ...initialState.run.evidenceChain, ...runData.evidenceChain },
        execution: { ...initialState.run.execution, ...runData.execution },
        acceptance: { ...initialState.run.acceptance, ...runData.acceptance }
      } : initialState.run
    };
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    localStorage.removeItem('auxenta_auth');
    localStorage.removeItem('auxenta_run');
    localStorage.removeItem('auxenta_module');
    localStorage.removeItem('auxenta_dynamic_tickets');
    localStorage.removeItem('auxenta_dynamic_reports');
    return { ...initialState, isInitialized: true };
  }
};

export const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(globalReducer, getInitialState());

  // Persist auth state and run state
  React.useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem('auxenta_auth', JSON.stringify({ role: state.currentUserRole }));
    } else {
      localStorage.removeItem('auxenta_auth');
    }
    
    localStorage.setItem('auxenta_run', JSON.stringify(state.run));
    
    localStorage.setItem('auxenta_module', JSON.stringify({
      currentModule: state.currentModule,
      currentSubModule: state.currentSubModule,
      powerOpsSubModule: state.powerOpsSubModule
    }));

    localStorage.setItem('auxenta_dynamic_tickets', JSON.stringify(state.dynamic_ticket_store));
    localStorage.setItem('auxenta_dynamic_reports', JSON.stringify(state.dynamic_report_store));
  }, [state.isAuthenticated, state.currentUserRole, state.run, state.currentModule, state.currentSubModule, state.powerOpsSubModule, state.dynamic_ticket_store, state.dynamic_report_store]);

  const value = React.useMemo(() => ({ state, dispatch }), [state, dispatch]);

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalStore = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalStore must be used within a GlobalProvider');
  }
  return context;
};
