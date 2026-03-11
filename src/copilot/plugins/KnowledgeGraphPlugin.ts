import { CopilotPlugin, WorkContext } from '../types';

export const KnowledgeEnginePlugin: CopilotPlugin = {
  id: 'plugin_knowledge_engine',
  name: '知识引擎插件',
  match: (ctx: WorkContext) => ctx.module === 'knowledge-graph',
  renderBubble: (ctx) => {
    if (ctx.subModule === 'framework') {
      return {
        title: '知识框架',
        content: '这是统一的行业知识方法论结构，包含目标、风险、决策等核心维度。',
        actions: ['EXPLAIN_FRAMEWORK']
      };
    }
    return {
      title: '知识引擎',
      content: '这里是行业知识引擎。我会将业务过程沉淀为行业知识模型，并反哺决策规则。',
      actions: ['EXPLAIN_FRAMEWORK', 'DEMO_MAPPING', 'VIEW_RULES']
    };
  },
  renderDrawer: (ctx) => ({
    title: '行业知识引擎分析',
    sections: [
      {
        title: '演示脚本库',
        content: '点击下方按钮快速体验知识引擎的核心功能。',
        type: 'info'
      },
      {
        title: '知识沉淀',
        content: '当前已沉淀 5 个行业大类，包含 1.2 万实体，关联密度 3.5。',
        type: 'info'
      }
    ],
    actions: [
      'DEMO_INVEST_GRAPH',
      'DEMO_NODE_DETAIL',
      'DEMO_SMART_TAGGING',
      'DEMO_RULE_LINKAGE',
      'GENERATE_BRIEF',
      'DOWNLOAD_REPORT'
    ]
  })
};
