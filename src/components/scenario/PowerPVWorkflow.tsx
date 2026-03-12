import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { 
  Upload, 
  Search, 
  Zap, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Database,
  Plus,
  Trash2,
  User,
  Clock,
  ArrowRight,
  History,
  TrendingUp,
  TrendingDown,
  Wind,
  Sun,
  Camera,
  Download,
  Archive,
  ShieldCheck,
  Sparkles,
  Plane,
  X,
  ChevronLeft
} from 'lucide-react';
import { useGlobalStore } from '../../store/GlobalStore';
import { useCopilot } from '../../copilot/core/CopilotContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { RunEvent, RunStage } from '../../types';

export const PowerPVWorkflow: React.FC = () => {
  const { state, dispatch } = useGlobalStore();
  const { dispatch: copilotDispatch } = useCopilot();
  const { run } = state;
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal states
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isMitigationModalOpen, setIsMitigationModalOpen] = useState(false);
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [isManualReviewModalOpen, setIsManualReviewModalOpen] = useState(false);
  const [isProgressLogOpen, setIsProgressLogOpen] = useState(false);
  const [isTaskOwnerConfirmModalOpen, setIsTaskOwnerConfirmModalOpen] = useState(false);
  const [isReportPreviewOpen, setIsReportPreviewOpen] = useState(false);
  const [isLibraryModalOpen, setIsLibraryModalOpen] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isKnowledgeDraftModalOpen, setIsKnowledgeDraftModalOpen] = useState(false);
  const [selectedLibraryItem, setSelectedLibraryItem] = useState<any>(null);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState<'current' | 'all'>('current');
  const [manualReviewConclusion, setManualReviewConclusion] = useState('一致');
  const [humanConclusionText, setHumanConclusionText] = useState('人工判断结论：由于耗损严重，怀疑是积灰导致的大面积遮挡，需立即清洗。');
  const [quickViewType, setQuickViewType] = useState<'case' | 'knowledge' | 'uav'>('case');
  
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);

  // Listen for Copilot events
  useEffect(() => {
    const handleCopilotEvent = (e: any) => {
      const { event, source } = e.detail;
      if (source === 'workflow') return; // Ignore events triggered by the workflow itself
      
      switch (event) {
        case 'E_START_DIAGNOSIS':
          startDiagnosis();
          break;
        case 'E_UPLOAD_DATA':
          handleDataUpload();
          break;
        case 'E_VIEW_EVIDENCE':
          setQuickViewType('uav');
          setIsQuickViewOpen(true);
          break;
        case 'E_RE_VERIFY':
          handleDiagnosisResolve('re_verify');
          break;
        case 'E_CONFIRM_PLAN':
          if (run.evidenceChain.recommendedPlans.length > 0) {
            confirmPlan(run.evidenceChain.recommendedPlans[0]);
          }
          break;
        case 'E_MANUAL_REVIEW':
          handleManualReview();
          break;
        case 'E_VIEW_RISKS':
          setIsProgressLogOpen(true);
          break;
        case 'E_CONFIRM_ASSIGNEES':
          setIsOwnerModalOpen(true);
          break;
        case 'E_CONFIRM_TASKS':
          handleOwnerConfirm();
          break;
        case 'E_ADOPT_CRITERIA':
          // Automatically confirm the suggested criteria
          const suggestedCriteria = [
            { id: 'C1', name: 'PR 恢复率', target: '>= 82.0%', current: '82.1%', unit: '%', pass: true },
            { id: 'C2', name: '任务完成率', target: '100%', current: '100%', unit: '%', pass: true },
            { id: 'C3', name: '风险闭环率', target: '100%', current: '100%', unit: '%', pass: true }
          ];
          dispatchEvent('ACCEPTANCE_CRITERIA_SET', suggestedCriteria, '采用 Copilot 建议的验收标准');
          dispatchEvent('ACCEPTANCE_CRITERIA_CONFIRMED', null, '用户通过 Copilot 确认了验收标准建议');
          toast.success('验收标准已按建议更新并确认');
          break;
        case 'E_CRITERIA_CONFIRMED':
          dispatchEvent('ACCEPTANCE_CRITERIA_CONFIRMED', null, '用户确认验收标准草案');
          toast.success('验收标准已确认');
          break;
        case 'E_GENERATE_MITIGATION':
          const openRisk = run.execution.risks.find(r => r.status === 'open');
          if (openRisk) {
            dispatchEvent('MITIGATION_PLAN_CREATED', { 
              riskId: openRisk.id, 
              title: '积灰清理效率优化方案',
              options: [
                { id: 'opt-1', label: '增加清洗频率', impact: 'PR +0.5%' },
                { id: 'opt-2', label: '调整机器人路径', impact: 'PR +0.3%' }
              ]
            }, 'Copilot 协助生成了风险缓解方案');
            toast.success('已生成缓解方案');
          }
          break;
        case 'E_VIEW_TASKS':
          setIsProgressLogOpen(true);
          break;
        case 'E_PREVIEW_REPORT':
          handlePreview();
          break;
        case 'E_DOWNLOAD_REPORT':
          handleDownload();
          break;
        case 'E_VIEW_CASES':
          openLibrary('case');
          break;
        case 'E_VIEW_KNOWLEDGE':
          openLibrary('knowledge');
          break;
        case 'E_RE_VERIFY':
          handleDiagnosisResolve('re_verify');
          break;
        case 'E_CONTINUE_EXEC':
          setIsProgressLogOpen(false);
          break;
        case 'E_VIEW_DATA':
          // Scroll to data section or show data modal
          toast('正在查看逆变器运行数据');
          break;
      }
    };

    window.addEventListener('powerops-event', handleCopilotEvent);
    return () => window.removeEventListener('powerops-event', handleCopilotEvent);
  }, [run, isProcessing]);
  
  // Form states
  const [taskAssignments, setTaskAssignments] = useState<any>({});
  const [feedbackData, setFeedbackData] = useState({ progress: 0, text: '' });
  const [ownerConfirmData, setOwnerConfirmData] = useState({ decision: 'accept', note: '' });
  const [mitigationOptions, setMitigationOptions] = useState<any[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [rootCause, setRootCause] = useState('');
  const [criteria, setCriteria] = useState<any[]>([]);

  const STAGES: { id: RunStage; label: string; icon: any }[] = [
    { id: 'collect', label: '数据采集', icon: Upload },
    { id: 'diagnose', label: '问题诊断', icon: Search },
    { id: 'execute', label: '执行与监测', icon: Activity },
    { id: 'accept', label: '验收与报告', icon: CheckCircle2 },
  ];

  // Helper to dispatch run events
  const dispatchEvent = (event: RunEvent, data?: any, details: string = '', silent: boolean = false) => {
    dispatch({
      type: 'DISPATCH_RUN_EVENT',
      payload: { event, data, details, silent }
    });
  };

  const handleStageNavigate = (stageId: RunStage) => {
    dispatchEvent('STAGE_NAVIGATED', { stage: stageId }, `用户手动跳转至阶段：${STAGES.find(s => s.id === stageId)?.label}`);
    
    // Trigger Copilot sync
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_STAGE_CHANGED', stage: stageId, source: 'workflow' } 
    }));

    toast.success(`已切换至 ${STAGES.find(s => s.id === stageId)?.label}`);
  };

  const handleGoBack = () => {
    const currentIndex = STAGES.findIndex(s => s.id === run.stage);
    if (currentIndex > 0) {
      handleStageNavigate(STAGES[currentIndex - 1].id);
    }
  };

  // Stage A: Data Collection
  const handleDataUpload = () => {
    if (isProcessing) return;
    
    // Trigger Copilot immediately on first click
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_UPLOAD_DATA', label: '上传报表', source: 'workflow' } 
    }));

    setIsProcessing(true);
    
    setTimeout(() => {
      const mockMetrics = [
        { key: 'voltage', title: '电压', value: '385', unit: 'V' },
        { key: 'current', title: '电流', value: '12.4', unit: 'A' },
        { key: 'pr', title: 'PR (性能比)', value: '81.2', unit: '%' },
        { key: 'failureRate', title: '故障率', value: '0.45', unit: '%' },
        { key: 'efficiency', title: '逆变器效率', value: '98.2', unit: '%' },
        { key: 'dailyHours', title: '日均发电小时', value: '4.2', unit: 'h' },
      ];
      dispatchEvent('DATA_UPLOADED', { 
        type: 'excel', 
        fileName: 'station_data_oct.xlsx',
        metricsCards: mockMetrics 
      }, '用户上传了运行数据报表');
      
      setIsProcessing(false);
      toast.success('数据上传成功，请查看诊断结论');
    }, 1500);
  };

  const startDiagnosis = () => {
    setIsProcessing(true);
    
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_START_DIAGNOSIS', label: '启动智能诊断', source: 'workflow' } 
    }));

    // 3s delay as requested
    setTimeout(() => {
      const diagnosisData = {
        diagnosis: {
          conclusion: '初步诊断结果：区域B阵列有阴影遮挡，怀疑树荫遮挡导致的损耗增加。',
          confidence: '88%',
          reasonBullets: [
            '组串 12-45 电流出现 15% 以上的阶梯式下降',
            '影像识别显示区域 B 边缘存在不规则阴影',
            '逆变器 02 号机组 PR 值从 84% 掉至 78%'
          ]
        },
        recommendedPlans: [
          { 
            id: 'plan-tree', 
            title: '派遣人工现场处理周边树木遮挡', 
            desc: '针对区域 B 周边生长的树木进行修剪，消除阴影遮挡，预计 PR 恢复 2.5%', 
            cost: '¥2,000', 
            benefitDelta: '+2.5%',
            riskLevel: '中',
            duration: '12h',
            recommended: true
          }
        ]
      };
      dispatchEvent('ANALYSIS_COMPLETED', diagnosisData, '智能诊断引擎完成初步分析');
      setIsProcessing(false);
      toast.success('诊断分析完成');
    }, 3000);
  };

  // Stage B: Diagnosis & Plan
  const handleDroneVerify = (isResolvingConflict: boolean = false) => {
    if (isProcessing || run.evidenceChain.verification.uav.status === 'requested') return;
    
    setIsProcessing(true);
    
    // 1. Dispatch state update first
    dispatchEvent('VERIFICATION_REQUESTED', null, '发起无人机巡检核验请求');

    // 2. Then trigger Copilot synchronization
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_RE_VERIFY', label: '发起巡检核验', source: 'workflow' } 
    }));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5; 
      if (progress <= 100) {
        dispatch({
          type: 'DISPATCH_RUN_EVENT',
          payload: { 
            event: 'VERIFICATION_PROGRESS_UPDATED', 
            data: { progress }, 
            details: `多元证据链分析进度: ${progress}%`,
            silent: true
          }
        });
      }
      
      if (progress >= 100) {
        clearInterval(interval);
        
        // 1. Show UAV Result first
        const verifyData = {
          resultSummary: '核验通过：无人机高清摄像头捕捉到明显的表面积灰，核验结果符合人工判断。',
          image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80'
        };
        dispatchEvent('VERIFICATION_COMPLETED', verifyData, '无人机核验确认积灰事实');
        
        // 2. Delay Diagnosis Resolution to allow Copilot to give feedback first
        // Increased to 3s to ensure user sees the "Resolved" prompt from Copilot
        setTimeout(() => {
          dispatchEvent('DIAGNOSIS_RESOLVED', { resolution: 're_verify' }, '多元证据链分析闭环，结论已修正');
          setIsProcessing(false);
          toast.success('二次核验及结论修正完成');
        }, 3000); 
      }
    }, 250); // 20 steps * 250ms = 5s
  };

  const handleManualReview = () => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_MANUAL_REVIEW', label: '人工复核', source: 'workflow' } 
    }));
    setIsManualReviewModalOpen(true);
  };

  const handleManualReviewConfirm = () => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_MANUAL_REVIEW_CONFIRM', label: '人工复核确认', source: 'workflow' } 
    }));
    dispatchEvent('DIAG_CONFLICT', { 
      conclusion: manualReviewConclusion,
      humanConclusion: manualReviewConclusion === '不一致' ? humanConclusionText : undefined
    }, `人工复核结论：${manualReviewConclusion}`);
    toast.success('人工复核结论已记录');
    setIsManualReviewModalOpen(false);
  };

  const handleDiagnosisResolve = (resolution: 'use_human' | 'use_ai' | 're_verify') => {
    if (resolution === 're_verify') {
      toast.loading('正在发起二次核验，请稍候...');
      setTimeout(() => {
        toast.dismiss();
        toast.success('二次核验指令已下发至无人机');
        handleDroneVerify(true);
      }, 1500);
      return;
    }
    
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_DIAGNOSIS_RESOLVED', label: `解决冲突: ${resolution === 'use_human' ? '采纳人工' : '采纳AI'}`, source: 'workflow' } 
    }));
    dispatchEvent('DIAGNOSIS_RESOLVED', { resolution }, `诊断冲突已解决：${resolution === 'use_human' ? '采纳人工结论' : '采纳AI结论'}`);
    toast.success('诊断结论已更新');
  };

  const confirmPlan = (plan: any) => {
    if (run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT') {
      toast.error('当前存在诊断分歧，请先处理冲突后再进入执行环节', {
        icon: '⚠️',
        duration: 4000
      });
      return;
    }
    
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_CONFIRM_PLAN', label: '确认执行方案', source: 'workflow' } 
    }));

    dispatchEvent('PLAN_CONFIRMED', plan, `用户确认执行方案：${plan.title || plan.name}`);
    
    // Automatically generate tasks based on selected plan
    const tasks = [
      { 
        id: 'T1', 
        title: `组件清洗任务`, 
        ownerType: plan.id === 'P1' ? 'robot' : 'human', 
        ownerName: plan.id === 'P1' ? '智洗机器人-01' : '运维班组-A',
        status: 'pending_confirm', 
        progress: 0,
        priority: '高',
        dueAt: Date.now() + 86400000 // +1 day
      },
      { 
        id: 'T2', 
        title: '清洗后PR值效能复测', 
        ownerType: 'uav', 
        ownerName: '巡检无人机-Alpha',
        status: 'pending_confirm', 
        progress: 0,
        priority: '中',
        dueAt: Date.now() + 172800000 // +2 days
      }
    ];
    
    // Initialize assignments for the modal
    const initialAssignments = {};
    tasks.forEach((t: any) => {
      initialAssignments[t.id] = { ownerName: t.ownerName, ownerType: t.ownerType };
    });
    setTaskAssignments(initialAssignments);
    
    dispatchEvent('TASKS_CREATED', tasks, '系统根据选定方案自动拆解并生成运维任务列表', true);
  };

  const archiveCase = () => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_ARCHIVE_CASE', label: '归档案例', source: 'workflow' } 
    }));
    dispatchEvent('REPORT_GENERATED', { id: 'REP-' + Date.now(), url: '#' }, '生成运维复盘报告', true);
    dispatchEvent('CASE_SAVED', { caseId: 'CASE-' + Date.now(), tags: ['积灰', '光伏', '清洗'] }, '案例已归档并完成知识沉淀');
    dispatchEvent('KNOWLEDGE_SAVED', { knowledgeId: 'KB-' + Date.now() }, '知识沉淀完成并入库', true);
    toast.success('流程已闭环并完成归档');
  };

  const handleDownload = () => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_DOWNLOAD_REPORT', label: '下载报告', source: 'workflow' } 
    }));
    toast.success("已生成报告，开始下载");
    // Mock download
    const link = document.createElement('a');
    link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent("Mock Report Content for " + run.runId);
    link.download = `运维报告_${run.runId}.pdf`;
    link.click();
    dispatchEvent('REPORT_DOWNLOADED', { runId: run.runId }, "用户下载了运维复盘报告");
  };

  const handlePreview = () => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_PREVIEW_REPORT', label: '预览报告', source: 'workflow' } 
    }));
    setIsReportPreviewOpen(true);
    dispatchEvent('REPORT_PREVIEWED', { runId: run.runId }, "用户预览了运维复盘报告");
  };

  const openLibrary = (type: 'case' | 'knowledge') => {
    setQuickViewType(type);
    setIsLibraryModalOpen(true);
    dispatchEvent(type === 'case' ? 'CASE_LIBRARY_OPENED' : 'KNOWLEDGE_LIBRARY_OPENED', null, `打开企业${type === 'case' ? '案例' : '知识'}库`);
  };

  const openItemDetail = (item: any) => {
    setSelectedLibraryItem(item);
    setIsDetailDrawerOpen(true);
    dispatchEvent('ITEM_DETAIL_OPENED', { itemId: item.id }, `查看条目详情: ${item.id}`);
  };

  // Render Helpers
  const renderStageA = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-8 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer group" onClick={handleDataUpload}>
          <Upload size={48} className="mb-4 group-hover:scale-110 transition-transform" />
          <span className="font-bold">上传逆变器运行数据</span>
          <span className="text-xs mt-2">支持 Excel, CSV (Max 50MB)</span>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          {(run.evidenceChain.metricsCards.length > 0 ? run.evidenceChain.metricsCards : [
            { title: '电压', value: '--', unit: 'V' },
            { title: '电流', value: '--', unit: 'A' },
            { title: 'PR (性能比)', value: '--', unit: '%' },
            { title: '故障率', value: '--', unit: '%' },
            { title: '逆变器效率', value: '--', unit: '%' },
            { title: '日均发电小时', value: '--', unit: 'h' },
          ]).map((m, i) => (
            <Card key={i} className="p-4 bg-slate-50 border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{m.title}</div>
              <div className="text-xl font-black text-slate-900">{m.value}{m.unit}</div>
            </Card>
          ))}
        </div>
      </div>
      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="px-12 py-6 text-lg font-bold rounded-2xl shadow-xl shadow-blue-200"
          disabled={run.evidenceChain.metricsCards.length === 0 || isProcessing}
          onClick={startDiagnosis}
        >
          {isProcessing ? '正在分析...' : '查看诊断结论'}
          <ArrowRight className="ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStageB = () => (
    <div className="space-y-10">
      {/* Header Section */}
      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-7">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <Activity size={22} className="text-blue-500" />
              多维诊断依据
            </h3>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-500 font-bold">
              识别出 {run.evidenceChain.diagnosis.reasonBullets.length} 项关键因素
            </div>
          </div>
        </div>
        <div className="col-span-5">
          <h3 className="text-lg font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
            <Zap size={22} className="text-amber-500" />
            推荐预案
          </h3>
        </div>
      </div>

      {/* Row 1: Evidence & Plan */}
      <div className="grid grid-cols-12 gap-8 items-stretch">
        <div className="col-span-7 grid grid-cols-2 gap-6">
          {run.evidenceChain.metricsCards.slice(0, 2).map((m, idx) => (
            <Card key={idx} className="p-5 hover:shadow-xl transition-all border-slate-100 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
                  <TrendingDown size={24} />
                </div>
                <span className="text-base font-bold text-slate-700">{m.title}</span>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-2">{m.value}{m.unit}</div>
              <div className="text-sm text-slate-500 leading-relaxed">
                {idx === 0 ? '较历史同期发电量有所下滑' : '性能比出现明显波动'}
              </div>
            </Card>
          ))}
        </div>
        <div className="col-span-5">
          {run.evidenceChain.recommendedPlans?.[0] && (
            <Card 
              className={`p-6 border-2 h-full flex flex-col justify-center transition-all cursor-pointer shadow-xl hover:shadow-2xl ${
                run.execution.selectedPlanId === run.evidenceChain.recommendedPlans[0].id 
                  ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-50' 
                  : 'border-slate-100 hover:border-blue-200'
              }`} 
              onClick={() => confirmPlan(run.evidenceChain.recommendedPlans[0])}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-slate-900">{run.evidenceChain.recommendedPlans[0].title}</span>
                    <span className="text-blue-600 text-xs font-bold bg-blue-50 px-2 py-1 rounded">（推荐）</span>
                  </div>
                  <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Plan {run.evidenceChain.recommendedPlans[0].id}</span>
                </div>
                <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                  <Sparkles size={20} />
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{run.evidenceChain.recommendedPlans[0].desc}</p>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase mb-1">成本投入</span>
                  <span className="text-lg font-black text-slate-800">{run.evidenceChain.recommendedPlans[0].cost}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase mb-1">预计收益</span>
                  <span className="text-lg font-black text-emerald-600">{run.evidenceChain.recommendedPlans[0].benefitDelta}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase mb-1">风险等级</span>
                  <span className={`text-lg font-black ${run.evidenceChain.recommendedPlans[0].riskLevel === '低' ? 'text-emerald-500' : 'text-amber-500'}`}>{run.evidenceChain.recommendedPlans[0].riskLevel}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Row 2: More Evidence & Plan */}
      <div className="grid grid-cols-12 gap-8 items-stretch">
        <div className="col-span-7 grid grid-cols-2 gap-6">
          {run.evidenceChain.metricsCards.slice(2, 4).map((m, idx) => (
            <Card key={idx} className="p-5 hover:shadow-xl transition-all border-slate-100 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 rounded-xl bg-amber-50 text-amber-500">
                  <Sun size={24} />
                </div>
                <span className="text-base font-bold text-slate-700">{m.title}</span>
              </div>
              <div className="text-3xl font-black text-slate-900 mb-2">{m.value}{m.unit}</div>
              <div className="text-sm text-slate-500 leading-relaxed">
                {idx === 0 ? '区域环境监测显示沙尘指数升高' : '设备转换效率基本维持稳定'}
              </div>
            </Card>
          ))}
        </div>
        <div className="col-span-5">
          {run.evidenceChain.recommendedPlans?.[1] && (
            <Card 
              className={`p-6 border-2 h-full flex flex-col justify-center transition-all cursor-pointer shadow-xl hover:shadow-2xl ${
                run.execution.selectedPlanId === run.evidenceChain.recommendedPlans[1].id 
                  ? 'border-blue-500 bg-blue-50/30 ring-4 ring-blue-50' 
                  : 'border-slate-100 hover:border-blue-200'
              }`} 
              onClick={() => confirmPlan(run.evidenceChain.recommendedPlans[1])}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-2xl font-black text-slate-900">{run.evidenceChain.recommendedPlans[1].title}</span>
                  <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">Plan {run.evidenceChain.recommendedPlans[1].id}</span>
                </div>
                <div className="bg-slate-100 text-slate-400 p-2 rounded-lg">
                  <User size={20} />
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{run.evidenceChain.recommendedPlans[1].desc}</p>
              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase mb-1">成本投入</span>
                  <span className="text-lg font-black text-slate-800">{run.evidenceChain.recommendedPlans[1].cost}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase mb-1">预计收益</span>
                  <span className="text-lg font-black text-emerald-600">{run.evidenceChain.recommendedPlans[1].benefitDelta}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-bold uppercase mb-1">风险等级</span>
                  <span className={`text-lg font-black ${run.evidenceChain.recommendedPlans[1].riskLevel === '低' ? 'text-emerald-500' : 'text-amber-500'}`}>{run.evidenceChain.recommendedPlans[1].riskLevel}</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Row 3: Conclusion and Verification */}
      <div className="grid grid-cols-12 gap-8 items-stretch">
        <div className="col-span-7">
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative h-full"
          >
            {run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT' && (
              <div className="absolute -inset-2 bg-red-500 rounded-[2.5rem] blur-xl opacity-20 animate-pulse" />
            )}
            {run.evidenceChain.diagnosis.status !== 'HUMAN_REVIEWED_CONFLICT' && (
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[2.5rem] blur-xl opacity-30 animate-pulse" />
            )}
            
            <Card className={`p-8 bg-white relative z-10 rounded-[2rem] h-full flex flex-col justify-center ${
              run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT' 
                ? 'border-red-200 shadow-[0_20px_50px_rgba(239,68,68,0.15)]' 
                : 'border-blue-100 shadow-[0_20px_50px_rgba(37,99,235,0.15)]'
            }`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl ${
                    run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT'
                      ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-red-200'
                      : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-blue-200'
                  }`}>
                    {run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT' ? <AlertTriangle size={28} /> : <Search size={28} />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xl font-black text-slate-900">
                      {run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT' ? '诊断分歧冲突' : '诊断结论'}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI 置信度评估</span>
                      <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: run.evidenceChain.diagnosis.confidence }}
                          transition={{ duration: 1, delay: 0.5 }}
                          className={`h-full rounded-full ${
                            run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT'
                              ? 'bg-red-500'
                              : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                          }`} 
                        />
                      </div>
                      <span className={`text-xs font-black ${run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT' ? 'text-red-600' : 'text-blue-600'}`}>
                        {run.evidenceChain.diagnosis.confidence}
                      </span>
                    </div>
                  </div>
                </div>
                {run.evidenceChain.diagnosis.status === 'RESOLVED_CONFIRMED' && (
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={14} /> 已解决
                  </div>
                )}
              </div>

              {run.evidenceChain.diagnosis.status === 'HUMAN_REVIEWED_CONFLICT' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                      <div className="text-[10px] font-bold text-blue-600 uppercase mb-2">AI 诊断结论</div>
                      <p className="text-sm text-blue-900 font-medium leading-relaxed">
                        {run.evidenceChain.diagnosis.aiConclusion}
                      </p>
                    </div>
                    <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100/50">
                      <div className="text-[10px] font-bold text-amber-600 uppercase mb-2">人工复核结论</div>
                      <p className="text-sm text-amber-900 font-medium leading-relaxed">
                        {run.evidenceChain.diagnosis.humanConclusion}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs h-10"
                      onClick={() => handleDiagnosisResolve('use_human')}
                    >
                      以人工为准
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 border-slate-200 text-xs h-10"
                      onClick={() => handleDiagnosisResolve('use_ai')}
                    >
                      保持当前AI诊断
                    </Button>
                    <Button 
                      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white text-xs h-10"
                      onClick={() => handleDiagnosisResolve('re_verify')}
                    >
                      发起二次核验
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-5 bg-blue-50/40 rounded-2xl border border-blue-100/50 backdrop-blur-sm">
                  <p className="text-lg text-blue-900 font-bold leading-relaxed">
                    {run.evidenceChain.diagnosis.finalConclusion || run.evidenceChain.diagnosis.aiConclusion}
                  </p>
                  {run.evidenceChain.diagnosis.status === 'RESOLVED_CONFIRMED' && (
                    <div className="mt-4 pt-4 border-t border-blue-100/50 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                        <CheckCircle2 size={18} />
                        冲突已解决，已生成行业经验知识
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:bg-blue-100 h-8 text-xs font-bold"
        onClick={() => {
          const draftId = run.evidenceChain.knowledgeDrafts?.[0]?.id;
          setSelectedDraftId(draftId || null);
          setIsKnowledgeDraftModalOpen(true);
        }}
                      >
                        查看分歧记录知识
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        </div>

        <div className="col-span-5 flex flex-col gap-6">
          <div className="bg-slate-50/50 rounded-[2.5rem] p-6 border border-slate-100 flex flex-col gap-6 h-full">
            <div className="flex flex-col gap-4">
              <Button 
                variant="outline" 
                className={`w-full border-dashed border-2 py-8 flex items-center justify-center gap-6 rounded-[2rem] transition-all group shadow-sm hover:shadow-md ${
                  run.evidenceChain.verification.uav.status === 'idle' 
                    ? 'hover:bg-blue-50 hover:border-blue-300 border-slate-200 bg-white' 
                    : 'bg-slate-100 border-slate-200 cursor-not-allowed'
                }`} 
                onClick={() => handleDroneVerify(false)} 
                disabled={isProcessing || run.evidenceChain.verification.uav.status !== 'idle'}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-inner shrink-0 ${
                  run.evidenceChain.verification.uav.status === 'idle' ? 'bg-slate-50 group-hover:bg-blue-100' : 'bg-slate-200'
                }`}>
                  <Camera size={28} className={run.evidenceChain.verification.uav.status === 'idle' ? 'text-blue-500' : 'text-slate-400'} />
                </div>
                <div className="text-left">
                  <div className={`text-base font-bold ${run.evidenceChain.verification.uav.status === 'idle' ? 'text-slate-700 group-hover:text-blue-600' : 'text-slate-400'}`}>
                    {run.evidenceChain.verification.uav.status === 'completed' ? '巡检核验已完成' : '无人机巡检核验'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5 font-medium max-w-[200px] leading-tight">获取实时现场高清影像证据</div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="w-full border-slate-200 py-5 flex items-center justify-center gap-3 rounded-2xl hover:bg-white hover:shadow-md transition-all shadow-sm bg-white/80"
                onClick={handleManualReview}
              >
                <User size={18} className="text-slate-400" />
                <span className="font-bold text-slate-600 text-sm">人工复核（可选）</span>
              </Button>
            </div>

            {/* UAV Verification Progress Card */}
            {run.evidenceChain.verification.uav.status !== 'idle' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1"
              >
                <Card className="p-6 border-blue-100 bg-white shadow-xl rounded-[2rem] h-full flex flex-col justify-center border-2 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                  
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${run.evidenceChain.verification.uav.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-200'}`}>
                        <Plane size={20} className={run.evidenceChain.verification.uav.status === 'requested' ? 'animate-pulse' : ''} />
                      </div>
                      <div>
                        <div className="text-sm font-black text-slate-900">核验任务状态</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                          {run.evidenceChain.verification.uav.status === 'completed' ? 'Mission Success' : 'Live Inspection'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {run.evidenceChain.verification.uav.status === 'requested' && (
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-3xl font-black text-blue-600 tabular-nums">{run.evidenceChain.verification.uav.progress}%</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-full shadow-inner"
                          initial={{ width: 0 }}
                          animate={{ width: `${run.evidenceChain.verification.uav.progress}%` }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold italic animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                        正在分析阵列 B 表面影像特征...
                      </div>
                    </div>
                  )}

                  {run.evidenceChain.verification.uav.status === 'completed' && (
                    <div className="space-y-4 relative z-10">
                      <div className="relative group rounded-2xl overflow-hidden shadow-lg">
                        <img 
                          src={run.evidenceChain.verification.uav.image} 
                          alt="UAV Evidence" 
                          className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                          <Button size="sm" variant="secondary" className="w-full h-7 text-[10px] font-black uppercase tracking-tighter" onClick={() => { setQuickViewType('uav'); setIsQuickViewOpen(true); }}>查看高清大图</Button>
                        </div>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                        <p className="text-[11px] text-slate-600 font-bold leading-relaxed">
                          {run.evidenceChain.verification.uav.resultSummary}
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Stage C: Execution

  const updateTaskStatus = (taskId: string, status: string) => {
    const task = run.execution.tasks?.find(t => t.id === taskId);
    if (!task) return;

    dispatchEvent('PROGRESS_UPDATED', { 
      taskId, 
      status, 
      progress: status === 'completed' ? 100 : task.progress,
      feedback: task.feedback
    }, `任务 ${taskId} 状态更新为 ${status}`);
    
    // Simulate a risk if a task is delayed
    if (status === 'delayed') {
      dispatchEvent('RISK_TRIGGERED', { 
        id: `R-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        level: 'high',
        title: '进度风险', 
        triggerReason: '清洗机器人电量不足，可能导致任务延期',
        status: 'open'
      }, '触发执行进度风险预警');
    }
  };

  const handleOwnerConfirm = () => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_CONFIRM_TASKS', label: '确认任务派发', source: 'workflow' } 
    }));
    run.execution.tasks.forEach((t: any) => {
      const assignment = taskAssignments[t.id];
      if (assignment) {
        dispatchEvent('TASK_OWNER_CONFIRMED', { 
          taskId: t.id, 
          ownerName: assignment.ownerName, 
          ownerType: assignment.ownerType 
        }, `责任人 ${assignment.ownerName} 已确认接受任务 ${t.id}`);
      }
    });
    setIsOwnerModalOpen(false);
    toast.success('任务清单已确认并派发');
  };

  const handleFeedbackSubmit = () => {
    const task = run.execution.tasks?.find(t => t.id === selectedTaskId);
    if (!task) return;

    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_SUBMIT_FEEDBACK', label: '提交进度反馈', source: 'workflow' } 
    }));

    dispatchEvent('PROGRESS_UPDATED', { 
      taskId: selectedTaskId, 
      progress: feedbackData.progress, 
      status: feedbackData.progress === 100 ? 'completed' : 'in_progress',
      feedback: feedbackData.text
    }, `更新任务 ${selectedTaskId} 进度为 ${feedbackData.progress}%`);
    
    // AI Active Warning Rules
    const note = feedbackData.text;
    const progress = feedbackData.progress;
    
    // Rule 1: Progress stagnation or low progress with critical keywords
    const criticalKeywords = ['故障', '缺人', '天气', '异常', '等待'];
    const hasCriticalKeyword = criticalKeywords.some(k => note.includes(k));
    
    if (hasCriticalKeyword && progress < 100) {
      dispatchEvent('RISK_TRIGGERED', {
        id: `R-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        level: 'high',
        title: '执行进度风险',
        triggerReason: `AI预警：任务反馈包含异常关键词 (${note})`,
        status: 'open'
      }, 'AI根据反馈内容自动触发风险预警');
    }

    // Close mitigation loop if progressing significantly
    const activeMitigation = run.execution.mitigations?.find(m => m.status === 'executing');
    if (activeMitigation && progress > 50) {
      dispatchEvent('MITIGATION_EXECUTED', { mitigationId: activeMitigation.id }, '任务进度显著提升，闭环二次优化方案');
    }

    // Rule 2: Expected duration check (Mock: if progress < 50% but it's been "long")
    if (progress < 50 && note.includes('慢')) {
      dispatchEvent('RISK_TRIGGERED', {
        id: `R-PREDICT-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        level: 'mid',
        title: '延期预测风险',
        triggerReason: 'AI预测：根据当前作业速率，该任务无法在预定窗口内完成',
        status: 'open'
      }, 'AI预测任务延期风险');
    }
    
    setIsFeedbackModalOpen(false);
    toast.success('进度反馈已提交');
  };

  const handleCreateMitigationPlan = (riskId: string) => {
    const risk = run.execution.risks?.find(r => r.id === riskId);
    setSelectedRiskId(riskId);
    setRootCause(risk?.triggerReason || '执行资源冲突');
    
    // Generate 3 options
    setMitigationOptions([
      { id: 'OPT-1', label: '追加人手与备件', impact: '进度恢复 100%，成本增加 15%', tasks: ['增派运维班组-C', '调拨备用主板'] },
      { id: 'OPT-2', label: '调整作业顺序', impact: '进度恢复 80%，无额外成本', tasks: ['优先处理区域B', '延后非关键巡检'] },
      { id: 'OPT-3', label: '改用无人机辅助', impact: '进度恢复 95%，成本增加 5%', tasks: ['启用巡检无人机-Beta'] }
    ]);
    setSelectedOptionId('OPT-1');
    setIsMitigationModalOpen(true);
  };

  const handleMitigationConfirm = () => {
    const selectedOption = mitigationOptions?.find(o => o.id === selectedOptionId);
    if (!selectedOption) return;

    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_CONFIRM_MITIGATION', label: '确认缓解方案', source: 'workflow' } 
    }));

    const mitigationId = `M-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const cycle = run.execution.mitigationCycle + 1;

    // Create new tasks based on selected option
    const currentTasks = [...run.execution.tasks];
    const newTasks = selectedOption.tasks.map((tName: string, i: number) => ({
      id: `T-OPT-${cycle}-${i}`,
      title: tName,
      ownerType: tName.includes('无人机') ? 'uav' : 'human',
      ownerName: tName,
      status: 'pending_confirm',
      progress: 0,
      priority: '高',
      dueAt: Date.now() + 43200000 // 12h
    }));

    dispatchEvent('MITIGATION_PLAN_CREATED', { 
      id: mitigationId, 
      riskId: selectedRiskId, 
      cycle,
      title: `二次优化方案 (Cycle ${cycle})`,
      rootCause,
      actions: selectedOption.label,
      status: 'approved'
    }, 'AI生成二次优化缓解方案');
    
    dispatchEvent('MITIGATION_CONFIRMED', { 
      mitigationId, 
      selectedOptionId,
      adjustedTasks: [...currentTasks, ...newTasks]
    }, '用户确认执行优化方案，任务列表已动态调整');
    
    setIsMitigationModalOpen(false);
    toast.success('优化方案已开始执行，任务列表已更新');
  };

  const handleOwnerTaskConfirm = () => {
    if (!selectedTaskId) return;
    const task = run.execution.tasks?.find(t => t.id === selectedTaskId);
    if (!task) return;

    if (ownerConfirmData.decision === 'accept') {
      dispatchEvent('TASK_ASSIGNED', { taskId: selectedTaskId }, `负责人 ${task.ownerName} 已接受任务并开始执行`);
      toast.success('任务已接受并开始执行');
    } else {
      toast.error('任务已被拒绝，请重新指派');
    }
    setIsTaskOwnerConfirmModalOpen(false);
  };

  const handleAddNewTask = () => {
    const taskId = 'T' + (run.execution.tasks.length + 1);
    const newTask = { 
      id: taskId, 
      title: '临时环境安全巡检', 
      ownerType: 'human', 
      ownerName: '运维班组-B',
      status: 'pending_confirm', 
      progress: 0,
      priority: '中',
      dueAt: Date.now() + 86400000
    };
    
    setTaskAssignments(prev => ({
      ...prev,
      [taskId]: { ownerName: newTask.ownerName, ownerType: newTask.ownerType }
    }));
    
    dispatchEvent('TASKS_CREATED', [...run.execution.tasks, newTask], '手动新增临时运维任务');
    toast.success('任务已新增');
  };

  const handleAcceptance = () => {
    if (run.acceptance.status === 'not_set') {
      setCriteria([
        { id: 'C1', name: 'PR 恢复率', target: '>= 81.5%', current: '82.1%', unit: '%', pass: true },
        { id: 'C2', name: '任务完成率', target: '100%', current: '100%', unit: '%', pass: true },
        { id: 'C3', name: '风险闭环率', target: '100%', current: '100%', unit: '%', pass: true }
      ]);
      window.dispatchEvent(new CustomEvent('powerops-event', { 
        detail: { event: 'E_ADJUST_CRITERIA', label: '设置验收标准', source: 'workflow' } 
      }));
      setIsCriteriaModalOpen(true);
      return;
    }
    
    setIsProcessing(true);
    dispatchEvent('ACCEPTANCE_CHECKED', { status: 'checking' }, '系统开始多维验收评估', true);
    
    setTimeout(() => {
      const allTasksDone = run.execution.tasks.every(t => t.status === 'completed');
      const noOpenRisks = run.execution.risks.every(r => r.status === 'closed');
      
      if (allTasksDone && noOpenRisks) {
        const acceptData = {
          status: 'accepted',
          metrics: { pr: '82.1%', recovery: '+5.6%' },
          score: 96
        };
        dispatchEvent('ACCEPTANCE_CHECKED', acceptData, '验收评估通过：PR恢复达标，任务全闭环');
        toast.success('验收评估通过');
      } else {
        const failReason = !allTasksDone ? '仍有未完成的任务' : '存在未闭环的执行风险';
        dispatchEvent('ACCEPTANCE_CHECKED', { status: 'fail' }, `验收评估未通过：${failReason}`);
        toast.error(`验收未通过: ${failReason}`);
      }
      setIsProcessing(false);
    }, 2500);
  };

  const renderStageC = () => {
    const hasPendingTasks = run.execution.tasks.some(t => t.status === 'pending_confirm');
    const isCriteriaConfirmed = run.acceptance.criteriaConfirmed;
    
    return (
      <div className="space-y-6">
        {hasPendingTasks && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }}
            className="bg-blue-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg shadow-blue-200"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <User size={20} />
              </div>
              <div>
                <div className="font-bold">任务责任人建议</div>
                <div className="text-xs text-blue-100">系统已生成任务清单，请查看派发对象与工期建议</div>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-800 text-white hover:bg-blue-900 font-bold shadow-lg border border-blue-400 px-6"
              onClick={() => {
                setIsOwnerModalOpen(true);
                window.dispatchEvent(new CustomEvent('powerops-event', { 
                  detail: { event: 'E_CONFIRM_ASSIGNEES', label: '任务责任人建议', source: 'workflow' } 
                }));
              }}
            >
              查看建议
            </Button>
          </motion.div>
        )}

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">任务执行列表</h3>
              <Button size="sm" variant="ghost" className="text-blue-600" onClick={handleAddNewTask}>
                <Plus size={14} className="mr-1" /> 新增任务
              </Button>
            </div>
            <div className="space-y-3">
              {run.execution.tasks.map((t: any, i: number) => (
                <Card key={i} className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      {t.status === 'completed' ? <CheckCircle2 size={20} /> : <Clock size={20} />}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-slate-900">{t.title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${t.priority === '高' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{t.priority}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><User size={10} /> {t.ownerName}</span>
                        <span className="text-[10px] text-slate-400">{t.progress}%</span>
                      </div>
                      {t.feedback && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border border-slate-100 text-[10px] text-slate-500 italic flex items-start gap-1.5">
                          <FileText size={12} className="mt-0.5 shrink-0 text-blue-500" />
                          <span>反馈: {t.feedback}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(t.status === 'assigned' || t.status === 'in_progress' || t.status === 'delayed') && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-slate-400 hover:text-blue-600"
                          onClick={() => {
                            setSelectedTaskId(t.id);
                            setIsProgressLogOpen(true);
                          }}
                        >
                          <History size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-amber-600 border-amber-200 hover:bg-amber-50"
                          onClick={() => updateTaskStatus(t.id, 'delayed')}
                        >
                          标记延期
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedTaskId(t.id);
                            setFeedbackData({ progress: t.progress, text: t.feedback || '' });
                            setIsFeedbackModalOpen(true);
                          }}
                        >
                          更新进度
                        </Button>
                      </div>
                    )}
                    {t.status === 'completed' && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-600"
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setIsProgressLogOpen(true);
                        }}
                      >
                        已完成
                      </Button>
                    )}
                    {t.status === 'pending_confirm' && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-blue-600 border-blue-200 bg-blue-50 animate-pulse"
                        onClick={() => {
                          setSelectedTaskId(t.id);
                          setIsTaskOwnerConfirmModalOpen(true);
                        }}
                      >
                        负责人确认
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <div className="col-span-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">实时监测与风险</h3>
            <Card className="p-6 bg-slate-950 text-white relative overflow-hidden h-52 flex flex-col justify-center items-center border border-white/10 shadow-2xl group">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/pv-live/800/450')] bg-cover opacity-20 group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />
              
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)]">
                  <Activity className="animate-pulse text-blue-400" size={28} />
                </div>
                
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                  <span className="text-[11px] font-black tracking-[0.2em] uppercase text-blue-400">实时作业监测中</span>
                </div>

                <div className="grid grid-cols-2 gap-12 w-full max-w-[280px]">
                  <div className="text-center space-y-1">
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">当前进度</div>
                    <div className="text-3xl font-black tabular-nums tracking-tighter">
                      {(run.execution.tasks || []).filter(t => t.status === 'completed').length}
                      <span className="text-white/20 mx-1 text-xl">/</span>
                      <span className="text-white/60 text-2xl">{(run.execution.tasks || []).length}</span>
                    </div>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest">风险等级</div>
                    <div className={`text-3xl font-black tracking-tighter ${run.execution.risks.some(r => r.status === 'open') ? 'text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]'}`}>
                      {run.execution.risks.some(r => r.status === 'open') ? 'HIGH' : 'LOW'}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Decorative elements */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </Card>
            {(run.execution.risks || []).filter(r => r.status === 'open' || r.status === 'mitigating').map((r: any, i: number) => (
              <motion.div key={i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                <Card className={`p-4 border-2 flex gap-3 ${r.status === 'mitigating' ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
                  {r.status === 'mitigating' ? <Sparkles className="text-blue-500 shrink-0" size={20} /> : <AlertTriangle className="text-red-500 shrink-0" size={20} />}
                  <div className="flex-1">
                    <div className={`text-xs font-bold ${r.status === 'mitigating' ? 'text-blue-900' : 'text-red-900'}`}>{r.title} {r.status === 'mitigating' && '(缓解中)'}</div>
                    <p className={`text-[10px] mt-1 ${r.status === 'mitigating' ? 'text-blue-700' : 'text-red-700'}`}>{r.triggerReason}</p>
                    {r.status === 'open' && (
                      <Button size="sm" className="mt-2 bg-red-600 hover:bg-red-700 text-[10px] py-1 h-auto" onClick={() => handleCreateMitigationPlan(r.id)}>生成缓解方案</Button>
                    )}
                    {r.status === 'mitigating' && (
                      <div className="mt-2 text-[10px] text-blue-600 font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> 方案已下发，正在监测效果
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
            {(run.execution.mitigations || []).filter(m => m.status === 'executing').map((m: any, i: number) => (
              <Card key={i} className="p-4 border-blue-200 bg-blue-50 flex gap-3">
                <Sparkles className="text-blue-500 shrink-0 animate-spin-slow" size={20} />
                <div className="flex-1">
                  <div className="text-xs font-bold text-blue-900">二次优化方案执行中</div>
                  <p className="text-[10px] text-blue-700 mt-1">{m.actions}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        <div className="flex flex-col items-stretch gap-6">
          <Card className={`p-8 w-full border-2 transition-all ${isCriteriaConfirmed ? 'border-emerald-200 bg-emerald-50' : 'border-blue-100 bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${isCriteriaConfirmed ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <div className="text-lg font-bold text-slate-900">验收标准建议</div>
                  <div className="text-sm text-slate-500">进入验收阶段前，需确认本次运维的评估指标建议</div>
                </div>
              </div>
              {!isCriteriaConfirmed && (
                <Button size="lg" onClick={() => handleAcceptance()}>
                  设置标准
                </Button>
              )}
              {isCriteriaConfirmed && (
                <div className="flex items-center gap-2 text-emerald-600 font-bold">
                  <CheckCircle2 size={20} /> 已确认
                </div>
              )}
            </div>
            {run.acceptance.criteria.length > 0 && (
              <div className="grid grid-cols-3 gap-6">
                {run.acceptance.criteria.map(c => (
                  <div key={c.id} className="p-4 bg-white/50 rounded-xl border border-slate-100 shadow-sm">
                    <div className="text-xs text-slate-400 uppercase font-bold mb-1">{c.name}</div>
                    <div className="text-base font-black text-slate-700">{c.target}</div>
                  </div>
                ))}
              </div>
            )}
            {!isCriteriaConfirmed && run.acceptance.criteria.length > 0 && (
              <Button 
                className="w-full mt-6 bg-blue-600 text-white py-4 font-bold"
                onClick={() => {
                  dispatchEvent('ACCEPTANCE_CRITERIA_CONFIRMED', null, '用户确认验收标准建议');
                  window.dispatchEvent(new CustomEvent('powerops-event', { 
                    detail: { event: 'E_ADJUST_CRITERIA', label: '验收标准建议', source: 'workflow' } 
                  }));
                }}
              >
                验收标准建议
              </Button>
            )}
          </Card>

          <div className="flex justify-center">
            <Button 
              size="lg" 
              className="px-16 py-8 text-xl font-bold rounded-2xl shadow-2xl shadow-blue-200"
              disabled={!isCriteriaConfirmed || run.execution.tasks.some(t => t.status !== 'completed') || run.execution.risks.some(r => r.status === 'open') || isProcessing}
              onClick={handleAcceptance}
            >
              {isProcessing ? '正在评估...' : '发起验收'}
              <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const renderStageD = () => {
    const isAccepted = run.acceptance.status === 'accepted';
    const isChecking = run.acceptance.status === 'checking';
    const isFail = run.acceptance.status === 'fail';

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-12 gap-6 items-stretch">
          <div className="col-span-7">
            <div className="p-10 bg-white border border-slate-100 rounded-3xl h-full flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden">
              {isAccepted && <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500" />}
              {isFail && <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />}
              
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 ${isAccepted ? 'bg-emerald-50' : isFail ? 'bg-red-50' : 'bg-slate-50'}`}>
                {isAccepted ? <ShieldCheck size={56} className="text-emerald-600" /> : 
                 isFail ? <AlertTriangle size={56} className="text-red-600" /> : 
                 <Activity size={56} className="text-slate-400 animate-pulse" />}
              </div>

              <h2 className="text-4xl font-black mb-4 tracking-tight text-slate-900">
                {isAccepted ? '验收评估通过' : isFail ? '验收评估未通过' : '验收评估进行中'}
              </h2>

              {isAccepted ? (
                <>
                  <p className="text-slate-600 mb-10 max-w-lg text-lg leading-relaxed">
                    经系统多维评估，本次运维干预后 PR 值从 <span className="font-bold text-slate-900">76.5%</span> 
                    恢复至 <span className="font-bold text-emerald-600">{run.acceptance.metrics?.pr}</span>，
                    综合评估得分 <span className="font-black text-emerald-600 text-3xl ml-2">{run.acceptance.score}</span>。
                  </p>
                  <div className="grid grid-cols-2 gap-16 w-full max-w-md">
                    <div className="flex flex-col items-center group">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <TrendingUp className="text-emerald-600" size={32} />
                      </div>
                      <div className="text-base text-slate-600 font-bold uppercase mb-2 tracking-widest">性能提升</div>
                      <div className="text-4xl font-black text-emerald-600">{run.acceptance.metrics?.recovery}</div>
                    </div>
                    <div className="flex flex-col items-center group">
                      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                        <CheckCircle2 className="text-emerald-600" size={32} />
                      </div>
                      <div className="text-base text-slate-600 font-bold uppercase mb-2 tracking-widest">合规性</div>
                      <div className="text-4xl font-black text-emerald-600">100%</div>
                    </div>
                  </div>
                </>
              ) : isFail ? (
                <div className="space-y-6">
                  <p className="text-slate-600 max-w-lg text-lg">
                    评估发现 PR 恢复值未达预期或仍有未闭环风险。
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => dispatchEvent('PLAN_CONFIRMED', {}, '返回执行阶段继续优化')}>
                    返回执行与监测继续优化
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="text-slate-600 max-w-lg text-lg">
                    正在根据验收标准进行多维数据比对与合规性检查...
                  </p>
                  <Button onClick={handleAcceptance} disabled={isProcessing}>
                    {isProcessing ? '正在计算...' : '开始验收'}
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="col-span-5 flex flex-col gap-6">
            <Card className="p-6 border-blue-100 bg-blue-50/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">验收标准</h3>
                {run.acceptance.status === 'not_set' && (
                  <Button size="sm" variant="ghost" className="text-blue-600" onClick={() => setIsCriteriaModalOpen(true)}>
                    设置标准
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {(run.acceptance.criteria.length > 0 ? run.acceptance.criteria : [
                  { name: 'PR 恢复率', target: '>= 81.5%' },
                  { name: '任务完成率', target: '100%' },
                  { name: '风险闭环率', target: '100%' }
                ]).map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-white rounded-xl border border-blue-50">
                    <span className="text-sm text-slate-600">{c.name}</span>
                    <span className="text-sm font-bold text-slate-900">{c.target}</span>
                  </div>
                ))}
              </div>
            </Card>

            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">后续动作与闭环</h3>
            <Card className="p-8 flex-1 flex flex-col justify-between shadow-lg border-slate-100 rounded-3xl">
              <div className="space-y-8">
                <div className="flex items-center gap-5 group cursor-pointer" onClick={handlePreview}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${run.outputs.report.status === 'ready' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-slate-900">生成复盘报告</div>
                    <div className="text-xs text-slate-500 mt-1">{run.outputs.report.status === 'ready' ? '已生成标准化运维报告' : '待系统自动生成报告'}</div>
                  </div>
                  {run.outputs.report.status === 'ready' && (
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="text-blue-600" onClick={(e) => { e.stopPropagation(); handleDownload(); }}>下载</Button>
                      <ArrowRight size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => openLibrary('case')}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${run.outputs.caseRecord.status === 'saved' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <Archive size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-slate-900">案例归档</div>
                    <div className="text-xs text-slate-500 mt-1">{run.outputs.caseRecord.status === 'saved' ? '案例已存入企业案例库' : '待流程闭环后自动归档'}</div>
                  </div>
                  {run.outputs.caseRecord.status === 'saved' && <ArrowRight size={16} className="text-slate-300" />}
                </div>

                <div className="flex items-center gap-5 group cursor-pointer" onClick={() => openLibrary('knowledge')}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${run.outputs.knowledgeRecord.status === 'saved' || (run.evidenceChain.knowledgeDrafts || []).some(d => d.status === 'saved') ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                    <Database size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="text-base font-bold text-slate-900">知识入库</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {run.outputs.knowledgeRecord.status === 'saved' || (run.evidenceChain.knowledgeDrafts || []).some(d => d.status === 'saved') 
                        ? `已沉淀 ${(run.evidenceChain.knowledgeDrafts || []).filter(d => d.status === 'saved').length} 条典型经验` 
                        : '待提取专家规则与经验条目'}
                    </div>
                  </div>
                  {(run.outputs.knowledgeRecord.status === 'saved' || (run.evidenceChain.knowledgeDrafts || []).some(d => d.status === 'saved')) && <ArrowRight size={16} className="text-slate-300" />}
                </div>
              </div>

              <div className="mt-16 space-y-8">
                {run.outputs.caseRecord.status !== 'saved' ? (
                  <Button className="w-full py-10 text-xl font-bold rounded-2xl shadow-xl shadow-blue-100" onClick={archiveCase}>
                    完成闭环并归档
                  </Button>
                ) : (
                  <div className="flex flex-col gap-8">
                    <div className="h-px bg-slate-100 w-full" />
                    <Button 
                      variant="outline" 
                      className="w-full py-10 text-xl font-bold rounded-2xl border-2 hover:bg-slate-50 transition-all group border-blue-100 text-blue-600" 
                      onClick={() => dispatchEvent('RESET_RUN', null, '用户点击开始新任务，重置工作流')}
                    >
                      <Plus size={24} className="mr-3 group-hover:rotate-90 transition-transform" />
                      开始新任务
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };


  const currentIndex = STAGES.findIndex(s => s.id === run.stage);

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Modals */}
      <Modal 
        isOpen={isManualReviewModalOpen} 
        onClose={() => setIsManualReviewModalOpen(false)} 
        title="人工复核诊断结论"
        footer={
          <Button onClick={handleManualReviewConfirm} className="bg-blue-600 text-white">确认提交</Button>
        }
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-500">请根据现场实际情况或专家经验，对 AI 诊断结论进行复核：</p>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <div className="text-xs font-bold text-blue-900 uppercase mb-1">AI 诊断结论</div>
            <div className="text-sm text-blue-700 font-medium">{run.evidenceChain.diagnosis.aiConclusion}</div>
          </div>
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">复核结论</label>
            <div className="grid grid-cols-2 gap-4">
              <button 
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${manualReviewConclusion === '一致' ? 'border-emerald-500 bg-emerald-50' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setManualReviewConclusion('一致')}
              >
                <CheckCircle2 size={24} className={manualReviewConclusion === '一致' ? 'text-emerald-500' : 'text-slate-300'} />
                <span className={`text-sm font-bold ${manualReviewConclusion === '一致' ? 'text-emerald-700' : 'text-slate-500'}`}>结论一致</span>
              </button>
              <button 
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${manualReviewConclusion === '不一致' ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setManualReviewConclusion('不一致')}
              >
                <AlertTriangle size={24} className={manualReviewConclusion === '不一致' ? 'text-red-500' : 'text-slate-300'} />
                <span className={`text-sm font-bold ${manualReviewConclusion === '不一致' ? 'text-red-700' : 'text-slate-500'}`}>结论不一致</span>
              </button>
            </div>
          </div>
          {manualReviewConclusion === '不一致' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">人工复核结论描述</label>
              <textarea 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 outline-none"
                rows={3}
                placeholder="请详细描述人工判断的结论..."
                value={humanConclusionText}
                onChange={(e) => setHumanConclusionText(e.target.value)}
              />
            </motion.div>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={isKnowledgeDraftModalOpen}
        onClose={() => setIsKnowledgeDraftModalOpen(false)}
        title="诊断分歧案例草稿"
        footer={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsKnowledgeDraftModalOpen(false)}>稍后处理</Button>
            <Button className="bg-blue-600 text-white" onClick={() => {
              dispatchEvent('KNOWLEDGE_DRAFT_ARCHIVED', { id: selectedDraftId }, '分歧案例确认入库');
              toast.success('案例已成功沉淀至知识库');
              setIsKnowledgeDraftModalOpen(false);
            }}>确认入库</Button>
          </div>
        }
      >
        <div className="space-y-6">
          {(() => {
            const draft = run.evidenceChain.knowledgeDrafts?.find(d => d.id === selectedDraftId) || run.evidenceChain.knowledgeDrafts?.[0];
            if (!draft) return <div className="p-8 text-center text-slate-400">暂无分歧记录数据</div>;
            
            return (
              <div className="space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                  <Archive className="text-amber-600 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-amber-800 leading-relaxed">
                    系统已根据本次人机诊断冲突自动提取关键信息。沉淀此类案例有助于优化 AI 模型在特定场景下的识别精度。
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">AI 结论</label>
                      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                        {draft.aiConclusion}
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">人工结论</label>
                      <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                        {draft.humanConclusion}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">核心分歧点</label>
                    <textarea 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      value={draft.conflictPoint || ''}
                      onChange={(e) => {
                        dispatch({
                          type: 'DISPATCH_RUN_EVENT',
                          payload: {
                            event: 'KNOWLEDGE_DRAFT_UPDATED',
                            data: { id: draft.id, updates: { conflictPoint: e.target.value } },
                            details: '更新分歧案例核心分歧点'
                          }
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">处置结果与教训</label>
                    <textarea 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      value={draft.lesson || ''}
                      onChange={(e) => {
                        dispatch({
                          type: 'DISPATCH_RUN_EVENT',
                          payload: {
                            event: 'KNOWLEDGE_DRAFT_UPDATED',
                            data: { id: draft.id, updates: { lesson: e.target.value } },
                            details: '更新分歧案例处置结果与教训'
                          }
                        });
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">知识标签</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {draft.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold border border-blue-100 flex items-center gap-1">
                          {tag} <X size={10} className="cursor-pointer" />
                        </span>
                      ))}
                      <button className="px-2 py-1 border border-dashed border-slate-300 rounded text-[10px] text-slate-400 hover:border-blue-300 hover:text-blue-500 transition-colors">
                        + 添加标签
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </Modal>

      <Modal
        isOpen={isReportPreviewOpen}
        onClose={() => setIsReportPreviewOpen(false)}
        title="运维复盘报告预览"
        size="lg"
      >
        <div className="bg-white p-8 border border-slate-200 shadow-inner rounded-lg max-h-[70vh] overflow-y-auto font-serif">
          <div className="text-center border-b-2 border-slate-900 pb-6 mb-8">
            <h1 className="text-3xl font-bold uppercase tracking-widest">光伏电站运维复盘报告</h1>
            <p className="text-slate-500 mt-2">Report ID: {run.runId} | 生成时间: {new Date().toLocaleString()}</p>
          </div>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">1. 基础信息</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">电站名称</span>
                  <span className="font-bold">{run.station.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">诊断结论</span>
                  <span className="font-bold text-red-600">{run.evidenceChain.diagnosis.conclusion}</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">2. 运维成效</h2>
              <div className="grid grid-cols-3 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 uppercase">PR 恢复值</div>
                  <div className="text-2xl font-bold text-emerald-600">{run.acceptance.metrics?.recovery || '+5.6%'}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 uppercase">验收评分</div>
                  <div className="text-2xl font-bold text-blue-600">{run.acceptance.score || 96}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-center">
                  <div className="text-xs text-slate-500 uppercase">任务完成率</div>
                  <div className="text-2xl font-bold text-slate-900">100%</div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold border-l-4 border-blue-600 pl-3 mb-4">3. 审计日志</h2>
              <div className="space-y-2">
                {(run.auditLog || []).slice(0, 5).map((log, i) => (
                  <div key={i} className="flex gap-4 text-xs border-b border-slate-50 pb-2">
                    <span className="text-slate-400 font-mono">{new Date(log.ts).toLocaleTimeString()}</span>
                    <span className="font-bold text-slate-700">[{log.eventType}]</span>
                    <span className="text-slate-600">{log.message}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
            Auxenta AI 智能运维引擎 自动生成
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isLibraryModalOpen}
        onClose={() => setIsLibraryModalOpen(false)}
        title={quickViewType === 'case' ? '企业案例库' : '经验知识库'}
        size="lg"
      >
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={libraryFilter === 'current' ? 'primary' : 'outline'}
                onClick={() => setLibraryFilter('current')}
              >
                本次运行
              </Button>
              <Button 
                size="sm" 
                variant={libraryFilter === 'all' ? 'primary' : 'outline'}
                onClick={() => setLibraryFilter('all')}
              >
                全部条目
              </Button>
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索条目..." 
                className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
            {[
              ...(quickViewType === 'case' ? [
                { id: 'CASE-20240305-01', title: '全站机器人清洗PR恢复案例', date: '2024-03-05', type: '积灰', runId: run.runId },
                { id: 'CASE-20240228-04', title: '区域B逆变器风扇故障排除', date: '2024-02-28', type: '硬件故障', runId: 'RUN-OLD-123' },
                { id: 'CASE-20240215-09', title: '阴影遮挡导致的PR异常分析', date: '2024-02-15', type: '环境影响', runId: 'RUN-OLD-456' }
              ] : []),
              ...(run.evidenceChain.knowledgeDrafts || [])
                .filter(d => d.status === 'saved')
                .map(d => ({
                  id: d.id,
                  title: `[分歧案例] ${d.conflictPoint.substring(0, 20)}...`,
                  date: new Date().toISOString().split('T')[0],
                  type: '诊断冲突',
                  runId: run.runId,
                  isDraft: true,
                  draftData: d
                }))
            ]
            .filter(item => libraryFilter === 'all' || item.runId === run.runId)
            .map((item) => (
              <div 
                key={item.id}
                className="p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer flex justify-between items-center group"
                onClick={() => openItemDetail(item)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{item.title}</div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] text-slate-400">{item.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 rounded text-slate-500">{item.type}</span>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </Modal>

      <div className={`fixed inset-y-0 right-0 w-[450px] bg-white shadow-2xl z-[100] transform transition-transform duration-300 ease-in-out border-l border-slate-200 flex flex-col ${isDetailDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900">条目详情</h3>
            <p className="text-xs text-slate-500 mt-1">{selectedLibraryItem?.id}</p>
          </div>
          <button onClick={() => setIsDetailDrawerOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">基本信息</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">来源运行 ID</span>
                <span className="text-sm font-mono font-bold text-blue-600">{selectedLibraryItem?.runId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">故障类型</span>
                <span className="text-sm font-bold text-slate-900">{selectedLibraryItem?.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500">归档时间</span>
                <span className="text-sm font-bold text-slate-900">{selectedLibraryItem?.date}</span>
              </div>
            </div>
          </section>

          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">诊断与处置</h4>
            {selectedLibraryItem?.isDraft ? (
              <div className="space-y-4">
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="text-[10px] font-bold text-amber-800 uppercase mb-2">核心分歧点</div>
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    {selectedLibraryItem.draftData.conflictPoint}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">AI 结论</div>
                    <div className="text-xs text-slate-600">{selectedLibraryItem.draftData.aiConclusion}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="text-[10px] text-slate-400 uppercase mb-1">人工结论</div>
                    <div className="text-xs text-slate-600">{selectedLibraryItem.draftData.humanConclusion}</div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-800 uppercase mb-2">处置结果与教训</div>
                  <p className="text-sm text-blue-900 font-medium leading-relaxed">
                    {selectedLibraryItem.draftData.lesson}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-800 uppercase mb-2">AI 诊断结论</div>
                  <p className="text-sm text-blue-900 font-medium leading-relaxed">
                    {run.evidenceChain.diagnosis.conclusion}
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">采取动作</div>
                  <div className="flex flex-wrap gap-2">
                    {['全站机器人清洗', '增派运维班组-C', 'PR 实时监测'].map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 border border-slate-200">{tag}</span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </section>

          {!selectedLibraryItem?.isDraft && (
            <section>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">核心指标对比</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase mb-1">处置前 PR</div>
                  <div className="text-xl font-bold text-slate-900">76.5%</div>
                </div>
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="text-[10px] text-emerald-600 uppercase mb-1">处置后 PR</div>
                  <div className="text-xl font-bold text-emerald-700">82.1%</div>
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => toast.success('链接已复制')}>复制链接</Button>
          <Button className="flex-1 bg-blue-600 text-white" onClick={() => toast.success('正在导出 PDF...')}>导出 PDF</Button>
        </div>
      </div>

      <Modal 
        isOpen={isOwnerModalOpen} 
        onClose={() => setIsOwnerModalOpen(false)} 
        title="责任人确认与派发"
        footer={
          <Button onClick={handleOwnerConfirm} className="bg-blue-800 text-white hover:bg-blue-900 font-bold border border-blue-400">确认派发</Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">请核对以下运维任务的执行主体与预估工期：</p>
          {run.execution.tasks.map(t => (
            <div key={t.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="font-bold text-slate-900 text-sm">{t.title}</div>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">执行主体</label>
                  <select 
                    className="w-full mt-1 bg-white border border-slate-200 rounded p-1 text-xs"
                    value={taskAssignments[t.id]?.ownerName}
                    onChange={(e) => setTaskAssignments({...taskAssignments, [t.id]: {...taskAssignments[t.id], ownerName: e.target.value}})}
                  >
                    <option value="智洗机器人-01">智洗机器人-01</option>
                    <option value="运维班组-A">运维班组-A</option>
                    <option value="运维班组-B">运维班组-B</option>
                    <option value="巡检无人机-Alpha">巡检无人机-Alpha</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase">截止时间</label>
                  <div className="text-xs mt-1 font-medium text-slate-600">{new Date(t.dueAt || Date.now()).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
        title="进度反馈与采集"
        footer={
          <Button onClick={handleFeedbackSubmit} className="bg-blue-600 text-white">提交反馈</Button>
        }
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">当前进度 ({feedbackData.progress}%)</label>
            <input 
              type="range" 
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              value={feedbackData.progress}
              onChange={(e) => setFeedbackData({...feedbackData, progress: parseInt(e.target.value)})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">反馈说明</label>
            <textarea 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="请描述当前作业情况，如遇异常请注明..."
              value={feedbackData.text}
              onChange={(e) => setFeedbackData({...feedbackData, text: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">附件上传 (占位)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center text-slate-400">
              <Upload size={24} className="mb-2" />
              <span className="text-xs">点击或拖拽上传现场照片/日志</span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isMitigationModalOpen} 
        onClose={() => setIsMitigationModalOpen(false)} 
        title="智能二次优化方案"
        footer={
          <Button onClick={handleMitigationConfirm} className="bg-blue-600 text-white">确认执行所选方案</Button>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
            <div className="text-xs font-bold text-red-900 uppercase mb-1">风险根因分析</div>
            <div className="text-sm text-red-700 font-medium">{rootCause}</div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">AI 推荐策略</label>
            {mitigationOptions.map((opt) => (
              <button 
                key={opt.id}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedOptionId === opt.id ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                onClick={() => setSelectedOptionId(opt.id)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-slate-900">{opt.label}</span>
                  {selectedOptionId === opt.id && <CheckCircle2 size={16} className="text-blue-600" />}
                </div>
                <div className="text-xs text-slate-500">{opt.impact}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {opt.tasks.map((t: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-400">+{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isTaskOwnerConfirmModalOpen}
        onClose={() => setIsTaskOwnerConfirmModalOpen(false)}
        title="任务负责人确认"
        footer={
          <Button onClick={handleOwnerTaskConfirm} className="bg-blue-600 text-white">提交确认</Button>
        }
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[10px] text-slate-400 uppercase font-bold">待确认任务</div>
            <div className="text-sm font-bold text-slate-900">
              {run.execution.tasks?.find(t => t.id === selectedTaskId)?.title}
            </div>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">确认决策</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'accept', label: '接受任务', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
                { id: 'reject', label: '拒绝任务', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                { id: 'need_resource', label: '需要资源', icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' }
              ].map((opt) => (
                <button 
                  key={opt.id}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${ownerConfirmData.decision === opt.id ? `${opt.border} ${opt.bg}` : 'border-slate-100 hover:border-slate-200'}`}
                  onClick={() => setOwnerConfirmData({ ...ownerConfirmData, decision: opt.id })}
                >
                  <opt.icon size={20} className={ownerConfirmData.decision === opt.id ? opt.color : 'text-slate-300'} />
                  <span className={`text-[10px] font-bold ${ownerConfirmData.decision === opt.id ? opt.color : 'text-slate-500'}`}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">备注说明</label>
            <textarea 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="请输入确认备注或资源需求说明..."
              value={ownerConfirmData.note}
              onChange={(e) => setOwnerConfirmData({ ...ownerConfirmData, note: e.target.value })}
            />
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={isProgressLogOpen}
        onClose={() => setIsProgressLogOpen(false)}
        title="任务执行记录回放"
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-4">
            <div className="text-xs text-slate-400 uppercase font-bold">当前任务</div>
            <div className="text-sm font-bold text-slate-900">
              {run.execution.tasks?.find(t => t.id === selectedTaskId)?.title}
            </div>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {(run.execution.progressLogs || [])
              .filter(log => log.taskId === selectedTaskId)
              .map((log, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-slate-100 pb-4 last:pb-0">
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-slate-900">{log.reporter}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.ts).toLocaleString()}</span>
                  </div>
                  <div className="text-xs font-bold text-blue-600 mb-1">进度更新: {log.progress}%</div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg">{log.note}</p>
                </div>
              ))}
            {(run.execution.progressLogs || []).filter(log => log.taskId === selectedTaskId).length === 0 && (
              <div className="text-center py-8 text-slate-400 italic text-sm">暂无执行记录</div>
            )}
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isCriteriaModalOpen} 
        onClose={() => setIsCriteriaModalOpen(false)} 
        title="设置验收标准"
        footer={
          <Button onClick={() => {
            dispatchEvent('ACCEPTANCE_CRITERIA_SET', criteria, '设置验收标准');
            dispatchEvent('ACCEPTANCE_CRITERIA_CONFIRMED', null, '自动确认验收标准建议', true);
            setIsCriteriaModalOpen(false);
          }} className="bg-blue-600 text-white">保存标准</Button>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-500">请根据本项目运维目标设定验收阈值：</p>
          {criteria.map((c, i) => (
            <div key={c.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex-1">
                <div className="text-xs font-bold text-slate-400 uppercase">{c.name}</div>
                <input 
                  className="w-full mt-1 bg-transparent font-bold text-slate-900 outline-none"
                  value={c.target}
                  onChange={(e) => {
                    const newCriteria = [...criteria];
                    newCriteria[i].target = e.target.value;
                    setCriteria(newCriteria);
                  }}
                />
              </div>
              <div className="text-xs text-slate-400">目标值</div>
            </div>
          ))}
        </div>
      </Modal>

      <Modal 
        isOpen={isPreviewModalOpen} 
        onClose={() => setIsPreviewModalOpen(false)} 
        title="运维复盘报告预览"
        footer={
          <Button onClick={() => setIsPreviewModalOpen(false)} className="bg-slate-900 text-white">关闭预览</Button>
        }
      >
        <div className="aspect-[3/4] bg-slate-100 rounded-xl border border-slate-200 p-8 overflow-y-auto">
          <div className="text-center mb-8">
            <h1 className="text-xl font-black text-slate-900">光伏电站运维复盘报告</h1>
            <p className="text-xs text-slate-400 mt-2">报告编号: {run.runId} | 生成时间: {new Date().toLocaleString()}</p>
          </div>
          <div className="space-y-6">
            <section>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">1. 异常诊断</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{run.evidenceChain.diagnosis.conclusion}</p>
            </section>
            <section>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">2. 执行情况</h2>
              <div className="space-y-2">
                {run.execution.tasks.map(t => (
                  <div key={t.id} className="flex justify-between text-[10px]">
                    <span className="text-slate-600">{t.title}</span>
                    <span className="font-bold text-emerald-600">已完成 (100%)</span>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">3. 验收评估</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[8px] text-slate-400 uppercase">PR 恢复</div>
                  <div className="text-sm font-black text-emerald-600">{run.acceptance.metrics?.recovery}</div>
                </div>
                <div className="p-2 bg-white rounded border border-slate-200">
                  <div className="text-[8px] text-slate-400 uppercase">综合得分</div>
                  <div className="text-sm font-black text-emerald-600">{run.acceptance.score}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        title={
          quickViewType === 'uav' ? '无人机巡检实时影像' :
          quickViewType === 'case' ? '企业案例库 - 本次归档' : '专家知识库 - 本次沉淀'
        }
      >
        <div className="space-y-4">
          {quickViewType === 'uav' ? (
            <div className="relative rounded-xl overflow-hidden border-4 border-slate-900 shadow-2xl">
              <div className="relative group bg-slate-950">
                <img 
                  src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=1200&q=80" 
                  alt="UAV Thermal Inspection" 
                  className="w-full h-auto opacity-80 mix-blend-screen"
                  style={{ filter: 'invert(1) hue-rotate(200deg) saturate(4) contrast(1.5) brightness(0.7)' }}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-transparent to-orange-900/40 pointer-events-none" />
                
                {/* Simulated AI Detection Boxes - Matching Reference Style (Blue boxes with circles) */}
                <div className="absolute top-[22%] left-[28%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                <div className="absolute top-[20%] left-[38%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                
                <div className="absolute top-[42%] left-[45%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                <div className="absolute top-[42%] left-[52%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                <div className="absolute top-[42%] left-[58%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                
                <div className="absolute top-[50%] left-[48%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                <div className="absolute top-[50%] left-[55%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                
                <div className="absolute top-[65%] left-[50%] w-6 h-6 border border-blue-400/80 flex items-center justify-center animate-pulse">
                  <div className="w-1.5 h-1.5 rounded-full border border-blue-400" />
                </div>
                
                {/* Status Labels */}
                <div className="absolute top-[38%] left-[45%] bg-blue-500/80 text-white text-[6px] px-1 font-mono">ANOMALY_DETECTED</div>
                <div className="absolute top-[18%] left-[28%] bg-blue-500/80 text-white text-[6px] px-1 font-mono">TEMP_RISE: +4.2°C</div>
              </div>
              
              {/* HUD Elements */}
              <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="bg-black/60 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono">ALT: 12.4m</div>
                <div className="bg-black/60 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono">SPD: 1.2m/s</div>
              </div>
              <div className="absolute top-4 right-4 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded font-bold animate-pulse">REC ●</div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="bg-black/60 text-white text-[10px] px-2 py-1 rounded font-mono">GPS: 31.2304° N, 121.4737° E</div>
                <div className="w-16 h-16 border-2 border-white/40 rounded-full flex items-center justify-center">
                  <div className="w-1 h-8 bg-white/60 rounded-full transform rotate-45"></div>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-slate-400">展示与当前 Run ID 相关的条目</div>
                <Button size="sm" variant="ghost" className="text-blue-600 text-xs">查看全部</Button>
              </div>
              <Card className="p-4 border-blue-100 bg-blue-50/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{quickViewType === 'case' ? `案例: ${run.station.name} 积灰治理` : '经验: 区域B积灰特征识别规则'}</div>
                    <div className="text-[10px] text-slate-400 mt-1">ID: {quickViewType === 'case' ? run.outputs.caseRecord.caseId : run.outputs.knowledgeRecord.knowledgeId}</div>
                  </div>
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">NEW</div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['积灰', '光伏', '清洗', '自动化'].map(tag => (
                    <span key={tag} className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-500">#{tag}</span>
                  ))}
                </div>
                <Button className="w-full mt-4 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs py-2 h-auto font-bold">
                  打开详情抽屉
                </Button>
              </Card>
            </>
          )}
        </div>
      </Modal>

      {/* Workflow Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-8">
          {currentIndex > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleGoBack}
              className="mr-4 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
            >
              <ChevronLeft size={18} className="mr-1" /> 返回上一步
            </Button>
          )}
          <div className="flex items-center gap-6">
            {STAGES.map((s, i) => {
              const isActive = run.stage === s.id;
              const isCompleted = STAGES.findIndex(stage => stage.id === run.stage) > i;
              const isAccessible = i <= STAGES.findIndex(stage => stage.id === run.furthestStage);

              return (
                <div key={s.id} className="flex items-center gap-4">
                  <div 
                    className={`flex items-center gap-3 cursor-pointer transition-all ${!isAccessible ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'}`}
                    onClick={() => isAccessible && handleStageNavigate(s.id)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110' : 
                      isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                    }`}>
                      <s.icon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>{s.label}</span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Stage 0{i+1}</span>
                    </div>
                  </div>
                  {i < STAGES.length - 1 && <div className="w-8 h-px bg-slate-100" />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Run ID</div>
            <div className="text-xs font-black text-slate-900">{run.runId}</div>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <Button variant="ghost" size="sm" onClick={() => {
            localStorage.removeItem('auxenta_run');
            window.location.reload();
          }}>
            <RefreshCcw size={14} className="mr-2" /> 重置流程
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        <div className="col-span-9">
          <AnimatePresence mode="wait">
            <motion.div
              key={run.stage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              {run.stage === 'collect' && renderStageA()}
              {run.stage === 'diagnose' && renderStageB()}
              {run.stage === 'execute' && renderStageC()}
              {run.stage === 'accept' && renderStageD()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Audit Log Sidebar */}
        <div className="col-span-3">
          <Card className="h-full flex flex-col p-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <History size={14} /> 审计日志 (Audit Log)
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {run.auditLog.map((log, i) => (
                <div key={i} className="relative pl-4 border-l border-slate-100 pb-4 last:pb-0">
                  <div className="absolute left-[-4.5px] top-1 w-2 h-2 rounded-full bg-blue-500" />
                  <div className="text-[10px] text-slate-400 mb-1">{new Date(log.ts).toLocaleTimeString()}</div>
                  <div className="text-xs font-bold text-slate-900 mb-1">{log.eventType}</div>
                  <div className="text-[10px] text-slate-500 leading-relaxed">{log.message}</div>
                </div>
              ))}
              {run.auditLog.length === 0 && (
                <div className="text-center py-12 text-slate-400 italic text-xs">
                  等待操作触发日志...
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const RefreshCcw = ({ size, className }: { size: number, className?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 16h5v5" />
  </svg>
);
