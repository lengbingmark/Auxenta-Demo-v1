import { CopilotPlugin, WorkContext } from '../types';

export const BaseOverviewPlugin: CopilotPlugin = {
  id: 'plugin_base_overview',
  name: '底座概览插件',
  match: (ctx: WorkContext) => ctx.module === 'overview',
  renderBubble: () => ({
    title: '系统概览',
    content: '今日系统运行平稳，有 3 项待处理审批。',
    actions: ['OPEN_REPORT_PREVIEW']
  }),
  renderDrawer: () => ({
    title: '智能运营日报',
    sections: [
      {
        title: '核心指标',
        content: '活跃用户数环比增长 12%，系统负载 45% (健康)。',
        type: 'info'
      },
      {
        title: '风险提示',
        content: '检测到 2 个非关键告警，主要集中在数据同步模块。',
        type: 'warning'
      },
      {
        title: '行动建议',
        content: '建议优先处理待办事项中的“企业资质审核”任务。',
        type: 'suggestion'
      }
    ],
    actions: ['DOWNLOAD_REPORT', 'OPEN_REPORT_PREVIEW']
  })
};
