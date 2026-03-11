import { CopilotActionDefinition, WorkContext } from '../types';
import { Copy, Download, Eye, Zap, FileText, Bell, Info, Network, Shield, Tags, CheckCircle } from 'lucide-react';

class ActionRegistry {
  private actions: Map<string, CopilotActionDefinition> = new Map();

  register(action: CopilotActionDefinition) {
    this.actions.set(action.id, action);
  }

  get(id: string): CopilotActionDefinition | undefined {
    return this.actions.get(id);
  }

  getAll(): CopilotActionDefinition[] {
    return Array.from(this.actions.values());
  }

  async execute(id: string, context: WorkContext, payload?: any) {
    const action = this.get(id);
    if (action) {
      console.log(`[ActionRegistry] Executing ${id}`, payload);
      await action.handler(context, payload);
    } else {
      console.warn(`[ActionRegistry] Action ${id} not found`);
    }
  }
}

export const actionRegistry = new ActionRegistry();

// Register Default Actions
actionRegistry.register({
  id: 'COPY_SHARE_LINK',
  label: '复制分享链接',
  icon: Copy,
  handler: () => {
    // Mock copy
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert(`链接已复制到剪贴板: ${url}`);
    }).catch(() => {
      alert('复制失败，请手动复制');
    });
  }
});

actionRegistry.register({
  id: 'DOWNLOAD_REPORT',
  label: '下载报告',
  icon: Download,
  handler: () => {
    alert('正在生成报告... 下载已开始 (Mock: report.pdf)');
  }
});

actionRegistry.register({
  id: 'OPEN_REPORT_PREVIEW',
  label: '预览报告',
  icon: Eye,
  handler: () => {
    alert('打开报告预览模态框 (Mock)');
  }
});

actionRegistry.register({
  id: 'NUDGE_TASK_SINGLE',
  label: '催办任务',
  icon: Bell,
  handler: (_ctx, payload) => {
    alert(`已发送催办通知给任务负责人 (TaskID: ${payload?.taskId || 'Unknown'})`);
  }
});

actionRegistry.register({
  id: 'NUDGE_TASK_ALL',
  label: '一键催办',
  icon: Zap,
  handler: () => {
    alert('已批量发送催办通知给所有逾期任务负责人');
  }
});

actionRegistry.register({
  id: 'GENERATE_ADJUST_PLAN',
  label: '生成调整计划',
  icon: FileText,
  handler: () => {
    alert('调整计划草稿已生成，请在抽屉中查看详情');
  }
});

actionRegistry.register({
  id: 'EXPLAIN_FRAMEWORK',
  label: '解释知识框架',
  icon: Info,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '解释知识框架' }));
  }
});

actionRegistry.register({
  id: 'DEMO_MAPPING',
  label: '演示行业映射',
  icon: Network,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '演示行业映射' }));
  }
});

actionRegistry.register({
  id: 'VIEW_RULES',
  label: '查看规则影响',
  icon: Shield,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '查看规则影响' }));
  }
});

actionRegistry.register({
  id: 'RUN_PATH_TEST',
  label: '运行路径测试',
  icon: Zap,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '运行测试' }));
  }
});

actionRegistry.register({
  id: 'SMART_TAGGING',
  label: '一键打标',
  icon: Tags,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '一键打标' }));
  }
});

actionRegistry.register({
  id: 'SAVE_RULES',
  label: '保存规则',
  icon: CheckCircle,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '保存规则' }));
  }
});

actionRegistry.register({
  id: 'DEMO_INVEST_GRAPH',
  label: '演示招商图谱',
  icon: Network,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '演示招商图谱' }));
  }
});

actionRegistry.register({
  id: 'DEMO_NODE_DETAIL',
  label: '演示节点详情',
  icon: Info,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '演示节点详情' }));
  }
});

actionRegistry.register({
  id: 'DEMO_SMART_TAGGING',
  label: '演示智能打标',
  icon: Tags,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '演示智能打标' }));
  }
});

actionRegistry.register({
  id: 'DEMO_RULE_LINKAGE',
  label: '演示规则联动',
  icon: Zap,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '演示规则联动' }));
  }
});

actionRegistry.register({
  id: 'GENERATE_BRIEF',
  label: '生成学习简报',
  icon: FileText,
  handler: () => {
    window.dispatchEvent(new CustomEvent('copilot-input', { detail: '生成知识学习简报' }));
  }
});

actionRegistry.register({
  id: 'EXECUTE_P0_CLEAN',
  label: '立即执行 P0 清洗',
  icon: Zap,
  handler: () => {
    window.dispatchEvent(new CustomEvent('powerops-execute', { detail: { actionId: 'act-1' } }));
  }
});

// PowerOps State Machine Events (V0.9)
const powerOpsEvents = [
  { id: 'E_CLICK_RISK', label: '查看风险洞察' },
  { id: 'E_KPI_DROP', label: '查看收益下降' },
  { id: 'E_OPEN_WORKBENCH', label: '进入工作台' },
  { id: 'E_CLICK_TRACE', label: '进入溯源分析' },
  { id: 'E_CLICK_PLAN', label: '生成处置预案' },
  { id: 'E_BACK', label: '返回' },
  { id: 'E_APPROVE_PLAN', label: '批准并下发' },
  { id: 'E_REQUEST_EVIDENCE', label: '要求补充证据' },
  { id: 'E_CONFIRM_DISPATCH', label: '确认下发' },
  { id: 'E_EDIT_TASKPACK', label: '修改任务包' },
  { id: 'E_DRONE_FINDING', label: '查看回传' },
  { id: 'E_ROBOT_CLEAN_DONE', label: '完成清洗' },
  { id: 'E_EXEC_DONE', label: '执行完成' },
  { id: 'E_WRITE_LEDGER', label: '写入台账' },
  { id: 'E_EXPORT_REPORT', label: '导出报告' },
  { id: 'E_SAVE_TO_KNOWLEDGE', label: '入库沉淀' },
  { id: 'E_EXPLAIN_RISK', label: '解释当前风险' },
  { id: 'E_GENERATE_PLAN_COMP', label: '生成预案对比' },
  // Workflow Events
  { id: 'E_VIEW_DATA', label: '查看数据' },
  { id: 'E_START_DIAGNOSIS', label: '开始诊断' },
  { id: 'E_UPLOAD_DATA', label: '上传数据' },
  { id: 'E_VIEW_EVIDENCE', label: '查看证据链' },
  { id: 'E_RE_VERIFY', label: '发起二次核验' },
  { id: 'E_CONFIRM_PLAN', label: '确认预案' },
  { id: 'E_MANUAL_REVIEW', label: '人工复核' },
  { id: 'E_VIEW_RISKS', label: '查看风险' },
  { id: 'E_GENERATE_MITIGATION', label: '生成缓解方案' },
  { id: 'E_VIEW_TASKS', label: '查看任务' },
  { id: 'E_PREVIEW_REPORT', label: '预览报告' },
  { id: 'E_DOWNLOAD_REPORT', label: '下载报告' },
  { id: 'E_VIEW_CASES', label: '查看案例归档' },
  { id: 'E_VIEW_KNOWLEDGE', label: '查看知识入库' },
  { id: 'E_CONTINUE_EXEC', label: '继续执行' },
  { id: 'E_CONFIRM_ASSIGNEES', label: '任务责任人建议' },
  { id: 'E_ADJUST_CRITERIA', label: '验收标准建议' },
  { id: 'E_ADOPT_CRITERIA', label: '采用建议' },
  { id: 'E_CONFIRM_TASKS', label: '确认指派' },
  { id: 'E_CRITERIA_CONFIRMED', label: '确认标准' },
  { id: 'E_REV_FORECAST', label: '收益预测' },
  { id: 'NAV_WORKBENCH', label: '进入工作台' },
  { id: 'E_GENERATE_PLAN', label: '生成预案' },
];

powerOpsEvents.forEach(evt => {
  actionRegistry.register({
    id: evt.id,
    label: evt.label,
    icon: Zap,
    handler: () => {
      window.dispatchEvent(new CustomEvent('powerops-event', { 
        detail: { event: evt.id, label: evt.label } 
      }));
      
      // Feedback logic
      let feedback = `已触发：${evt.label}`;
      if (evt.id === 'E_VIEW_EVIDENCE') feedback = '已打开证据链详情';
      if (evt.id === 'E_GENERATE_MITIGATION') feedback = '已生成缓解方案';
      if (evt.id === 'E_DOWNLOAD_REPORT') feedback = '已触发报告下载';
      if (evt.id === 'E_VIEW_CASES') feedback = '已打开案例归档弹窗';
      if (evt.id === 'E_VIEW_KNOWLEDGE') feedback = '已打开知识入库弹窗';

      window.dispatchEvent(new CustomEvent('copilot-notification', {
        detail: { title: '操作反馈', content: feedback, type: 'success' }
      }));
    }
  });
});
