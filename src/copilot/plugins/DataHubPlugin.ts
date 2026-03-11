import { CopilotPlugin, WorkContext } from '../types';

export const DataHubPlugin: CopilotPlugin = {
  id: 'plugin_data_hub',
  name: '数据中心插件',
  match: (ctx: WorkContext) => ctx.module === 'data-hub',
  renderBubble: () => ({
    title: '数据监控',
    content: '昨日数据同步存在异常，请检查。',
    actions: ['OPEN_REPORT_PREVIEW']
  }),
  renderDrawer: () => ({
    title: '数据质量报告',
    sections: [
      {
        title: '同步状态',
        content: '整体同步率 98.5%，2 个任务失败。',
        type: 'warning'
      },
      {
        title: '异常分析',
        content: '失败原因主要为源系统连接超时，建议检查网络配置。',
        type: 'analysis'
      }
    ],
    actions: ['DOWNLOAD_REPORT']
  })
};
