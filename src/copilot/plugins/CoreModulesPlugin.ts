import { CopilotPlugin, WorkContext } from '../types';

export const TagCenterPlugin: CopilotPlugin = {
  id: 'plugin_module_tag_center',
  name: '标签库插件',
  match: (ctx: WorkContext) => ctx.module === 'tag-center',
  renderBubble: (ctx) => ({
    title: '标签库',
    content: '当前共有 85 个活跃标签类别，覆盖企业、人口、地理等维度。',
    actions: []
  }),
  renderDrawer: (ctx) => ({
    title: '标签体系概览',
    sections: [
      {
        title: '标签分布',
        content: '基础属性标签 40%，行为偏好标签 35%，预测类标签 25%。',
        type: 'analysis'
      },
      {
        title: '热度监控',
        content: '“高新技术企业”标签本周调用次数环比增长 15%。',
        type: 'info'
      }
    ],
    actions: []
  })
};

export const ResourcePlugin: CopilotPlugin = {
  id: 'plugin_module_resource',
  name: '资源库插件',
  match: (ctx: WorkContext) => ctx.module === 'resource',
  renderBubble: (ctx) => ({
    title: '资源库',
    content: '资源库包含企业、人才、政策等多维数据，支持一键检索。',
    actions: []
  }),
  renderDrawer: (ctx) => ({
    title: '资源数据资产',
    sections: [
      {
        title: '企业库',
        content: '收录企业 12,405 家，其中规上企业 850 家。',
        type: 'info'
      },
      {
        title: '数据更新',
        content: '企业工商信息已于今日凌晨完成同步。',
        type: 'info'
      }
    ],
    actions: ['DOWNLOAD_REPORT']
  })
};
