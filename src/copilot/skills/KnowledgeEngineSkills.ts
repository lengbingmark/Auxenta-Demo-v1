import { WorkContext } from '../types';
import { PersonaEngine } from '../core/PersonaEngine';
import { SkillResult, Skill } from '../core/SkillRegistry';

// --- Mock Data for Scripts ---
const INVEST_NODES = [
  // Core
  { id: 'invest_core', name: '招商运营核心', group: 'core', type: 'concept', desc: '招商运营知识体系的顶层核心，连接产业链、政策与企业。' },
  
  // Chains
  { id: 'chain_ai', name: 'AI视觉产业链', group: 'chain', type: 'industry', desc: '涵盖算法研发、芯片设计、摄像头模组及下游集成应用。' },
  { id: 'chain_low', name: '低空经济产业链', group: 'chain', type: 'industry', desc: '包含无人机制造、空域管理系统、低空物流配送等。' },
  { id: 'chain_semi', name: '半导体产业链', group: 'chain', type: 'industry', desc: '涉及晶圆代工、封装测试、EDA工具及半导体材料。' },
  { id: 'chain_energy', name: '新能源产业链', group: 'chain', type: 'industry', desc: '包括动力电池、充电桩基础设施、整车制造。' },

  // Enterprises
  { id: 'ent_a', name: '极目视觉 (AI视觉)', group: 'enterprise', type: 'company', tags: ['高新技术', 'B轮', '研发密集'], evidence: '2023年研发投入占比达42%，拥有专利56项。' },
  { id: 'ent_b', name: '翼飞科技 (无人机)', group: 'enterprise', type: 'company', tags: ['专精特新', '独角兽'], evidence: '在工业级无人机市场占有率连续三年排名前三。' },
  { id: 'ent_c', name: '芯源微电子', group: 'enterprise', type: 'company', tags: ['国产替代', 'A轮'], evidence: '核心团队来自国际顶尖半导体公司，具备5nm设计能力。' },
  { id: 'ent_d', name: '能动电池', group: 'enterprise', type: 'company', tags: ['固态电池', '制造型'], evidence: '已完成固态电池中试线建设，能量密度提升30%。' },
  { id: 'ent_e', name: '灵动机器人', group: 'enterprise', type: 'company', tags: ['协作机器人', '天使轮'], evidence: '创始人为国家级领军人才，拥有多项核心算法。' },

  // Policies
  { id: 'policy_tax', name: '高新企业税收减免', group: 'policy', type: 'rule', desc: '符合条件的企业可享受15%的优惠所得税率。' },
  { id: 'policy_talent', name: '领军人才安家补贴', group: 'policy', type: 'rule', desc: '对新引进的国家级领军人才给予最高200万补贴。' },
  { id: 'policy_land', name: '工业用地优惠政策', group: 'policy', type: 'rule', desc: '对符合产业链导向的项目优先保障用地，地价优惠。' },
  { id: 'policy_rd', name: '研发投入后补助', group: 'policy', type: 'rule', desc: '根据企业年度研发投入额度，给予最高10%的现金奖励。' },

  // Risks
  { id: 'risk_cash', name: '现金流压力', group: 'risk', type: 'risk', desc: '企业近期融资进度不及预期，可能存在短期资金缺口。' },
  { id: 'risk_comp', name: '合规性风险', group: 'risk', type: 'risk', desc: '部分核心技术涉及出口管制，需关注国际政策变动。' },
  { id: 'risk_market', name: '市场波动风险', group: 'risk', type: 'risk', desc: '下游需求受宏观经济影响较大，订单稳定性存疑。' },
  { id: 'risk_tech', name: '技术突破瓶颈', group: 'risk', type: 'risk', desc: '核心算法在极端环境下的稳定性仍需进一步验证。' },
  { id: 'risk_team', name: '核心团队稳定性', group: 'risk', type: 'risk', desc: 'CTO近期有变动传闻，可能影响后续研发进度。' },

  // Evaluation & Decision
  { id: 'eval_profile', name: '企业画像评价', group: 'decision', type: 'process' },
  { id: 'eval_risk', name: '风险综合评估', group: 'decision', type: 'process' },
  { id: 'eval_path', name: '推进路径决策', group: 'decision', type: 'process' },
  { id: 'eval_conclusion', name: '最终评审结论', group: 'decision', type: 'process' },

  // Outcomes
  { id: 'outcome_success', name: '建议签约', group: 'outcome', type: 'result' },
  { id: 'outcome_fail', name: '建议放弃', group: 'outcome', type: 'result' },
  { id: 'outcome_pending', name: '建议观察', group: 'outcome', type: 'result' },
];

const INVEST_LINKS = [
  // Core to Chains
  { source: 'invest_core', target: 'chain_ai', label: '包含' },
  { source: 'invest_core', target: 'chain_low', label: '包含' },
  { source: 'invest_core', target: 'chain_semi', label: '包含' },
  { source: 'invest_core', target: 'chain_energy', label: '包含' },

  // Chains to Enterprises
  { source: 'chain_ai', target: 'ent_a', label: '适配' },
  { source: 'chain_low', target: 'ent_b', label: '适配' },
  { source: 'chain_semi', target: 'ent_c', label: '适配' },
  { source: 'chain_energy', target: 'ent_d', label: '适配' },
  { source: 'chain_ai', target: 'ent_e', label: '适配' },

  // Enterprises to Policies
  { source: 'ent_a', target: 'policy_tax', label: '符合' },
  { source: 'ent_a', target: 'policy_rd', label: '符合' },
  { source: 'ent_b', target: 'policy_talent', label: '符合' },
  { source: 'ent_b', target: 'policy_land', label: '符合' },
  { source: 'ent_c', target: 'policy_tax', label: '符合' },
  { source: 'ent_c', target: 'policy_talent', label: '符合' },
  { source: 'ent_d', target: 'policy_land', label: '符合' },
  { source: 'ent_e', target: 'policy_rd', label: '符合' },

  // Enterprises to Risks
  { source: 'ent_a', target: 'risk_cash', label: '触发' },
  { source: 'ent_b', target: 'risk_comp', label: '触发' },
  { source: 'ent_c', target: 'risk_tech', label: '触发' },
  { source: 'ent_d', target: 'risk_market', label: '触发' },
  { source: 'ent_e', target: 'risk_team', label: '触发' },

  // Enterprises to Evaluation
  { source: 'ent_a', target: 'eval_profile', label: '输入' },
  { source: 'ent_b', target: 'eval_profile', label: '输入' },
  { source: 'ent_c', target: 'eval_profile', label: '输入' },

  // Evaluation flow
  { source: 'eval_profile', target: 'eval_risk', label: '传递' },
  { source: 'eval_risk', target: 'eval_path', label: '传递' },
  { source: 'eval_path', target: 'eval_conclusion', label: '传递' },

  // Conclusion to Outcomes
  { source: 'eval_conclusion', target: 'outcome_success', label: '指向' },
  { source: 'eval_conclusion', target: 'outcome_fail', label: '指向' },
  { source: 'eval_conclusion', target: 'outcome_pending', label: '指向' },

  // Risks to Evaluation
  { source: 'risk_cash', target: 'eval_risk', label: '影响' },
  { source: 'risk_comp', target: 'eval_risk', label: '影响' },
  { source: 'risk_team', target: 'eval_risk', label: '影响' },

  // Policies to Evaluation
  { source: 'policy_tax', target: 'eval_path', label: '支持' },
  { source: 'policy_land', target: 'eval_path', label: '支持' },
];

export const KnowledgeEngineSkills: Skill[] = [
  // S1: Explain Knowledge Engine
  {
    name: 'ExplainKnowledgeEngine',
    description: '解释知识引擎',
    trigger: (input) => input.includes('解释知识引擎') || input.includes('能力说明'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'info', desc: '用户请求解释知识引擎能力', module: '知识引擎' } });
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '行业知识引擎是 Auxenta 的“智慧大脑”。',
          '它能将非结构化的行业经验（如政策、案例、风险）转化为可计算、可推理的知识模型。',
          '核心价值在于：1. 知识沉淀与复用；2. 自动化风险识别；3. 智能化决策建议。',
          '您可以点击左侧的“知识框架”查看我们的通用方法论。'
        ),
        receipt: {
          status: 'info',
          title: '能力说明已开启',
          details: '模块: 知识引擎 | 核心维度: 7个 | 状态: 运行中',
          nextStep: '演示招商图谱'
        },
        suggestions: ['DemoInvestGraph', 'ExplainFramework']
      };
    }
  },
  // S2: Demo Invest Graph
  {
    name: 'DemoInvestGraph',
    description: '演示招商图谱',
    trigger: (input) => input.includes('演示招商图谱') || input.includes('招商演示剧本'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'KE_SET_INDUSTRY', payload: 'invest' });
      dispatch({ type: 'KE_SET_GRAPH_DATA', payload: { nodes: INVEST_NODES, links: INVEST_LINKS } });
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'demo', desc: '触发了招商演示剧本', module: '行业映射' } });
      
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '已为您切换至“招商运营”演示场景。',
          '系统已自动加载招商行业知识库，图谱现已聚焦于：产业链 -> 政策 -> 企业 -> 风险 -> 路径。',
          '您可以观察到节点间的复杂关联，这些关联构成了我们的推理基础。',
          '建议点击“某AI视觉龙头企业”查看详细画像。'
        ),
        receipt: {
          status: 'success',
          title: '招商场景已加载',
          details: '节点数: 11 | 关系数: 10 | 行业: 招商引资',
          nextStep: '演示节点详情'
        },
        suggestions: ['DemoNodeDetail', 'RunPathTest']
      };
    }
  },
  // S3: Demo Node Detail
  {
    name: 'DemoNodeDetail',
    description: '演示节点详情',
    trigger: (input) => input.includes('演示节点详情') || input.includes('选中企业节点'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'SELECT_ENTITY', payload: 'ent_a' });
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'view', desc: '自动聚焦企业节点：极目视觉', module: '行业映射' } });
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '已为您自动选中“某AI视觉龙头企业”节点。',
          '右侧抽屉已展示该企业的详细画像：包含行业标签、核心证据句以及系统推荐的推进路径。',
          '这些信息是基于图谱中的“符合”与“存在”关系自动生成的。',
          '您可以继续查看其关联的风险因子。'
        ),
        receipt: {
          status: 'info',
          title: '节点聚焦成功',
          details: '实体: 某AI视觉龙头企业 | 类型: 企业 | 标签数: 2',
          nextStep: '演示智能打标'
        },
        suggestions: ['DemoSmartTagging', 'AnalyzeRisk']
      };
    }
  },
  // S4: Demo Smart Tagging
  {
    name: 'DemoSmartTagging',
    description: '演示智能打标',
    trigger: (input) => input.includes('演示智能打标') || input.includes('打标演示'),
    execute: async (ctx, input, dispatch) => {
      const newTag = { id: 't_new', name: '潜在独角兽', category: 'enterprise', confidence: 0.92, evidence: '近期获得大额融资' };
      dispatch({ type: 'KE_ADD_TAG', payload: newTag });
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'tag', desc: '执行了智能打标并入库', module: '标签与学习' } });
      
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '智能打标演示已完成。',
          '系统识别出描述文本中的关键特征，并生成了“潜在独角兽”标签（置信度 92%）。',
          '该标签已自动关联至对应企业节点，并同步更新了图谱权重。',
          '您可以在“标签与学习”页查看完整打标记录。'
        ),
        receipt: {
          status: 'success',
          title: '打标入库成功',
          details: '新增标签: 潜在独角兽 | 置信度: 92% | 节点关联: 已完成',
          nextStep: '演示规则联动'
        },
        suggestions: ['DemoRuleLinkage', 'GenerateStageSummary']
      };
    }
  },
  // S5: Demo Rule Linkage
  {
    name: 'DemoRuleLinkage',
    description: '演示规则联动',
    trigger: (input) => input.includes('演示规则联动') || input.includes('权重联动'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'KE_UPDATE_RULE_WEIGHT', payload: { id: 'r2', weight: 0.95 } });
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'config', desc: '调整现金流风险权重至 0.95', module: '规则与权重' } });
      dispatch({ 
        type: 'KE_SET_TEST_RESULT', 
        payload: { 
          conclusion: '谨慎推进 / 需先风控', 
          risk: '高', 
          score: 68,
          reason: '现金流权重调高后，该企业的短期偿债风险触发了预警阈值。',
          path: ['初筛', '风控介入', '观察']
        } 
      });
      
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '规则联动演示已完成。',
          '我已将“现金流风险”权重调高至 0.95。',
          '由于权重变化，系统重新计算了决策结论：从“可推进”转变为“谨慎推进”。',
          '这展示了知识引擎如何通过动态规则调整来实时响应业务策略变化。'
        ),
        receipt: {
          status: 'warning',
          title: '决策结论已更新',
          details: '权重调整: 0.8 -> 0.95 | 结论: 谨慎推进 | 风险等级: 高',
          nextStep: '生成知识学习简报'
        },
        suggestions: ['GenerateBrief', 'ExplainModule']
      };
    }
  },
  // S6: Generate Knowledge Brief
  {
    name: 'GenerateBrief',
    description: '生成知识学习简报',
    trigger: (input) => input.includes('生成知识学习简报') || input.includes('学习简报'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'report', desc: '生成了知识学习简报', module: '知识引擎' } });
      dispatch({ type: 'KE_ADD_ARTIFACT', payload: { type: 'brief', title: '本周知识学习简报', time: Date.now() } });
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '本周知识学习简报已生成。',
          '摘要：本周新增知识节点 12 个，热点标签为“低空经济”；决策采纳率提升至 94%；识别出 3 处知识缺口建议完善。',
          '详细简报已存入“操作台账”，您可以随时查阅。',
          '是否需要将此简报同步给团队成员？'
        ),
        receipt: {
          status: 'success',
          title: '简报生成成功',
          details: '新增节点: 12 | 采纳率: 94% | 冲突数: 2',
          nextStep: 'ExplainModule'
        },
        suggestions: ['ExplainModule', 'DownloadReport']
      };
    }
  },
  // Existing Skills (Refactored to use KE actions)
  {
    name: 'ExplainFramework',
    description: '解释知识框架',
    trigger: (input) => input.includes('解释知识框架') || input.includes('框架是什么'),
    execute: async (ctx, input, dispatch) => {
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '知识框架是 Auxenta 行业引擎的核心方法论。',
          '它将行业知识抽象为实体、关系、证据、标签、规则、决策和结果七个标准维度。',
          '通过这种结构化，我们可以快速将一个行业的经验转化为可计算的规则。',
          '您可以点击左侧卡片查看每个维度的详细定义。'
        ),
        receipt: {
          status: 'info',
          title: '框架说明',
          details: '维度: 7 | 结构: 标准化 | 状态: 已激活',
          nextStep: 'DemoInvestGraph'
        }
      };
    }
  },
  {
    name: 'RunPathTest',
    description: '运行路径测试',
    trigger: (input) => input.includes('运行测试') || input.includes('测试路径'),
    execute: async (ctx, input, dispatch) => {
      dispatch({ type: 'KE_ADD_LOG', payload: { type: 'test', desc: '运行了路径测试', module: '规则与权重' } });
      dispatch({ 
        type: 'KE_SET_TEST_RESULT', 
        payload: { 
          conclusion: '可快速推进', 
          risk: '低', 
          score: 92,
          reason: '匹配度极高，且无明显风险因子触发。',
          path: ['初筛', '尽调', '签约']
        } 
      });
      return {
        success: true,
        message: PersonaEngine.formatReply(
          '路径测试已完成。',
          '基于模拟输入的“高新技术企业”类型，系统成功匹配了 3 条招商推进路径。',
          '推理过程耗时 120ms，规则覆盖率 100%。',
          '测试结果已在中间面板展示。'
        ),
        receipt: {
          status: 'success',
          title: '测试成功',
          details: '匹配路径: 3 | 耗时: 120ms | 结果: 符合预期',
          nextStep: 'DemoRuleLinkage'
        }
      };
    }
  },
];
