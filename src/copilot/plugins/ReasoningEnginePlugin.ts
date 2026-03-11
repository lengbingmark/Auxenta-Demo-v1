import { CopilotPlugin, WorkContext } from '../types';

export const ReasoningEnginePlugin: CopilotPlugin = {
  id: 'plugin_reasoning_engine',
  name: '推理引擎插件',
  match: (ctx: WorkContext) => ctx.module === 'reasoning-engine',
  renderBubble: () => ({
    title: '模型状态',
    content: '招商评分模型 v2.1 运行中，准确率 94%。',
    actions: []
  }),
  renderDrawer: () => ({
    title: '模型运行监控',
    sections: [
      {
        title: '性能指标',
        content: '平均推理延迟 45ms，P99 延迟 120ms。',
        type: 'info'
      },
      {
        title: '优化建议',
        content: '模型 v2.2 已训练完成，建议在低峰期进行灰度发布。',
        type: 'suggestion'
      }
    ],
    actions: ['GENERATE_ADJUST_PLAN']
  })
};
