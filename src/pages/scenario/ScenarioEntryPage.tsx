import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Briefcase, 
  Sprout, 
  Plane, 
  Zap, 
  Shield, 
  ClipboardList, 
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  AlertCircle,
  Search,
  Bot,
  Navigation,
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  User,
  Settings2,
  Download,
  ChevronDown,
  ChevronUp,
  Sun,
  Cloud,
  Thermometer,
  TrendingDown,
  LayoutDashboard,
  Database as DatabaseIcon,
  Ticket,
  FileText as FileTextIcon,
  PieChart
} from 'lucide-react';
import { useGlobalStore } from '../../store/GlobalStore';
import { useCopilot } from '../../copilot/core/CopilotContext';
import { ErrorBoundary } from '../../components/common/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { PowerOpsState, PowerOpsSubModule } from '../../types';
import { PersonaEngine } from '../../copilot/core/PersonaEngine';
import { PowerPVWorkflow } from '../../components/scenario/PowerPVWorkflow';
import { AssetLedger } from '../../components/scenario/AssetLedger';
import { WorkOrderCenter } from '../../components/scenario/WorkOrderCenter';
import { ReportCenter } from '../../components/scenario/ReportCenter';

const SCENARIO_CONFIG: Record<string, { title: string; icon: React.ElementType; color: string; description: string }> = {
  powerops: { title: '电力能源', icon: Zap, color: 'text-yellow-600', description: '电网负荷监控与调度' },
  lowaltitudeops: { title: '低空智管', icon: Plane, color: 'text-sky-600', description: '低空空域管理与航线规划' },
  ruralops: { title: '商业运营', icon: Sprout, color: 'text-green-600', description: '农业数据监测与乡村治理' },
  policeops: { title: '智慧警务', icon: Shield, color: 'text-indigo-600', description: '治安防控与警情研判' },
  govpmo: { title: '政务督办', icon: ClipboardList, color: 'text-red-600', description: '重点任务督查与绩效考核' },
};

const PowerOpsDashboard = ({ 
  revenueDeviation, 
  risks, 
  currentState, 
  handleRiskClick, 
  handleStateChange 
}: { 
  revenueDeviation: number, 
  risks: any[], 
  currentState: string, 
  handleRiskClick: () => void,
  handleStateChange: (state: any) => void
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. 今日发电量 */}
        <Card 
          className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('powerops-event', { 
              detail: { event: 'E_CLICK_GEN', label: '查看发电量', source: 'workflow' } 
            }));
          }}
        >
          <div className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">今日发电量</div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl font-black text-slate-900">128.6</span>
            <span className="text-sm font-bold text-slate-500">MWh</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingUp size={14} />
            <span>↑ 2.3%</span>
            <span className="text-slate-400 font-normal ml-1">同比昨日</span>
          </div>
        </Card>

        {/* 2. 今日发电收益 */}
        <Card 
          className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('powerops-event', { 
              detail: { event: 'E_CLICK_REV', label: '查看发电收益', source: 'workflow' } 
            }));
          }}
        >
          <div className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">今日发电收益</div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-sm font-bold text-slate-900">¥</span>
            <span className="text-3xl font-black text-slate-900">98,240</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
            <TrendingUp size={14} />
            <span>收益稳定</span>
          </div>
        </Card>

        {/* 3. 本月累计收益 */}
        <Card 
          className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('powerops-event', { 
              detail: { event: 'E_CLICK_MONTHLY', label: '查看本月收益', source: 'workflow' } 
            }));
          }}
        >
          <div className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider">本月累计收益</div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-sm font-bold text-slate-900">¥</span>
            <span className="text-3xl font-black text-slate-900">2,340,000</span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold ${revenueDeviation < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {revenueDeviation < 0 ? <AlertTriangle size={14} /> : <TrendingUp size={14} />}
            <span>相比计划目标：偏差 {revenueDeviation > 0 ? '+' : ''}{revenueDeviation.toFixed(1)}%</span>
          </div>
        </Card>

        {/* 4. 风险洞察与异常溯源 */}
        <Card 
          className={`col-span-1 md:col-span-2 p-6 border-none shadow-sm transition-all cursor-pointer ${
            currentState === 'S1_ANOMALY' ? 'bg-indigo-900 text-white ring-4 ring-indigo-500/30' : 'bg-white hover:shadow-md'
          }`}
          onClick={handleRiskClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`text-sm font-bold uppercase tracking-wider ${currentState === 'S1_ANOMALY' ? 'text-indigo-200' : 'text-slate-400'}`}>风险洞察与异常溯源</div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold ${currentState === 'S1_ANOMALY' ? 'bg-indigo-50 text-white' : 'bg-red-50 text-red-600'}`}>
              {risks.filter(r => r.status === 'unhandled').length} 个待处理
            </div>
          </div>
          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                currentState === 'S1_ANOMALY' ? 'bg-white/10 hover:bg-white/20' : 'bg-slate-50 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    risk.level === 'error' ? 'bg-red-500/20 text-red-500' : 
                    risk.level === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {risk.level === 'error' ? <AlertCircle size={18} /> : 
                     risk.level === 'warning' ? <AlertTriangle size={18} /> : <Activity size={18} />}
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${currentState === 'S1_ANOMALY' ? 'text-white' : 'text-slate-900'}`}>{risk.name}</div>
                    <div className={`text-[10px] ${currentState === 'S1_ANOMALY' ? 'text-indigo-200' : 'text-slate-500'}`}>{risk.desc}: {risk.impact}</div>
                  </div>
                </div>
                {risk.status === 'handled' ? (
                  <CheckCircle2 size={16} className="text-emerald-500" />
                ) : (
                  <Button 
                    size="sm" 
                    variant={currentState === 'S1_ANOMALY' ? 'primary' : 'secondary'} 
                    className="h-7 text-[10px] px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStateChange('S1_ANOMALY');
                    }}
                  >
                    溯源分析
                  </Button>
                )}
              </div>
            ))}
          </div>
          {currentState === 'S1_ANOMALY' && (
            <div className="mt-4 p-3 bg-indigo-500/30 rounded-xl border border-indigo-400/30">
              <div className="flex items-center gap-2 text-xs font-bold text-white mb-1">
                <Bot size={14} />
                量仔分析建议
              </div>
              <p className="text-[10px] text-indigo-100 leading-relaxed">
                检测到区域B组件污染呈扩散趋势，PR值已跌破阈值。建议立即启动“机器人清洗预案”，预计挽回日收益 ¥1,200。
              </p>
              <Button 
                className="w-full mt-3 bg-white text-indigo-600 hover:bg-indigo-50 h-8 text-xs font-bold"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStateChange('S2_PLAN');
                }}
              >
                生成预案
              </Button>
            </div>
          )}
        </Card>
      </div>

      <div className="flex items-center gap-6 px-2 text-xs font-medium text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>数据更新时间：10分钟前</span>
        </div>
        <div className="w-px h-3 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <Navigation size={12} />
          <span>场站：XX光伏电站</span>
        </div>
        <div className="w-px h-3 bg-slate-200" />
        <div className="flex items-center gap-1.5">
          <Sun size={12} className="text-amber-500" />
          <span>天气：晴</span>
        </div>
        <div className="w-px h-3 bg-slate-200" />
        <div className="flex items-center gap-1.5 text-emerald-600">
          <TrendingUp size={12} />
          <span>昨日对比：+1.2%</span>
        </div>
      </div>
    </div>
  );
};

const AssetHealthStructure = () => {
  const structures = [
    {
      title: '设备健康结构',
      score: 88,
      impact: '-0.7%',
      status: 'normal',
      metrics: [
        { label: '逆变器异常率', value: '1.8%', status: 'normal' },
        { label: '组件衰减指数', value: '正常', status: 'normal' },
        { label: '热斑风险概率', value: '低', status: 'normal' },
      ]
    },
    {
      title: '环境影响结构',
      score: 82,
      impact: '-1.1%',
      status: 'warning',
      metrics: [
        { label: '污染遮挡指数', value: '中等', status: 'warning' },
        { label: '光照偏差率', value: '+1.2%', status: 'normal' },
        { label: '温度影响系数', value: '正常', status: 'normal' },
      ]
    },
    {
      title: '运维执行结构',
      score: 90,
      impact: '-0.3%',
      status: 'normal',
      metrics: [
        { label: '巡检完成率', value: '96%', status: 'normal' },
        { label: '清洗周期偏差', value: '+3天', status: 'warning' },
        { label: '故障响应时长', value: '2.3小时', status: 'normal' },
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    if (status === 'warning') return 'text-amber-500 bg-amber-500';
    if (status === 'error') return 'text-red-500 bg-red-500';
    return 'text-emerald-500 bg-emerald-500';
  };

  const getStatusText = (status: string) => {
    if (status === 'warning') return '需关注';
    if (status === 'error') return '异常';
    return '正常';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Activity size={24} className="text-blue-600" />
          资产健康结构分析区
        </h2>
        <span className="text-sm text-slate-400">数据更新于：10分钟前</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {structures.map((s, i) => (
          <Card key={i} className="p-0 overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">{s.title}</span>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${getStatusColor(s.status).split(' ')[1]}`} />
                <span className={`text-xs font-bold ${getStatusColor(s.status).split(' ')[0]}`}>{getStatusText(s.status)}</span>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 flex-1 flex items-center gap-8">
              {/* Metrics List */}
              <div className="flex-1 space-y-5">
                {s.metrics.map((m, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{m.label}</span>
                    <span className={`text-sm font-bold ${m.status === 'warning' ? 'text-amber-600' : 'text-slate-900'}`}>{m.value}</span>
                  </div>
                ))}
              </div>

              {/* Score Ring */}
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90">
                  <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                  <circle 
                    cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" fill="transparent" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 * (1 - s.score / 100)} 
                    className={getStatusColor(s.status).split(' ')[0]} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-slate-900">{s.score}</span>
                  <span className="text-[10px] font-bold text-slate-400">SCORE</span>
                </div>
              </div>
            </div>

            {/* Footer Impact */}
            <div className={`px-6 py-4 ${s.status === 'warning' ? 'bg-amber-50' : 'bg-slate-50'} flex items-center justify-between`}>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">对收益影响贡献度</span>
              <span className={`text-base font-black ${s.impact.startsWith('-') ? 'text-red-500' : 'text-emerald-500'}`}>{s.impact}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const RiskInsightArea = ({ risks }: { risks: any[] }) => {
  const getLevelStyles = (level: string) => {
    if (level === 'error') return 'bg-red-50 text-red-600 border-red-100';
    if (level === 'warning') return 'bg-amber-50 text-amber-600 border-amber-100';
    return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  };

  const getLevelLabel = (level: string) => {
    if (level === 'error') return '高';
    if (level === 'warning') return '中';
    return '低';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle size={24} className="text-red-500" />
          风险洞察与异常溯源区
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Risk List */}
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">当前风险列表 (按影响排序)</div>
          {risks.map((r) => (
            <Card key={r.id} className={`p-5 border shadow-sm hover:shadow-md transition-all cursor-pointer group ${r.status === 'handling' ? 'border-blue-400 bg-blue-50/50' : r.status === 'handled' ? 'opacity-60 border-slate-100' : 'border-slate-100 bg-white'}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-900">{r.name}</span>
                    {r.status === 'handling' && <Loader2 size={14} className="animate-spin text-blue-500" />}
                    {r.status === 'handled' && <CheckCircle2 size={14} className="text-emerald-500" />}
                  </div>
                  <div className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold border ${getLevelStyles(r.level)}`}>
                    风险等级：{getLevelLabel(r.level)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black text-red-500">{r.impact}</div>
                  <div className="text-xs text-slate-400">{r.desc}</div>
                </div>
              </div>
              <button className="w-full py-2.5 text-xs font-bold text-blue-600 bg-white border border-blue-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                查看溯源详情
              </button>
            </Card>
          ))}
        </div>

        {/* Right: Analysis */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full p-10 border-none shadow-sm bg-white">
            <div className="grid grid-cols-2 gap-10 mb-10">
              <div className="p-8 bg-red-50 rounded-2xl border border-red-100">
                <div className="text-sm font-bold text-red-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <AlertTriangle size={16} /> 风险影响测算
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-xs text-red-600 font-bold mb-1">若不处理，预计7日损失</div>
                    <div className="text-4xl font-black text-red-600">¥32,000</div>
                  </div>
                  <div className="pt-5 border-t border-red-200/50">
                    <div className="text-xs text-emerald-600 font-bold mb-1">若处理，收益恢复预测</div>
                    <div className="text-2xl font-black text-emerald-600">+1.1%</div>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Search size={16} /> 溯源分析
                </div>
                <div className="text-base text-slate-600 leading-relaxed">
                  “污染指数异常主要集中在<span className="font-bold text-slate-900">区域B南侧阵列</span>，结合近期风沙天气与清洗周期延后3天，判定为<span className="font-bold text-slate-900">外部环境叠加运维延迟</span>所致。”
                </div>
                <div className="mt-8 flex items-center gap-6">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-bold">关联因素</span>
                    <span className="text-sm font-bold text-slate-700">环境因素 (70%)</span>
                  </div>
                  <div className="w-px h-10 bg-slate-200" />
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 uppercase font-bold">运维响应</span>
                    <span className="text-sm font-bold text-slate-700">延迟 72h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                  <Zap size={20} />
                </div>
                <div className="text-sm">
                  <span className="font-bold text-blue-900">智能建议：</span>
                  <span className="text-blue-700">系统已锁定异常阵列，建议优先执行区域B南侧清洗作业。</span>
                </div>
              </div>
              <Button variant="outline" size="sm" className="text-xs border-blue-200 text-blue-600 px-4">
                生成方案模拟
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const IntelligentActionArea = ({ 
  onExecute, 
  role,
  isLedgerModalOpen,
  setIsLedgerModalOpen,
  currentState,
  onStateChange,
  ledger
}: { 
  onExecute: (action: any) => void, 
  role: string,
  isLedgerModalOpen: boolean,
  setIsLedgerModalOpen: (open: boolean) => void,
  currentState: string,
  onStateChange: (state: any) => void,
  ledger: any[]
}) => {
  const [selectedAction, setSelectedAction] = React.useState<any>(null);
  const [executingAction, setExecutingAction] = React.useState<any>(null);
  const [feedbackAction, setFeedbackAction] = React.useState<{ action: any, status: 'success' | 'failure' } | null>(null);
  const [step, setStep] = React.useState(0);
  const [showSummary, setShowSummary] = React.useState(false);
  const { dispatch: copilotDispatch } = useCopilot();
  const { dispatch: globalDispatch } = useGlobalStore();

  // Role Permissions
  const canApprove = role === 'ADMIN' || role === 'MANAGER';
  const canDirectExecute = role === 'ADMIN';

  const recommendations = [
    {
      id: 'act-1',
      name: '调度清洗机器人清洗',
      reason: '区域B/污染指数偏高',
      impact: '+1.1%',
      duration: '45min',
      resource: '清洗机器人-02',
      priority: 'P0',
      confidence: 0.98,
      steps: ['任务初始化', '路径规划', '执行清洗', '效果回传']
    },
    {
      id: 'act-2',
      name: '调度无人机巡检',
      reason: '逆变器3号温度异常',
      impact: '风险规避',
      duration: '15min',
      resource: '无人机-Alpha',
      priority: 'P1',
      confidence: 0.92,
      steps: ['起飞准备', '航线巡航', '红外扫描', '数据分析']
    },
    {
      id: 'act-3',
      name: '触发热斑复核工单',
      reason: '组件热斑异常点3处',
      impact: '寿命延长',
      duration: '2h',
      resource: '人工运维组',
      priority: 'P2',
      confidence: 0.85,
      steps: ['工单下发', '现场复核', '组件更换', '结果录入']
    },
    {
      id: 'act-4',
      name: '逆变器参数校验与重启',
      reason: '通讯延迟告警',
      impact: '稳定性提升',
      duration: '5min',
      resource: '系统自动',
      priority: 'P2',
      confidence: 0.99,
      steps: ['参数读取', '逻辑校验', '远程重启', '状态确认']
    }
  ];

  const handleViewPlan = (action: any) => {
    setSelectedAction(action);
    onStateChange('S2_PLAN');
    
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_CLICK_PLAN', label: '生成处置预案', source: 'workflow' } 
    }));

    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `plan-${Date.now()}`,
        role: 'assistant',
        content: `正在为您编排【${action.name}】的执行方案。该任务针对${action.reason}，预计可挽回收益${action.impact}。请在右侧面板确认资源配置。`,
        timestamp: Date.now(),
        type: 'text'
      }
    });
  };

  const handleApprove = (action: any) => {
    onStateChange('S3_DISPATCH');
    
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_APPROVE_PLAN', label: '批准并下发', source: 'workflow' } 
    }));

    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `approve-${Date.now()}`,
        role: 'assistant',
        content: `预案已审批通过。正在生成任务包（${action.resource}），请确认执行优先级及时间窗。`,
        timestamp: Date.now(),
        type: 'text'
      }
    });
  };

  const handleStartExecute = (action: any) => {
    if (!action) {
      toast.error("未选择有效行动方案");
      return;
    }
    onStateChange('S4_TRACKING');
    setExecutingAction(action);
    setStep(0);
    setFeedbackAction(null);
    
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_CONFIRM_DISPATCH', label: '确认下发', source: 'workflow' } 
    }));

    // Update Global Run State
    globalDispatch({
      type: 'DISPATCH_RUN_EVENT',
      payload: {
        event: 'PLAN_CONFIRMED',
        data: { id: action.id },
        details: `已确认并下发任务：${action.name}`
      }
    });

    // Toast feedback logic
    const toastId = toast.loading("任务已下发，正在执行…");
    
    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `executing-start-${Date.now()}`,
        role: 'assistant',
        content: `已启动【${action.name}】。正在调度 ${action.resource}，预计耗时 ${action.duration}。我将实时监控执行进度并为您反馈。`,
        timestamp: Date.now(),
        type: 'text'
      }
    });

    copilotDispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        title: '任务已启动',
        content: `正在执行：${action.name}，资源：${action.resource}`,
        type: 'info'
      }
    });

    // Accompaniment messages pool
    const accompanimentMessages = [
      `[数据分析] 正在实时监测 ${action.resource} 的运行参数，当前链路状态良好。`,
      `[风险提示] 检测到局部风速波动，已自动开启防风避障逻辑，确保设备安全。`,
      `[纠偏执行] 发现执行路径微小偏差，已完成毫秒级指令纠偏，精度恢复至 99.9%。`,
      `[状态确认] 正在校验执行结果，数据回传完整性 100%。`
    ];

    // Simulate steps
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      
      if (currentStep >= action.steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          const isSuccess = action.id !== 'act-4'; // act-4 fails for demo
          setExecutingAction(null);
          
          if (isSuccess) {
            onExecute(action);
            setFeedbackAction({ action, status: 'success' });
            onStateChange('S5_LEDGER');
            toast.success("执行完成，已写入运维闭环台账", { id: toastId, icon: '✅' });
            
            copilotDispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: `executing-success-${Date.now()}`,
                role: 'assistant',
                content: `任务已执行完成，已自动生成台账记录。 [查看台账](javascript:window.dispatchEvent(new CustomEvent('open-ledger')))`,
                timestamp: Date.now(),
                type: 'text'
              }
            });

            copilotDispatch({
              type: 'SET_NOTIFICATION',
              payload: {
                title: '任务执行成功',
                content: `【${action.name}】已顺利完成，收益恢复符合预期。`,
                type: 'success'
              }
            });
          } else {
            setFeedbackAction({ action, status: 'failure' });
            onStateChange('S5_LEDGER');
            toast.error("任务执行失败", { id: toastId });
            
            copilotDispatch({
              type: 'ADD_MESSAGE',
              payload: {
                id: `executing-failure-${Date.now()}`,
                role: 'assistant',
                content: `任务执行失败，可能因为网络问题导致远程通讯失败，从而触发安全机制，中断任务执行。具体过程可查看运维闭环台账。 [查看台账](javascript:window.dispatchEvent(new CustomEvent('open-ledger')))`,
                timestamp: Date.now(),
                type: 'text'
              }
            });

            copilotDispatch({
              type: 'SET_NOTIFICATION',
              payload: {
                title: '任务执行失败',
                content: `【${action.name}】执行中断，请检查通讯链路。`,
                type: 'warning'
              }
            });
          }
        }, 1000);
        return;
      }

      // Update UI step
      setStep(currentStep);

      // Add accompaniment message for each step
      const summary = accompanimentMessages[currentStep % accompanimentMessages.length];
      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `accompaniment-${Date.now()}-${currentStep}`,
          role: 'assistant',
          content: summary,
          timestamp: Date.now(),
          type: 'text'
        }
      });

      copilotDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          title: `执行进度: ${Math.round(((currentStep + 1) / action.steps.length) * 100)}%`,
          content: summary.split('] ')[1] || summary,
          type: 'info'
        }
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Bot size={24} className="text-indigo-600" />
            智能行动建议区
          </h2>
          <p className="text-sm text-slate-400 mt-1">将风险与收益影响转化为可执行的闭环任务</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase">当前角色权限:</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">{role}</span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* A. Action List */}
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">推荐行动列表 (按优先级排序)</div>
            <div className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-bold">
              当前状态: {currentState}
            </div>
          </div>
          
          {currentState === 'S0_OVERVIEW' || currentState === 'S1_ANOMALY' || currentState === 'S5_LEDGER' || currentState === 'S6_REVIEW' ? (
            recommendations.map((act) => (
              <Card key={act.id} className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all group">
                <div className="flex items-start justify-between">
                  <div className="flex gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${act.priority === 'P0' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                      {act.priority === 'P0' ? <Zap size={24} /> : <Navigation size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-base font-bold text-slate-900">{act.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-black ${act.priority === 'P0' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>{act.priority}</span>
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-4">
                        <span>触发原因: <span className="text-slate-700 font-medium">{act.reason}</span></span>
                        <span>预计收益: <span className="text-emerald-600 font-bold">{act.impact}</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    {canDirectExecute && (
                      <Button 
                        size="sm" 
                        className="text-xs h-9 px-4"
                        onClick={() => handleStartExecute(act)}
                      >
                        直接下发
                      </Button>
                    )}
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="text-xs h-9 px-4"
                      onClick={() => handleViewPlan(act)}
                    >
                      查看方案
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : currentState === 'S2_PLAN' ? (
            <Card className="p-8 border-none shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">预案编排中: {selectedAction?.name}</h3>
                  <p className="text-xs text-slate-500">基于历史最优路径生成的执行方案</p>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-3">方案对比</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 ring-1 ring-indigo-50">
                      <div className="text-[10px] text-indigo-600 font-bold mb-1">方案 A (推荐)</div>
                      <div className="text-xs text-slate-600">成本: 低 | 耗时: 45min | 收益: +1.1%</div>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold mb-1">方案 B</div>
                      <div className="text-xs text-slate-600">成本: 中 | 耗时: 30min | 收益: +0.9%</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                {canApprove ? (
                  <Button className="flex-1" onClick={() => handleApprove(selectedAction)}>发起审批</Button>
                ) : (
                  <div className="flex-1 text-center p-3 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold border border-amber-100">
                    等待主管审批中...
                  </div>
                )}
                <Button variant="secondary" onClick={() => onStateChange('S1_ANOMALY')}>取消</Button>
              </div>
            </Card>
          ) : currentState === 'S3_DISPATCH' ? (
            <Card className="p-8 border-none shadow-sm bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Navigation size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">任务包确认: {selectedAction?.name}</h3>
                  <p className="text-xs text-slate-500">资源已就绪，请确认执行细节</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">执行资源</div>
                  <div className="text-sm font-bold text-slate-900">{selectedAction?.resource}</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">优先级</div>
                  <div className="text-sm font-bold text-red-600">{selectedAction?.priority}</div>
                </div>
              </div>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">风险控制点</div>
                  <div className="text-sm font-bold text-slate-900">自动避障 / 实时防风 / 毫秒级纠偏</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <div className="text-[10px] text-slate-400 font-bold uppercase mb-2">参数配置</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold">区域B-南侧</span>
                    <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold">高频采样</span>
                    <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold">拍照回传</span>
                    <span className="px-2 py-1 bg-white border border-slate-200 text-slate-600 rounded text-[10px] font-bold">实时流</span>
                  </div>
                </div>
              </div>
              <Button className="w-full h-12 text-base font-bold shadow-lg shadow-indigo-100" onClick={() => handleStartExecute(selectedAction)}>确认执行</Button>
            </Card>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <Loader2 size={32} className="text-slate-300 animate-spin mb-4" />
              <p className="text-sm text-slate-400">任务正在流转中，请关注右侧面板</p>
            </div>
          )}
        </div>

        {/* B & C. Orchestrator & Feedback */}
        <div className="col-span-12 lg:col-span-5">
          <Card className="h-full p-8 border-none shadow-sm bg-slate-900 text-white relative overflow-hidden">
            <AnimatePresence mode="wait">
              {feedbackAction ? (
                <motion.div 
                  key="feedback"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="h-full flex flex-col items-center justify-center text-center py-4"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                    className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 ${feedbackAction.status === 'success' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}
                  >
                    {feedbackAction.status === 'success' ? <CheckCircle2 size={64} /> : <XCircle size={64} />}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-3">
                    {feedbackAction.status === 'success' ? '任务执行成功' : '任务执行失败'}
                  </h3>
                  <p className="text-slate-400 text-sm mb-10 max-w-xs leading-relaxed">
                    {feedbackAction.status === 'success' 
                      ? `【${feedbackAction.action?.name || '任务'}】已顺利完成，相关风险已解除，收益已计入台账。`
                      : `【${feedbackAction.action?.name || '任务'}】执行中断。检测到通讯链路异常，已触发系统安全保护机制。`}
                  </p>
                  <div className="flex flex-col w-full gap-3">
                    <Button 
                      className="w-full h-12 text-sm font-bold" 
                      onClick={() => setIsLedgerModalOpen(true)}
                    >
                      查看运维闭环台账
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full h-12 text-sm bg-slate-800/50 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                      onClick={() => {
                        setFeedbackAction(null);
                        setSelectedAction(null);
                        onStateChange('S0_OVERVIEW');
                      }}
                    >
                      返回建议列表
                    </Button>
                  </div>
                </motion.div>
              ) : executingAction ? (
                <motion.div 
                  key="executing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Loader2 size={20} className="animate-spin text-blue-400" />
                      <span className="text-base font-bold">正在执行: {executingAction.name}</span>
                    </div>
                    <span className="text-xs text-slate-400">Step {step + 1}/{executingAction.steps.length}</span>
                  </div>
                  
                  <div className="flex-1 space-y-8">
                    {executingAction.steps.map((s: string, i: number) => (
                      <div key={i} className="flex items-center gap-5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${i < step ? 'bg-emerald-500 border-emerald-500 text-white' : i === step ? 'bg-blue-600 border-blue-600 text-white animate-pulse' : 'border-slate-700 text-slate-500'}`}>
                          {i < step ? <CheckCircle2 size={16} /> : i + 1}
                        </div>
                        <span className={`text-sm font-medium ${i <= step ? 'text-white' : 'text-slate-500'}`}>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-8 border-t border-slate-800">
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / executingAction.steps.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-3 text-center">实时回传链路已加密，预计完成时间: {executingAction.duration}</p>
                  </div>
                </motion.div>
              ) : selectedAction ? (
                <motion.div 
                  key="orchestrator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-base font-bold">执行编排面板</h3>
                    <button onClick={() => setSelectedAction(null)} className="text-slate-400 hover:text-white transition-colors"><XCircle size={20} /></button>
                  </div>
                  
                  <div className="space-y-6 flex-1">
                    <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-400 uppercase font-bold mb-2">任务详情</div>
                      <div className="text-sm font-bold">{selectedAction.name}</div>
                      <div className="text-xs text-slate-500 mt-1">触发源: {selectedAction.reason}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">资源占用</div>
                        <div className="text-sm font-bold">{selectedAction.resource}</div>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <div className="text-xs text-slate-400 uppercase font-bold mb-1">风险控制点</div>
                        <div className="text-sm font-bold">自动避障/防风</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs text-slate-400 uppercase font-bold">参数配置</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-blue-600/20 text-blue-400 rounded text-xs border border-blue-600/30">区域B-南侧</span>
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">高频采样</span>
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">拍照回传</span>
                        <span className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">实时流</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 flex gap-4">
                    {currentState === 'S3_DISPATCH' ? (
                      <div className="flex-1 text-center p-3 bg-blue-500/10 text-blue-400 rounded-xl text-xs font-bold border border-blue-500/20">
                        任务包已锁定，请在左侧确认执行
                      </div>
                    ) : (
                      <>
                        <Button className="flex-1 h-11 text-sm shadow-lg shadow-blue-500/20" onClick={() => handleStartExecute(selectedAction)}>确认执行</Button>
                        <Button 
                          variant="outline" 
                          className="flex-1 h-11 text-sm bg-slate-800/50 border-slate-500 text-slate-200 hover:bg-slate-700 hover:text-white hover:border-slate-400 transition-all"
                        >
                          转为工单
                        </Button>
                      </>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-5 opacity-50">
                  <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                    <Settings2 size={40} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-base font-bold">等待任务下发</p>
                    <p className="text-sm text-slate-500 mt-1">选择左侧行动建议开始编排</p>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </div>

      {/* Ledger Modal */}
      <AnimatePresence>
        {isLedgerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <FileCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">运维闭环台账</h3>
                    <p className="text-xs text-slate-500">最近 10 条执行记录</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm" className="text-xs h-9 gap-2 px-4" onClick={() => toast.success('正在导出台账数据...')}>
                    <Download size={16} /> 导出台账
                  </Button>
                  <button onClick={() => setIsLedgerModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <XCircle size={24} />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-50">
                      <th className="pb-4 font-bold uppercase tracking-wider">时间</th>
                      <th className="pb-4 font-bold uppercase tracking-wider">动作</th>
                      <th className="pb-4 font-bold uppercase tracking-wider">对象</th>
                      <th className="pb-4 font-bold uppercase tracking-wider">结果</th>
                      <th className="pb-4 font-bold uppercase tracking-wider">影响</th>
                      <th className="pb-4 font-bold uppercase tracking-wider">执行者</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {ledger.slice(0, 10).map((item, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="py-4 text-slate-500">{item.time}</td>
                        <td className="py-4 font-bold text-slate-900">{item.action}</td>
                        <td className="py-4 text-slate-600">{item.target}</td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.result === '成功' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                            {item.result}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-emerald-600">{item.impact}</td>
                        <td className="py-4 flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                            {item.executor === '量仔' ? <Bot size={12} className="text-indigo-600" /> : <User size={12} className="text-slate-600" />}
                          </div>
                          <span className="text-slate-600">{item.executor}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex justify-end">
                <Button onClick={() => setIsLedgerModalOpen(false)}>关闭</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Summary Modal (Demo) */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-8 bg-blue-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap size={24} />
                    <span className="text-xl font-black">今日运维简报</span>
                  </div>
                  <button onClick={() => setShowSummary(false)}><XCircle size={24} /></button>
                </div>
                <p className="text-blue-100 text-sm">生成时间: {new Date().toLocaleDateString()} 22:45</p>
              </div>
              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-black text-slate-900">12</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">执行任务</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-emerald-600">100%</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">成功率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-blue-600">¥4.2w</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">挽回损失</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900">核心小结</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    今日系统共触发 12 次智能行动，主要集中在区域B的污染清洗与逆变器参数校准。通过及时响应，成功规避了潜在的发电量损失，全站健康评分维持在 87 分稳定水平。
                  </p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 mb-2">后续建议</h4>
                  <ul className="text-[10px] text-slate-500 space-y-1 list-disc pl-4">
                    <li>持续关注区域B组件衰减趋势</li>
                    <li>建议下周二进行全站红外热斑扫描</li>
                    <li>优化清洗机器人路径算法以节省电量</li>
                  </ul>
                </div>
                <Button className="w-full" onClick={() => setShowSummary(false)}>下载 PDF 报告</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ScenarioEntryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, dispatch: globalDispatch } = useGlobalStore();
  const { dispatch: copilotDispatch } = useCopilot();
  const config = id && SCENARIO_CONFIG[id] ? SCENARIO_CONFIG[id] : null;

  // Lifted State for Data Linkage
  const [revenueDeviation, setRevenueDeviation] = React.useState(-1.8);
  const [risks, setRisks] = React.useState([
    { id: 1, name: '区域B组件污染指数偏高', level: 'warning', impact: '-1.2%', desc: '预计影响收益', status: 'unhandled' },
    { id: 2, name: '逆变器3号温度异常', level: 'error', impact: '潜在停机风险', desc: '风险提示', status: 'unhandled' },
    { id: 3, name: '组件热斑异常点3处', level: 'info', impact: '轻微影响', desc: '风险状态', status: 'unhandled' }
  ]);
  const [ledger, setLedger] = React.useState([
    { time: '10:24', action: '系统自检', target: '全站逆变器', result: '成功', impact: '稳定', executor: '系统' },
    { time: '09:15', action: '参数校准', target: '逆变器-07', result: '成功', impact: '+0.1%', executor: '量仔' },
  ]);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = React.useState(false);
  const [currentState, setCurrentState] = React.useState<PowerOpsState>('S0_OVERVIEW');
  const currentSubModule = state.powerOpsSubModule || 'HOME';

  const setSubModule = (sub: PowerOpsSubModule) => {
    globalDispatch({ type: 'SET_POWEROPS_SUBMODULE', payload: sub });
  };

  // Trigger initial S0 message only if not already in a specific state
  React.useEffect(() => {
    if (id === 'powerops' && currentState === 'S0_OVERVIEW') {
      handleStateChange('S0_OVERVIEW');
    }
  }, [id]);

  // Role Permissions
  const isAdmin = state.currentUserRole === 'ADMIN';
  const isManager = state.currentUserRole === 'MANAGER';
  const isOperator = state.currentUserRole === 'OPERATOR';

  // State Machine Transitions
  const handleStateChange = (newState: PowerOpsState) => {
    setCurrentState(newState);
    globalDispatch({ type: 'SET_POWEROPS_STATE', payload: newState });
    
    // Dispatch event for Copilot tracking
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: `STATE_${newState}`, label: `切换至状态: ${newState}`, source: 'workflow' } 
    }));
    
    // Trigger Script-based Welcome Message
    const role = state.currentUserRole || 'OPERATOR';
    const script = PersonaEngine.getPowerOpsScript(newState, role);
    
    if (script) {
      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `state-welcome-${newState}-${Date.now()}`,
          role: 'assistant',
          content: script.message,
          timestamp: Date.now(),
          type: 'text',
          actions: script.actions.map(a => ({ label: a.label, event: a.event }))
        }
      });

      copilotDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          title: `状态切换: ${newState}`,
          content: script.message.length > 60 ? script.message.substring(0, 57) + '...' : script.message,
          type: 'info'
        }
      });
    }
  };

  const handleRiskClick = () => {
    handleStateChange('S1_ANOMALY');
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: 'E_CLICK_RISK', label: '查看风险洞察', source: 'workflow' } 
    }));
  };

  // Listen for custom ledger open event from Copilot links
  React.useEffect(() => {
    const handleOpenLedger = () => {
      setIsLedgerModalOpen(true);
      if (id === 'powerops') setCurrentState('S5_LEDGER');
    };
    window.addEventListener('open-ledger', handleOpenLedger);
    return () => window.removeEventListener('open-ledger', handleOpenLedger);
  }, [id]);

  const handleExecuteAction = (action: any) => {
    if (!action) return;
    
    // 1. Update Global Run State
    globalDispatch({
      type: 'DISPATCH_RUN_EVENT',
      payload: {
        event: 'MITIGATION_EXECUTED',
        data: { mitigationId: action.id },
        details: `任务【${action.name}】已成功执行`
      }
    });

    // 2. Update Risks (Local UI)
    setRisks(prev => prev.map(r => {
      if (action.id === 'act-1' && r.id === 1) return { ...r, status: 'handled' };
      if (action.id === 'act-2' && r.id === 2) return { ...r, status: 'handled' };
      return r;
    }));

    // 3. Update Revenue
    if (action.id === 'act-1') setRevenueDeviation(prev => prev + 1.1);
    if (action.id === 'act-2') setRevenueDeviation(prev => prev + 0.2);

    // 4. Update Ledger
    const newEntry = {
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: action.name,
      target: action.resource,
      result: '成功',
      impact: action.impact,
      executor: state.currentUserRole === 'ADMIN' ? 'ADMIN' : '量仔'
    };
    setLedger(prev => [newEntry, ...prev]);

    // 5. Copilot Feedback
    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `feedback-${Date.now()}`,
        role: 'assistant',
        content: `任务【${action.name}】已成功执行。区域B污染风险已解除，预计挽回收益 ${action.impact}。作为您的助理，我已将此次处置经验记录在案。`,
        timestamp: Date.now(),
        type: 'text'
      }
    });

    copilotDispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        title: '执行反馈',
        content: `任务【${action.name}】已成功执行，风险已解除。`,
        type: 'success'
      }
    });
  };

  // Listen for Copilot suggestions
  React.useEffect(() => {
    const handlePowerOpsEvent = (e: any) => {
      const { event, label, source } = e.detail;
      if (source === 'workflow') return; // Ignore events triggered by the workflow itself
      
      const sm = PersonaEngine.getPowerOpsStateMachine();
      const currentStateConfig = sm.states[currentState];
      const transition = currentStateConfig?.transitions.find(t => t.event === event);

      if (transition) {
        // Handle Guard
        if (transition.guard) {
          const role = state.currentUserRole || 'OPERATOR';
          const canTransition = transition.guard === 'G_CAN_APPROVE' || transition.guard === 'G_CAN_DISPATCH' 
            ? (role === 'ADMIN' || role === 'MANAGER')
            : true;
          
          if (!canTransition) {
            toast.error("权限不足，无法执行此操作");
            return;
          }
        }
        handleStateChange(transition.target as PowerOpsState);
      }

      // Handle specific side effects
      switch (event) {
        case 'E_WRITE_LEDGER':
          toast.success('已成功写入运维闭环台账');
          break;
        case 'E_EXPORT_REPORT':
          toast.success('报告导出中...');
          break;
        case 'E_SAVE_TO_KNOWLEDGE':
          toast.success('已成功入库沉淀至电力运维知识引擎');
          break;
        case 'E_BACK':
          // Simple back logic or handled by transition
          break;
        default:
          console.log('PowerOps event received:', event, label);
      }
    };

    window.addEventListener('powerops-event', handlePowerOpsEvent);
    return () => window.removeEventListener('powerops-event', handlePowerOpsEvent);
  }, [currentState, state.currentUserRole]);

  React.useEffect(() => {
    const handleCopilotExecute = (e: any) => {
      if (e.detail.actionId === 'act-1') {
        // Find the action definition
        const action = {
          id: 'act-1',
          name: '调度清洗机器人清洗',
          resource: '清洗机器人-02',
          impact: '+1.1%'
        };
        handleExecuteAction(action);
        toast.success('已通过量仔指令启动 P0 清洗任务');
      }
    };

    window.addEventListener('powerops-execute', handleCopilotExecute);
    return () => window.removeEventListener('powerops-execute', handleCopilotExecute);
  }, []);

  if (!config) {
    return <div>场景不存在</div>;
  }

  const Icon = config.icon;

  const subModules = [
    { id: 'HOME', name: '首页', icon: LayoutDashboard },
    { id: 'ASSETS', name: '资产台账', icon: DatabaseIcon },
    { id: 'TICKETS', name: '工单中心', icon: Ticket },
    { id: 'REPORTS', name: '报告中心', icon: PieChart },
  ];

  const renderSubModuleContent = () => {
    switch (currentSubModule) {
      case 'HOME':
        return (
          <>
            {/* 1) 资产收益驾驶舱 & 风险洞察 (S0/S1) */}
            <PowerOpsDashboard 
              revenueDeviation={revenueDeviation} 
              risks={risks}
              currentState={currentState}
              handleRiskClick={handleRiskClick}
              handleStateChange={handleStateChange}
            />
            
            {/* 2) 工作台入口 (上移到KPI区块下方) */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-stretch justify-between">
              <div className="flex gap-6">
                <div className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center ${config.color} shrink-0`}>
                  <Icon size={32} />
                </div>
                <div className="flex flex-col justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">电力运维工作台</h1>
                    <p className="text-gray-500 mt-2 text-lg">进入全流程运维执行与调度（采集→诊断→预案→派发→跟踪→复盘）</p>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <Button size="lg" onClick={() => setSubModule('WORKBENCH')}>进入工作台</Button>
                    <Button variant="secondary" size="lg" onClick={() => toast.success('正在生成今日运维日报...')}>查看日报</Button>
                  </div>
                </div>
              </div>
              <div className="hidden lg:flex flex-col justify-between items-end">
                <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                  运行状态：正常
                </div>
                <Button variant="secondary" size="lg" className="gap-2 shadow-sm" onClick={() => setIsLedgerModalOpen(true)}>
                  <FileCheck size={20} /> 运维闭环台账
                </Button>
              </div>
            </div>

            {/* 3) 风险与异常诊断 (结构分析) */}
            <AssetHealthStructure />

            {/* 4) 智能行动建议 (S2/S3/S4) */}
            <IntelligentActionArea 
              onExecute={handleExecuteAction} 
              role={state.currentUserRole || 'OPERATOR'} 
              isLedgerModalOpen={isLedgerModalOpen}
              setIsLedgerModalOpen={setIsLedgerModalOpen}
              currentState={currentState}
              onStateChange={handleStateChange}
              ledger={ledger}
            />
          </>
        );
      case 'WORKBENCH':
        return <PowerPVWorkflow />;
      case 'ASSETS':
        return <AssetLedger />;
      case 'TICKETS':
        return <WorkOrderCenter />;
      case 'REPORTS':
        return <ReportCenter />;
      case 'LEDGER':
        return (
          <Card className="p-12 flex flex-col items-center justify-center text-center bg-slate-50 border-dashed border-2 border-slate-200">
            <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-6">
              {React.createElement(subModules.find(s => s.id === currentSubModule)?.icon || DatabaseIcon, { size: 40 })}
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{subModules.find(s => s.id === currentSubModule)?.name}</h3>
            <p className="text-slate-500 max-w-md">该模块正在建设中，目前仅支持在【电力工作台】中进行全流程闭环演示。</p>
            <Button className="mt-8" onClick={() => setSubModule('WORKBENCH')}>返回工作台</Button>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6 relative">
      {/* PowerOps Specific Top Section */}
      {id === 'powerops' ? (
        <div className="flex flex-col gap-6">
          {renderSubModuleContent()}
        </div>
      ) : (
        <>
          {/* Hero Section for other scenarios */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex items-start justify-between">
            <div className="flex gap-6">
              <div className={`w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center ${config.color}`}>
                <Icon size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{config.title}</h1>
                <p className="text-gray-500 mt-2 text-lg">{config.description}</p>
                <div className="flex gap-3 mt-6">
                  <Button size="lg">进入工作台</Button>
                  <Button variant="secondary" size="lg">查看报表</Button>
                </div>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                运行状态：正常
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </ErrorBoundary>
  );
};
