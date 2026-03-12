import { CopilotPlugin, WorkContext } from '../types';

export const RuralOpsPlugin: CopilotPlugin = {
  id: 'plugin_scenario_ruralops',
  name: '乡村振兴插件',
  match: (ctx: WorkContext) => ctx.scenario === 'ruralops',
  renderBubble: (ctx) => ({
    title: '乡村振兴',
    content: '本季度农产品产量同比增长 5%，重点项目进度正常。',
    actions: []
  }),
  renderDrawer: (ctx) => ({
    title: '乡村振兴态势',
    sections: [
      {
        title: '农业数据',
        content: '全区粮食播种面积 50 万亩，预计秋粮丰收。',
        type: 'info'
      },
      {
        title: '产业帮扶',
        content: '特色水果种植基地项目已完成 80% 投资额。',
        type: 'analysis'
      }
    ],
    actions: ['DOWNLOAD_REPORT']
  })
};

export const LowAltitudeOpsPlugin: CopilotPlugin = {
  id: 'plugin_scenario_lowaltitudeops',
  name: '低空经济插件',
  match: (ctx: WorkContext) => ctx.scenario === 'lowaltitudeops',
  renderBubble: (ctx) => ({
    title: '低空经济',
    content: '检测到 A 区有临时空域管制通知，请注意航线规划。',
    actions: []
  }),
  renderDrawer: (ctx) => ({
    title: '低空飞行监测',
    sections: [
      {
        title: '空域管制',
        content: '接空管局通知，A 区今日 14:00-16:00 实施临时禁飞。',
        type: 'warning'
      },
      {
        title: '飞行架次',
        content: '今日累计飞行 128 架次，物流配送占比 60%。',
        type: 'info'
      }
    ],
    actions: []
  })
};

export const PowerOpsPlugin: CopilotPlugin = {
  id: 'plugin_scenario_powerops',
  name: '电力能源插件',
  match: (ctx: WorkContext) => ctx.scenario === 'powerops',
  renderBubble: (ctx) => ({
    title: '资产运行监控',
    content: '当前电站运行综合效率(PR)为 82.4%，检测到局部区域存在污染累积风险，建议启动智能诊断。',
    actions: ['view-risks']
  }),
  renderDrawer: (ctx) => {
    const run = ctx.run;
    if (!run) {
      return {
        title: '能源保供监控',
        sections: [
          { title: '负荷预测', content: '受高温天气影响，预计 19:00 达到日负荷峰值。', type: 'analysis' },
          { title: '设备状态', content: '主网设备运行平稳，无重大缺陷告警。', type: 'info' }
        ],
        actions: ['NUDGE_TASK_ALL']
      };
    }

    const sections: any[] = [];
    const actions: string[] = [];

    switch (run.stage) {
      case 'collect':
        sections.push({
          title: '数据采集详情',
          content: `已采集到 ${run.evidenceChain.metricsCards.length} 项运行指标。数据源：${run.dataSource.fileName || '实时API'}。`,
          type: 'info'
        });
        actions.push('DOWNLOAD_REPORT');
        break;
      case 'diagnose':
        sections.push({
          title: '诊断深度分析',
          content: `AI 判定积灰概率 94%。主要依据：PR 值较历史同期下降 5.2%，且近期存在沙尘天气。`,
          type: 'analysis'
        });
        if (run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT') {
          sections.push({
            title: '诊断分歧学习',
            content: `检测到人机分歧：AI判定为积灰，人工判定为遮挡。已生成“诊断分歧案例草稿”，包含证据差异分析与最终决策路径。`,
            type: 'warning'
          });
          sections.push({
            title: '知识标签',
            content: '诊断冲突, 证据链优化, 积灰识别',
            type: 'info'
          });
        } else {
          sections.push({
            title: '核验状态',
            content: `无人机巡检：${run.evidenceChain.verification.uav.status === 'completed' ? '已完成' : '待执行'}。`,
            type: 'info'
          });
        }
        actions.push('E_VIEW_EVIDENCE');
        break;
      case 'execute':
        const task = run.execution.tasks[0];
        const resolvedRisk = run.execution.risks.find(r => r.status === 'closed' && r.resolvedAt && (Date.now() - r.resolvedAt < 30000));
        
        if (resolvedRisk) {
          sections.push({
            title: '风险处置经验',
            content: `风险“${resolvedRisk.title}”已通过优先级调整成功缓解。该处置策略已记录，可用于后续类似进度风险自动推荐。`,
            type: 'analysis'
          });
          sections.push({
            title: '处置标签',
            content: '进度风险, 调度优化, 运维协同',
            type: 'info'
          });
        }

        sections.push({
          title: '执行监控',
          content: `当前任务：${task?.title}。执行资源：${task?.ownerName}。进度：${task?.progress}%。`,
          type: 'info'
        });
        if (run.execution.risks.length > 0 && !resolvedRisk) {
          sections.push({
            title: '风险预警',
            content: `检测到 ${run.execution.risks.length} 项潜在风险，建议生成缓解方案。`,
            type: 'warning'
          });
        }
        actions.push('E_VIEW_TASKS');
        break;
      case 'accept':
        if (run.acceptance.status === 'accepted') {
          sections.push({
            title: '效益提升总结',
            content: `PR 值从 76.5% 恢复至 ${run.acceptance.metrics?.pr || '82.1%'}。本次运维闭环耗时 4.5 小时，效率优于平均水平。`,
            type: 'success'
          });
          sections.push({
            title: '可复用实践',
            content: '采用“巡检+机器人定点清洗”组合方案，在保证PR恢复效果的同时降低了 30% 的运维成本。',
            type: 'analysis'
          });
          sections.push({
            title: '推荐标签',
            content: 'PR恢复, 成本优化, 闭环效率',
            type: 'info'
          });
        } else {
          sections.push({
            title: '验收总结',
            content: `清洗后 PR 值恢复至 ${run.acceptance.metrics?.pr || '--'}。收益恢复预测：${run.acceptance.metrics?.recovery || '--'}。`,
            type: 'success'
          });
        }
        actions.push('E_PREVIEW_REPORT', 'E_DOWNLOAD_REPORT');
        break;
    }

    return {
      title: '运维详细分析',
      sections,
      actions
    };
  }
};

export const PoliceOpsPlugin: CopilotPlugin = {
  id: 'plugin_scenario_policeops',
  name: '智慧警务插件',
  match: (ctx: WorkContext) => ctx.scenario === 'policeops',
  renderBubble: (ctx) => ({
    title: '智慧警务',
    content: '今日辖区治安状况良好，重点部位巡逻警力已部署。',
    actions: []
  }),
  renderDrawer: (ctx) => ({
    title: '社会治安态势',
    sections: [
      {
        title: '警情监控',
        content: '今日接警数同比下降 10%，主要为纠纷类警情。',
        type: 'info'
      },
      {
        title: '巡防部署',
        content: '重点商圈及学校周边已安排特警巡逻。',
        type: 'info'
      }
    ],
    actions: []
  })
};

export const GovPMOPlugin: CopilotPlugin = {
  id: 'plugin_scenario_govpmo',
  name: '政务督办插件',
  match: (ctx: WorkContext) => ctx.scenario === 'govpmo',
  renderBubble: (ctx) => ({
    title: '政务督办',
    content: '有 2 个督办事项即将逾期，请及时处理。',
    actions: ['NUDGE_TASK_ALL']
  }),
  renderDrawer: (ctx) => ({
    title: '督办事项概览',
    sections: [
      {
        title: '逾期预警',
        content: '“数字政府建设项目”进度滞后，剩余工期不足 5 天。',
        type: 'warning'
      },
      {
        title: '完成情况',
        content: '本月已办结督办事项 15 件，办结率 92%。',
        type: 'analysis'
      }
    ],
    actions: ['NUDGE_TASK_ALL', 'GENERATE_ADJUST_PLAN']
  })
};
