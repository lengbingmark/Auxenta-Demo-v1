import React, { useEffect, useRef } from 'react';
import { useGlobalStore } from '../../store/GlobalStore';
import { useCopilot } from './CopilotContext';
import { toast } from 'react-hot-toast';

export const AgentBehaviorLayer: React.FC = () => {
  const { state: globalState, dispatch: globalDispatch } = useGlobalStore();
  const { state: copilotState, dispatch: copilotDispatch } = useCopilot();
  
  const lastPromptTimeRef = useRef<number>(0);
  const lastPromptTypeRef = useRef<string | null>(null);
  const isFirstWelcomeRef = useRef<boolean>(true);
  
  const prevTicketCountRef = useRef<number>(globalState.dynamic_ticket_store.length);
  const prevReportCountRef = useRef<number>(globalState.dynamic_report_store.length);
  const prevRiskStatusRef = useRef<string>(globalState.system_state.risk_status);
  const prevTicketStatusesRef = useRef<Record<string, string>>({});
  const globalStateRef = useRef(globalState);

  useEffect(() => {
    globalStateRef.current = globalState;
  }, [globalState]);

  // Initialize ticket statuses
  useEffect(() => {
    const statuses: Record<string, string> = {};
    globalState.dynamic_ticket_store.forEach(t => {
      statuses[t.ticket_id] = t.status;
    });
    prevTicketStatusesRef.current = statuses;
  }, []);

  const canPrompt = (type: string) => {
    const now = Date.now();
    const timeDiff = now - lastPromptTimeRef.current;
    if (timeDiff < 20000) return false; // 20s interval
    if (lastPromptTypeRef.current === type) return false; // No duplicate consecutive prompts of same type
    return true;
  };

  const triggerPrompt = (type: string, title: string, content: string, actions?: any[]) => {
    if (!canPrompt(type)) return;
    
    lastPromptTimeRef.current = Date.now();
    lastPromptTypeRef.current = type;
    
    // Use SET_NOTIFICATION to show in bubble
    copilotDispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        title,
        content,
        type: 'info',
        actions
      } as any
    });

    // Also add to chat history for persistence
    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `behavior-${type}-${Date.now()}`,
        role: 'assistant',
        content: `**${title}**\n${content}`,
        timestamp: Date.now(),
        type: 'text',
        actions
      }
    });
  };

  // 1. Welcome Message
  useEffect(() => {
    if (isFirstWelcomeRef.current && globalState.isInitialized && globalState.isAuthenticated) {
      isFirstWelcomeRef.current = false;
      
      let welcomeMsg = "欢迎回来，我正在持续监控系统运行状态。";
      const riskCount = globalState.run.execution.risks.filter(r => r.status === 'open').length;
      if (riskCount > 0) {
        welcomeMsg += `\n\n刚发现 ${riskCount} 个潜在风险，需要我为您分析吗？`;
      }
      
      triggerPrompt('welcome', '欢迎回来', welcomeMsg, [
        { label: '分析风险', event: 'E_CLICK_RISK', primary: true },
        { label: '查看待办', event: 'GENERATE_BRIEF' }
      ]);
    }
  }, [globalState.isInitialized, globalState.isAuthenticated]);

  // 2. Event Listeners for Real-time prompts
  useEffect(() => {
    const handleRisk = (e: any) => {
      const risk = e.detail;
      // Trigger Agent Proposal instead of just a prompt
      window.dispatchEvent(new CustomEvent('copilot-agent-propose', { 
        detail: { 
          action_type: 'schedule_inspection',
          action_title: '调度清洗机器人清洗',
          action_description: `检测到${risk.triggerReason || '组件污染'}风险，建议调度清洗机器人进行针对性清洗，预计挽回收益 +1.1%。`,
          target_module: 'work_order_center'
        } 
      }));
    };

    const handleTicketCreated = (e: any) => {
      const ticket = e.detail;
      triggerPrompt('ticket_created', '工单创建', "新的运维工单已创建，可以前往工单中心查看。", [
        { label: '查看工单', event: 'E_VIEW_TASKS', payload: { ticketId: ticket.ticket_id }, primary: true }
      ]);
    };

    const handleTicketCompleted = (e: any) => {
      const { ticket_id } = e.detail;
      triggerPrompt('ticket_completed', '工单完成', "巡检任务已完成，系统状态已更新。", [
        { label: '查看详情', event: 'E_VIEW_TASKS', payload: { ticketId: ticket_id }, primary: true }
      ]);
    };

    const handleReportGenerated = (e: any) => {
      triggerPrompt('report_generated', '报告生成', "我已经为你生成了一份新的运维报告，要不要现在预览一下？", [
        { label: '预览报告', event: 'NAV_TO_MODULE', payload: { module: 'REPORTS' }, primary: true }
      ]);
    };

    const handleVerificationRequested = (e: any) => {
      triggerPrompt('verification_requested', '核验启动', "无人机核验指令已下发，正在前往目标区域，我将为您实时监控影像回传。", [
        { label: '查看进度', event: 'E_VIEW_EVIDENCE', primary: true }
      ]);
    };

    const handleVerificationCompleted = (e: any) => {
      triggerPrompt('verification_completed', '核验完成', "无人机核验已完成，高清影像证据已就绪，建议您立即查看并确认诊断结论。", [
        { label: '查看证据', event: 'E_VIEW_EVIDENCE', primary: true }
      ]);
    };

    const handleDiagnosisResolved = (e: any) => {
      const { resolution } = e.detail || {};
      const msg = resolution === 're_verify' 
        ? "已发起二次核验，我将持续跟踪最新进展。" 
        : "冲突已解决，诊断结论已更新。我已经把这次分歧处理过程记录进知识库了。";
      triggerPrompt('diagnosis_resolved', '诊断更新', msg, [
        { label: '查看详情', event: 'E_VIEW_EVIDENCE', primary: true }
      ]);
    };

    const handleDiagnosisConflict = (e: any) => {
      triggerPrompt('diagnosis_conflict', '发现分歧', "检测到 AI 诊断与人工复核存在差异。我已经整理好了分歧点，请您定夺最终结论。", [
        { label: '处理分歧', event: 'E_VIEW_EVIDENCE', primary: true }
      ]);
    };

    const handlePlanConfirmed = (e: any) => {
      triggerPrompt('plan_confirmed', '方案已确认', "运维方案已确认执行。我已为您自动拆解了任务清单并指派了责任人，请进入执行阶段查看。", [
        { label: '进入执行', event: 'E_CONTINUE_EXEC', primary: true }
      ]);
    };

    const handleReinitAuth = (e: any) => {
      triggerPrompt('auth_reinit', '认证重置', "正在为您重新初始化 FlyData 认证链路，请稍候...", []);
      
      // Simulate actual re-initialization logic
      setTimeout(() => {
        globalDispatch({ type: 'AUTH_REINIT_SUCCESS' });
      }, 2500);
    };

    const handleModuleChange = (e: any) => {
      const { subModule } = e.detail;
      const currentState = globalStateRef.current;

      if (subModule === 'TICKETS') {
        const urgentOrder = currentState.dynamic_ticket_store
          .filter(t => t.status !== 'Completed')
          .sort((a, b) => {
            const pMap: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
            return (pMap[a.priority] || 9) - (pMap[b.priority] || 9);
          })[0];
        triggerPrompt('module_work_order', '工单中心', "当前有 1 个高优先级工单需要关注，要我帮您查看详情吗？", [
          { label: '查看工单', event: 'E_VIEW_TASKS', payload: { ticketId: urgentOrder?.ticket_id || 'WO-20240309-001' }, primary: true }
        ]);
      } else if (subModule === 'REPORTS') {
        triggerPrompt('module_report', '报告中心', "最新运维报告已经生成，您可以随时查阅。", [
          { label: '预览报告', event: 'E_PREVIEW_REPORT', primary: true }
        ]);
      } else if (subModule === 'ASSETS') {
        triggerPrompt('module_assets', '资产台账', "资产台账已更新，建议关注异常设备状态。", [
          { label: '查看详情', event: 'E_EXPLAIN_RISK', primary: true }
        ]);
      } else if (subModule === 'HOME') {
        // Optional: Home specific prompt
      }
    };

    window.addEventListener('RiskDetectedEvent', handleRisk);
    window.addEventListener('TicketCreatedEvent', handleTicketCreated);
    window.addEventListener('TicketCompletedEvent', handleTicketCompleted);
    window.addEventListener('ReportGeneratedEvent', handleReportGenerated);
    window.addEventListener('VERIFICATION_REQUESTED', handleVerificationRequested);
    window.addEventListener('VERIFICATION_COMPLETED', handleVerificationCompleted);
    window.addEventListener('DIAGNOSIS_RESOLVED', handleDiagnosisResolved);
    window.addEventListener('DIAGNOSIS_CONFLICT_RAISED', handleDiagnosisConflict);
    window.addEventListener('PLAN_CONFIRMED', handlePlanConfirmed);
    window.addEventListener('E_REINIT_AUTH', handleReinitAuth);
    window.addEventListener('ModuleChangeEvent', handleModuleChange);

    return () => {
      window.removeEventListener('RiskDetectedEvent', handleRisk);
      window.removeEventListener('TicketCreatedEvent', handleTicketCreated);
      window.removeEventListener('TicketCompletedEvent', handleTicketCompleted);
      window.removeEventListener('ReportGeneratedEvent', handleReportGenerated);
      window.removeEventListener('VERIFICATION_REQUESTED', handleVerificationRequested);
      window.removeEventListener('VERIFICATION_COMPLETED', handleVerificationCompleted);
      window.removeEventListener('DIAGNOSIS_RESOLVED', handleDiagnosisResolved);
      window.removeEventListener('DIAGNOSIS_CONFLICT_RAISED', handleDiagnosisConflict);
      window.removeEventListener('PLAN_CONFIRMED', handlePlanConfirmed);
      window.removeEventListener('E_REINIT_AUTH', handleReinitAuth);
      window.removeEventListener('ModuleChangeEvent', handleModuleChange);
    };
  }, []); // Empty dependency array, uses ref for state

  return null;
};
