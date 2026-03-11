import { CopilotPlugin, WorkContext } from '../types';

export const InvestmentScenarioPlugin: CopilotPlugin = {
  id: 'plugin_scenario_investops',
  name: '招商场景插件',
  match: (ctx: WorkContext) => ctx.scenario === 'investops',
  renderBubble: (ctx) => {
    if (ctx.entity?.name) {
      return {
        title: '企业洞察',
        content: `正在分析 ${ctx.entity.name} 的投资潜力...`,
        actions: ['OPEN_REPORT_PREVIEW']
      };
    }
    return {
      title: '招商工作台',
      content: '当前有 5 个项目待初审，2 个项目待签约。',
      actions: ['NUDGE_TASK_ALL']
    };
  },
  renderDrawer: (ctx) => {
    if (ctx.entity?.name) {
      return {
        title: `${ctx.entity.name} - 深度分析`,
        sections: [
          {
            title: '企业画像',
            content: '该企业属于高新技术产业，近三年营收复合增长率超过 20%。',
            type: 'info'
          },
          {
            title: '风险提示',
            content: '近期存在 1 起法律诉讼，建议法务部门介入评估。',
            type: 'warning'
          },
          {
            title: '跟进建议',
            content: '建议安排实地考察，重点关注其研发团队稳定性。',
            type: 'suggestion'
          }
        ],
        actions: ['DOWNLOAD_REPORT', 'COPY_SHARE_LINK']
      };
    }
    return {
      title: '招商进度概览',
      sections: [
        {
          title: '漏斗分析',
          content: '本月新增线索 15 条，转化率 10% (环比上升 2%)。',
          type: 'analysis'
        },
        {
          title: '滞后项目',
          content: '“未来科技园二期”项目签约进度滞后 3 天。',
          type: 'warning'
        }
      ],
      actions: ['NUDGE_TASK_ALL', 'GENERATE_ADJUST_PLAN']
    };
  }
};
