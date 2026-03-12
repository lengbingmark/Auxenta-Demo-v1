import React from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { 
  LineChart, 
  Line, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  Cell
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
  PieChart,
  Calendar,
  Share2,
  Printer,
  FileText
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
  handleStateChange,
  onCardClick
}: { 
  revenueDeviation: number, 
  risks: any[], 
  currentState: string, 
  handleRiskClick: () => void,
  handleStateChange: (state: any) => void,
  onCardClick: (type: string) => void
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. 今日发电量 */}
        <Card 
          className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => {
            onCardClick('GEN');
            window.dispatchEvent(new CustomEvent('powerops-event', { 
              detail: { event: 'E_CLICK_GEN', label: '查看发电量', source: 'user' } 
            }));
          }}
        >
          <div className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider group-hover:text-blue-500 transition-colors">今日发电量</div>
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
          className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => {
            onCardClick('REV');
            window.dispatchEvent(new CustomEvent('powerops-event', { 
              detail: { event: 'E_CLICK_REV', label: '查看发电收益', source: 'user' } 
            }));
          }}
        >
          <div className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider group-hover:text-blue-500 transition-colors">今日发电收益</div>
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
          className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow cursor-pointer group"
          onClick={() => {
            onCardClick('MONTHLY');
            window.dispatchEvent(new CustomEvent('powerops-event', { 
              detail: { event: 'E_CLICK_MONTHLY', label: '查看本月收益', source: 'user' } 
            }));
          }}
        >
          <div className="text-sm font-bold text-slate-400 uppercase mb-3 tracking-wider group-hover:text-blue-500 transition-colors">本月累计收益</div>
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
            currentState === 'S1_ANOMALY' ? 'bg-[#0f172a] text-white ring-1 ring-blue-500/50 shadow-[0_0_40px_rgba(59,130,246,0.15)]' : 'bg-white hover:shadow-md'
          }`}
          onClick={handleRiskClick}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`text-sm font-bold uppercase tracking-wider ${currentState === 'S1_ANOMALY' ? 'text-blue-500' : 'text-slate-400'}`}>风险洞察与异常溯源</div>
            <div className={`px-2 py-1 rounded text-[10px] font-bold ${currentState === 'S1_ANOMALY' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-50 text-red-600'}`}>
              {risks.filter(r => r.status === 'unhandled').length} 个待处理
            </div>
          </div>
          <div className="space-y-3">
            {risks.map((risk) => (
              <div key={risk.id} className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                currentState === 'S1_ANOMALY' ? 'bg-slate-800/40 border border-slate-700/50 hover:bg-slate-800/60' : 'bg-slate-50 hover:bg-slate-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    risk.level === 'error' ? 'bg-red-500/20 text-red-500' : 
                    risk.level === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-blue-500/20 text-blue-500'
                  }`}>
                    {risk.level === 'error' ? <AlertCircle size={20} /> : 
                     risk.level === 'warning' ? <AlertTriangle size={20} /> : <Activity size={20} />}
                  </div>
                  <div>
                    <div className={`text-base font-bold ${currentState === 'S1_ANOMALY' ? 'text-white' : 'text-slate-900'}`}>{risk.name}</div>
                    <div className={`text-sm mt-1 ${currentState === 'S1_ANOMALY' ? 'text-slate-300' : 'text-slate-500'}`}>{risk.desc}: {risk.impact}</div>
                  </div>
                </div>
                {risk.status === 'handled' ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Button 
                    size="sm" 
                    variant={currentState === 'S1_ANOMALY' ? 'primary' : 'secondary'} 
                    className={`h-9 text-xs px-5 font-bold ${currentState === 'S1_ANOMALY' ? 'bg-blue-600 hover:bg-blue-700 border-none shadow-lg shadow-blue-900/20' : ''}`}
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
            <div className="mt-6 p-6 bg-slate-800/80 rounded-2xl border border-blue-500/30 backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-2 text-base font-bold text-blue-300 mb-3">
                <Bot size={20} className="animate-pulse" />
                量仔分析建议
              </div>
              <p className="text-base text-white leading-relaxed font-bold">
                检测到区域B组件污染呈扩散趋势，PR值已跌破阈值。建议立即启动“机器人清洗预案”，预计挽回日收益 ¥1,200。
              </p>
              <Button 
                className="w-full mt-6 bg-blue-600 text-white hover:bg-blue-700 h-12 text-base font-black shadow-xl shadow-blue-900/50 border-none transition-all active:scale-[0.98]"
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

const AssetHealthStructure = ({ onCardClick }: { onCardClick: (type: string) => void }) => {
  const structures = [
    {
      id: 'HEALTH',
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
      id: 'ENV',
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
      id: 'OPS',
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
          <Card 
            key={i} 
            className="p-0 overflow-hidden border-none shadow-sm bg-white hover:shadow-md transition-shadow flex flex-col cursor-pointer group"
            onClick={() => onCardClick(s.id)}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-50 flex items-center justify-between group-hover:bg-slate-50 transition-colors">
              <span className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{s.title}</span>
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
    if (level === 'error') return 'bg-red-500 text-white border-red-600 shadow-sm shadow-red-200';
    if (level === 'warning') return 'bg-amber-500 text-white border-amber-600 shadow-sm shadow-amber-200';
    return 'bg-emerald-500 text-white border-emerald-600 shadow-sm shadow-emerald-200';
  };

  const getLevelLabel = (level: string) => {
    if (level === 'error') return '紧急风险';
    if (level === 'warning') return '中等风险';
    return '低风险';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
          <AlertCircle size={32} className="text-red-600" />
          风险洞察与异常溯源
        </h2>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Risk List */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="text-sm font-black text-slate-400 uppercase tracking-widest mb-2">当前风险列表 (实时监控)</div>
          {risks.map((r) => (
            <Card key={r.id} className={`p-6 border-2 shadow-sm hover:shadow-xl transition-all cursor-pointer group ${r.status === 'handling' ? 'border-blue-500 bg-blue-50/50' : r.status === 'handled' ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200 bg-white'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black text-slate-900">{r.name}</span>
                    {r.status === 'handling' && <Loader2 size={20} className="animate-spin text-blue-600" />}
                    {r.status === 'handled' && <CheckCircle2 size={20} className="text-emerald-600" />}
                  </div>
                  <div className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black border uppercase tracking-wider ${getLevelStyles(r.level)}`}>
                    {getLevelLabel(r.level)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-red-600">{r.impact}</div>
                  <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-tighter">预计损失</div>
                </div>
              </div>
              <button className="w-full py-4 text-sm font-black text-blue-700 bg-blue-50 border border-blue-200 rounded-2xl opacity-0 group-hover:opacity-100 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-lg shadow-blue-200/50">
                查看溯源详情
              </button>
            </Card>
          ))}
        </div>

        {/* Right: Analysis */}
        <div className="col-span-12 lg:col-span-8">
          <Card className="h-full p-12 border-none shadow-2xl bg-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50" />
            
            <div className="relative z-10 grid grid-cols-2 gap-12 mb-12">
              <div className="p-10 bg-slate-900 rounded-[40px] border-none shadow-2xl shadow-slate-200">
                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  风险影响测算
                </div>
                <div className="space-y-10">
                  <div>
                    <div className="text-sm text-slate-400 font-bold mb-3 uppercase tracking-wider">若不处理，预计7日损失</div>
                    <div className="text-6xl font-black text-white tracking-tighter">¥32,000</div>
                  </div>
                  <div className="pt-10 border-t border-slate-800">
                    <div className="text-sm text-emerald-500 font-bold mb-3 uppercase tracking-wider">若处理，收益恢复预测</div>
                    <div className="text-4xl font-black text-emerald-400">+1.1%</div>
                  </div>
                </div>
              </div>

              <div className="p-10 bg-blue-50/50 rounded-[40px] border border-blue-100">
                <div className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                  <Search size={18} /> 溯源分析
                </div>
                <div className="text-2xl text-slate-900 leading-snug font-bold tracking-tight">
                  “污染指数异常主要集中在<span className="text-blue-600 underline decoration-blue-200 underline-offset-8">区域B南侧阵列</span>，判定为<span className="text-red-600">外部环境叠加运维延迟</span>所致。”
                </div>
                <div className="mt-12 flex items-center gap-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">关联因素</span>
                    <span className="text-lg font-black text-slate-900">环境因素 (70%)</span>
                  </div>
                  <div className="w-px h-12 bg-slate-200" />
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">运维响应</span>
                    <span className="text-lg font-black text-slate-900">延迟 72h</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 p-10 bg-blue-600 rounded-[32px] flex items-center justify-between shadow-2xl shadow-blue-200 group">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-xl">
                  <Bot size={32} className="animate-bounce" />
                </div>
                <div className="max-w-md">
                  <div className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mb-2">量仔智能建议</div>
                  <div className="text-xl text-white font-bold leading-tight">
                    系统已锁定异常阵列，建议优先执行区域B南侧清洗作业。
                  </div>
                </div>
              </div>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 h-16 px-10 rounded-2xl text-base font-black shadow-2xl transition-all active:scale-95">
                生成方案模拟
              </Button>
            </div>
          </Card>
        </div>
      </div>
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
  const [isReportModalOpen, setIsReportModalOpen] = React.useState(false);
  const [currentState, setCurrentState] = React.useState<PowerOpsState>('S0_OVERVIEW');

  const powerData = [
    { time: '00:00', actual: 0, forecast: 0 },
    { time: '02:00', actual: 0, forecast: 0 },
    { time: '04:00', actual: 0, forecast: 0 },
    { time: '06:00', actual: 5, forecast: 8 },
    { time: '08:00', actual: 25, forecast: 30 },
    { time: '10:00', actual: 65, forecast: 60 },
    { time: '12:00', actual: 95, forecast: 90 },
    { time: '14:00', actual: 85, forecast: 88 },
    { time: '16:00', actual: 45, forecast: 50 },
    { time: '18:00', actual: 10, forecast: 12 },
    { time: '20:00', actual: 0, forecast: 0 },
    { time: '22:00', actual: 0, forecast: 0 },
  ];
  const currentSubModule = state.powerOpsSubModule || 'HOME';

  const handleCardClick = (type: string) => {
    window.dispatchEvent(new CustomEvent('powerops-event', { 
      detail: { event: `E_CLICK_${type}`, label: `查看${type}分析`, source: 'user' } 
    }));
  };

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
      detail: { event: `STATE_${newState}`, label: `切换至状态: ${newState}`, source: 'user' } 
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
      detail: { event: 'E_CLICK_RISK', label: '查看风险洞察', source: 'user' } 
    }));
  };

  // Listen for custom ledger open event from Copilot links
  React.useEffect(() => {
    const handleOpenLedger = () => {
      setIsLedgerModalOpen(true);
      if (id === 'powerops') setCurrentState('S5_LEDGER');
    };
    const handlePowerOpsEvent = (e: any) => {
      const { event } = e.detail;
      if (event === 'E_PREVIEW_REPORT' || event === 'E_EXPORT_REPORT') {
        setIsReportModalOpen(true);
      }
    };

    window.addEventListener('open-ledger', handleOpenLedger);
    window.addEventListener('powerops-event', handlePowerOpsEvent);
    return () => {
      window.removeEventListener('open-ledger', handleOpenLedger);
      window.removeEventListener('powerops-event', handlePowerOpsEvent);
    };
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
              onCardClick={handleCardClick}
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
                    <Button variant="secondary" size="lg" onClick={() => setIsReportModalOpen(true)}>查看日报</Button>
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
            <AssetHealthStructure onCardClick={handleCardClick} />

            {/* 4) 智能行动建议 (S2/S3/S4) - Removed in Step3-E, now handled by Agent */}
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
          
          {/* 今日运维日报 Modal */}
          <Modal
            isOpen={isReportModalOpen}
            onClose={() => setIsReportModalOpen(false)}
            title="今日运维日报"
            size="xl"
            footer={
              <div className="flex gap-3">
                <Button variant="secondary" className="gap-2" onClick={() => toast.success('正在导出 PDF...')}>
                  <Download size={16} /> 导出 PDF
                </Button>
                <Button variant="secondary" className="gap-2" onClick={() => toast.success('已发送至邮箱')}>
                  <Share2 size={16} /> 分享日报
                </Button>
                <Button onClick={() => setIsReportModalOpen(false)}>关闭</Button>
              </div>
            }
          >
            <div className="space-y-8">
              {/* Report Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold mb-1">
                    <Calendar size={18} />
                    <span>2026年3月11日 星期三</span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900">光伏场站运行日报</h2>
                  <p className="text-gray-500 text-sm mt-1">场站名称：华东一号分布式光伏电站 | 运维负责人：张工</p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">运行状态</div>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <CheckCircle2 size={18} />
                    <span>正常运行</span>
                  </div>
                </div>
              </div>

              {/* KPI Summary */}
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: '今日发电量', value: '128.6', unit: 'MWh', trend: '+2.3%', color: 'blue' },
                  { label: '今日收益', value: '9.82', unit: '万元', trend: '+1.5%', color: 'emerald' },
                  { label: '综合效率(PR)', value: '82.5', unit: '%', trend: '+0.8%', color: 'indigo' },
                  { label: '设备可用率', value: '99.8', unit: '%', trend: '持平', color: 'purple' },
                ].map((kpi, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{kpi.label}</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-black text-gray-900">{kpi.value}</span>
                      <span className="text-xs font-bold text-gray-500">{kpi.unit}</span>
                    </div>
                    <div className={`text-[10px] font-bold mt-1 ${kpi.trend.includes('+') ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {kpi.trend} 同比昨日
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column: Charts */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp size={16} className="text-blue-500" />
                      24小时出力曲线
                    </h3>
                    <div className="h-48 w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={powerData}>
                          <XAxis dataKey="time" hide />
                          <YAxis hide />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="actual" 
                            stroke="#3b82f6" 
                            strokeWidth={3} 
                            dot={false}
                            animationDuration={1500}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="forecast" 
                            stroke="#94a3b8" 
                            strokeWidth={2} 
                            strokeDasharray="5 5" 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-500" />
                      各区域 PR 值对比
                    </h3>
                    <div className="h-48 w-full bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: '区域A', pr: 84.2 },
                          { name: '区域B', pr: 79.5 },
                          { name: '区域C', pr: 83.8 },
                          { name: '区域D', pr: 82.1 },
                        ]}>
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                          <YAxis hide domain={[70, 90]} />
                          <RechartsTooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="pr" radius={[4, 4, 0, 0]} barSize={30}>
                            {[84.2, 79.5, 83.8, 82.1].map((val, index) => (
                              <Cell key={`cell-${index}`} fill={val < 80 ? '#f59e0b' : '#6366f1'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Right Column: Events & Tasks */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500" />
                      今日异常与处置
                    </h3>
                    <div className="space-y-3">
                      {[
                        { time: '09:45', title: '区域B积灰严重预警', status: '已处置', detail: '启动机器人清洗，PR值提升1.2%' },
                        { time: '11:20', title: '3号逆变器风扇告警', status: '已派单', detail: '环境温度过高，已下发滤网清洗工单' },
                        { time: '14:15', title: '通讯网关偶发性离线', status: '处理中', detail: '正在进行远程链路复位测试' },
                      ].map((event, idx) => (
                        <div key={idx} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-[10px] font-bold text-gray-400">{event.time}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              event.status === '已处置' ? 'bg-emerald-50 text-emerald-600' : 
                              event.status === '已派单' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                            }`}>{event.status}</span>
                          </div>
                          <div className="text-xs font-bold text-gray-900">{event.title}</div>
                          <div className="text-[10px] text-gray-500 mt-1">{event.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Bot size={16} className="text-blue-500" />
                      量仔智能建议
                    </h3>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Bot size={48} className="text-blue-600" />
                      </div>
                      <p className="text-xs text-blue-800 leading-relaxed font-medium relative z-10">
                        “今日场站整体运行稳健，但区域B的积灰速度快于预期。建议将该区域的机器人清洗频率从‘每周一次’临时调整为‘每三日一次’，预计可额外挽回月度电量损失约 450kWh。此外，3号逆变器的散热风险需在明日上午10点前完成滤网清理。”
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Signature */}
              <div className="pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                <div>报告编号：RPT-20260311-001</div>
                <div>生成时间：2026-03-11 16:30:45</div>
                <div className="flex items-center gap-1">
                  <Shield size={12} /> 系统加密认证
                </div>
              </div>
            </div>
          </Modal>
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
