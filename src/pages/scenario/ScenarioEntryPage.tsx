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
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { 
  Briefcase, 
  Sprout, 
  Plane, 
  Zap, 
  Shield, 
  ClipboardList, 
  LayoutDashboard,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Activity,
  AlertCircle,
  Search,
  Bot,
  BrainCircuit,
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
  Database as DatabaseIcon,
  Ticket,
  FileText as FileTextIcon,
  PieChart,
  Calendar,
  Share2,
  Printer, 
  FileText,
  Mic,
  MapPin,
  ShieldAlert,
  Radio,
  Cpu,
  Network,
  Video,
  Battery,
  ArrowUpRight,
  Target,
  Layers,
  Info,
  Maximize2,
  Volume2
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

import { MapContainer } from '../../components/scenario/MapContainer';

const SCENARIO_CONFIG: Record<string, { title: string; icon: React.ElementType; color: string; description: string }> = {
  powerops: { title: '电力能源', icon: Zap, color: 'text-yellow-600', description: '电网负荷监控与调度' },
  lowaltitudeops: { title: '低空智航', icon: Plane, color: 'text-sky-600', description: '低空空域管理与航线规划' },
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
  // ... (existing code)
};

const LOW_ALTITUDE_EVENTS = [
  { id: 1, title: '工业园区火情预警', level: 'CRITICAL', time: '10:45:22', area: '工业园区 B-02', status: '处理中' },
  { id: 2, title: 'CBD 区域异常飞行', level: 'WARNING', time: '11:02:15', area: 'CBD 核心区', status: '待核实' },
  { id: 3, title: 'A区临时空域管制通知', level: 'INFO', time: '11:15:00', area: 'A区全域', status: '已发布' },
  { id: 4, title: '重大项目夜间异常活动', level: 'WARNING', time: '11:20:45', area: '重点工程区', status: '监控中' },
];

const LowAltitudeSituationOverview = () => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const [isDispatchWorkbenchOpen, setIsDispatchWorkbenchOpen] = React.useState(false);
  const { dispatch: copilotDispatch } = useCopilot();

  // Mock data for charts
  const eventTrendData = [
    { time: '00:00', fire: 0, abnormal: 1, notice: 0 },
    { time: '04:00', fire: 0, abnormal: 0, notice: 1 },
    { time: '08:00', fire: 1, abnormal: 2, notice: 0 },
    { time: '12:00', fire: 2, abnormal: 4, notice: 1 },
    { time: '16:00', fire: 1, abnormal: 3, notice: 2 },
    { time: '20:00', fire: 0, abnormal: 1, notice: 0 },
  ];

  const taskTypeData = [
    { name: '巡检', value: 45, color: '#3b82f6' },
    { name: '应急', value: 25, color: '#ef4444' },
    { name: '安防', value: 20, color: '#10b981' },
    { name: '物流', value: 10, color: '#f59e0b' },
  ];

  const dailySortiesData = [
    { time: '06:00', count: 5 },
    { time: '09:00', count: 18 },
    { time: '12:00', count: 32 },
    { time: '15:00', count: 24 },
    { time: '18:00', count: 12 },
    { time: '21:00', count: 4 },
  ];

  const regionalTaskData = [
    { name: '工业园', count: 12 },
    { name: 'CBD', count: 8 },
    { name: '住宅区', count: 5 },
    { name: '港口', count: 7 },
  ];

  const efficiencyData = [
    { subject: '响应速度', A: 120, full: 150 },
    { subject: '覆盖范围', A: 98, full: 150 },
    { subject: '任务成功率', A: 140, full: 150 },
    { subject: '设备可用性', A: 130, full: 150 },
    { subject: '成本效益', A: 110, full: 150 },
  ];

  const handleAISuggestionClick = () => {
    setIsDispatchWorkbenchOpen(true);
    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `ai-dispatch-${Date.now()}`,
        role: 'assistant',
        content: '已为您打开 AI 调度工作台。正在根据A区空域管制通知重新规划航线...',
        timestamp: Date.now(),
        type: 'text'
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 0）系统名称标签卡片 */}
      <Card className="h-[68px] border border-gray-200 shadow-sm bg-white flex items-center justify-between px-6 overflow-hidden relative">
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
            <Cpu size={20} className="text-blue-600" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-base font-bold tracking-tight text-gray-900 leading-tight">
              AOP Autonomous Operations Platform
            </h1>
            <p className="text-xs font-medium text-gray-500">
              城市低空自主运营平台
            </p>
          </div>
        </div>

        <div className="flex items-center gap-8 relative z-10">
          <div className="text-right">
            <div className="text-sm font-mono font-bold tracking-tight text-gray-900">
              {currentTime.toLocaleTimeString('zh-CN', { hour12: false })}
            </div>
            <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
              {currentTime.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-')}
            </div>
          </div>

          <div className="h-8 w-px bg-gray-100" />

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-600 tracking-wide uppercase">System Online</span>
          </div>
        </div>
      </Card>

      {/* 1）顶部：运营指标区 */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: '机巢数量', value: '5', sub: '全域覆盖', icon: DatabaseIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: '在线无人机', value: '9', sub: '含单兵无人机4架', icon: Plane, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: '今日任务', value: '32', sub: '今日已执行18次', icon: ClipboardList, color: 'text-sky-600', bg: 'bg-sky-50' },
          { label: '事件告警', value: '4', sub: '高优先级2条', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <Card key={i} className="p-5 border-none shadow-sm flex items-center gap-4 bg-white">
            <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500">{stat.label}</div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">{stat.value}</span>
                <span className="text-xs text-gray-400 font-medium">{stat.sub}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 2）中部：低空态势大屏 (地图为主) */}
      <div className="relative h-[700px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-slate-50">
        <MapContainer>
          {/* 这里可以叠加后续图层 */}
        </MapContainer>

        {/* 左侧叠加卡片：事件态势 (毛玻璃效果) */}

        {/* 左侧叠加卡片：事件态势 (毛玻璃效果) */}
        <div className="absolute top-6 left-6 w-80 bg-white/40 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 z-10 flex flex-col gap-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <ShieldAlert size={18} className="text-red-500" />
              低空安全态势
            </h3>
            
            {/* 1）事件统计 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: '告警总数', value: '24', color: 'text-gray-900' },
                { label: '高风险事件', value: '2', color: 'text-red-600' },
                { label: '处理中事件', value: '5', color: 'text-blue-600' },
                { label: '已解决事件', value: '17', color: 'text-emerald-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white/50 p-2 rounded-xl border border-white/20">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</div>
                  <div className={`text-lg font-black ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* 2）事件趋势 */}
            <div className="mb-5">
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">过去24小时低空事件趋势</div>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={eventTrendData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
                    />
                    <Line type="monotone" dataKey="fire" stroke="#ef4444" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="abnormal" stroke="#f59e0b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="notice" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500"><div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> 火情</div>
                <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500"><div className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> 异常飞行</div>
                <div className="flex items-center gap-1 text-[8px] font-bold text-gray-500"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> 空域通知</div>
              </div>
            </div>

            {/* 3）实时事件流 */}
            <div className="space-y-2 overflow-y-auto max-h-[180px] pr-1">
              {LOW_ALTITUDE_EVENTS.map((event) => (
                <div key={event.id} className="bg-white/40 p-2 rounded-lg border border-white/20 hover:bg-white/60 transition-colors cursor-pointer">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                      event.level === 'CRITICAL' ? 'bg-red-100 text-red-600' : 
                      event.level === 'WARNING' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                    }`}>{event.level}</span>
                    <span className="text-[8px] text-gray-400 font-mono">{event.time}</span>
                  </div>
                  <div className="text-[10px] font-bold text-gray-800 truncate">{event.title}</div>
                  <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                    <span>{event.area}</span>
                    <span className="text-blue-600">{event.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 右侧叠加卡片：运行态势 (毛玻璃效果) */}
        <div className="absolute top-6 right-6 w-80 bg-white/40 backdrop-blur-md rounded-2xl p-5 shadow-xl border border-white/40 z-10 flex flex-col gap-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-blue-600" />
              低空运行态势
            </h3>

            {/* 1）飞行运行状态 */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: '在线机巢', value: '4', total: '5', color: 'text-blue-600' },
                { label: '执行任务', value: '3', total: '8', color: 'text-emerald-600' },
                { label: '待执行任务', value: '5', total: '', color: 'text-gray-600' },
                { label: '空域限制区', value: '2', total: '', color: 'text-amber-600' },
              ].map((item, i) => (
                <div key={i} className="bg-white/50 p-2 rounded-xl border border-white/20">
                  <div className="text-[10px] font-bold text-gray-400 uppercase">{item.label}</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-lg font-black ${item.color}`}>{item.value}</span>
                    {item.total && <span className="text-[10px] text-gray-400">/ {item.total}</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* 2）任务类型分布 (饼图) */}
            <div className="mb-5">
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">任务类型分布</div>
              <div className="h-32 w-full flex items-center">
                <div className="w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={taskTypeData}
                        innerRadius={30}
                        outerRadius={45}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-1/2 space-y-1">
                  {taskTypeData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-gray-500">{item.name}</span>
                      </div>
                      <span className="font-bold text-gray-700">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3）空域状态 */}
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase mb-3">空域状态</div>
              <div className="space-y-3">
                {[
                  { label: '可飞区域', status: '正常', color: 'bg-emerald-500', text: 'text-emerald-600' },
                  { label: '限制区域', status: '受控', color: 'bg-amber-500', text: 'text-amber-600' },
                  { label: '禁飞区域', status: '封闭', color: 'bg-red-500', text: 'text-red-600' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs font-bold text-gray-700">{item.label}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 ${item.text}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 地图控制按钮 */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 rounded-xl bg-white/80 backdrop-blur-md border-none shadow-md hover:bg-white"><Maximize2 size={18} /></Button>
          <Button size="sm" variant="secondary" className="w-10 h-10 p-0 rounded-xl bg-white/80 backdrop-blur-md border-none shadow-md hover:bg-white"><Layers size={18} /></Button>
        </div>

        {/* 地图图例 */}
        <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/40 z-10 flex flex-col gap-2">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">地图图例</div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
            <div className="w-3 h-3 rounded bg-blue-600 border border-white shadow-sm" /> 自动化机巢
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white shadow-sm" /> 在线无人机
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40 border-dashed" /> 禁飞管制区
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600">
            <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40 border-dashed" /> 限制飞行区
          </div>
        </div>

        {/* AI 调度触发提示 (量仔助手提示示例 - 右下角) */}
        <div className="absolute bottom-6 right-20 z-10">
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-white/80 backdrop-blur-md border border-blue-200 text-blue-700 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 cursor-pointer hover:bg-white transition-all group"
            onClick={handleAISuggestionClick}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-200">
              <Bot size={18} className="group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex flex-col">
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">量仔助手建议</div>
              <div className="text-sm font-bold">
                检测到A区临时空域管制通知...
              </div>
            </div>
            <ChevronRight size={18} className="text-blue-300 group-hover:translate-x-1 transition-transform" />
          </motion.div>
        </div>
      </div>

      {/* 3）底部运营监控区 */}
      <div className="grid grid-cols-12 gap-6">
        {/* 左侧：当前任务监控 */}
        <div className="col-span-5">
          <Card className="p-6 border-none shadow-sm bg-white h-full">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Video size={18} className="text-blue-600" />
              当前任务监控
            </h3>
            <div className="flex gap-6">
              <div className="w-56 aspect-video bg-slate-900 rounded-xl overflow-hidden relative shrink-0 shadow-inner">
                {/* Drone Aerial Perspective Video Placeholder */}
                <img src="https://picsum.photos/seed/drone_view_city/400/225" className="w-full h-full object-cover opacity-80" alt="Drone Aerial View" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white border border-white/20">
                    <Activity size={20} className="animate-pulse" />
                  </div>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600/80 backdrop-blur-md text-white text-[8px] font-bold rounded flex items-center gap-1">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" /> LIVE
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[8px] font-mono rounded">
                  CAM-01
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <h4 className="text-sm font-bold text-gray-900">任务：工业园火情侦察</h4>
                  </div>
                  <p className="text-xs text-gray-400">无人机：UAV-03 | 预计结束：12分钟</p>
                </div>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">飞行高度</div>
                    <div className="text-sm font-bold text-gray-900">120m</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">剩余电量</div>
                    <div className="text-sm font-bold text-emerald-600">82%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">链路状态</div>
                    <div className="text-sm font-bold text-emerald-600">正常</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-gray-400 uppercase font-bold">任务进度</div>
                    <div className="text-sm font-bold text-blue-600">65%</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 右侧：低空运营分析 */}
        <div className="col-span-7">
          <Card className="p-6 border-none shadow-sm bg-white h-full">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp size={18} className="text-blue-600" />
              低空运营分析
            </h3>
            <div className="grid grid-cols-3 gap-6 h-48">
              {/* 今日飞行架次 (折线图) */}
              <div className="flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">今日飞行架次</div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dailySortiesData}>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2, fill: '#3b82f6' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 各区域任务数量 (柱状图) */}
              <div className="flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">各区域任务数量</div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regionalTaskData}>
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <RechartsTooltip />
                      <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 运营效率 (雷达图) */}
              <div className="flex flex-col">
                <div className="text-[10px] font-bold text-gray-400 uppercase mb-2">运营效率</div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={efficiencyData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 8, fill: '#94a3b8' }} />
                      <Radar name="效率" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* AI Dispatch Workbench Modal */}
      <Modal 
        isOpen={isDispatchWorkbenchOpen} 
        onClose={() => setIsDispatchWorkbenchOpen(false)}
        title="AI 智能调度工作台"
      >
        <div className="p-6 space-y-6">
          <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
            <Bot size={24} className="text-blue-600 shrink-0" />
            <div>
              <h4 className="font-bold text-blue-900 mb-1">航线重规划建议</h4>
              <p className="text-sm text-blue-700">检测到 A区 (113.2, 23.1) 存在临时空域管制，原定巡检航线已失效。建议采用备选航线 B，避开管制区域。</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h5 className="text-sm font-bold text-gray-900">原定方案</h5>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-2">
                <div className="flex justify-between"><span>航线长度</span><span className="font-bold">12.5km</span></div>
                <div className="flex justify-between"><span>预计耗时</span><span className="font-bold">15min</span></div>
                <div className="flex justify-between"><span>风险等级</span><span className="text-red-500 font-bold">高 (管制冲突)</span></div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-sm font-bold text-gray-900">AI 推荐方案</h5>
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-xs space-y-2">
                <div className="flex justify-between"><span>航线长度</span><span className="font-bold">14.2km</span></div>
                <div className="flex justify-between"><span>预计耗时</span><span className="font-bold">18min</span></div>
                <div className="flex justify-between"><span>风险等级</span><span className="text-emerald-500 font-bold">低 (合规)</span></div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl aspect-video relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/20 text-sm font-mono tracking-widest uppercase">Simulation View</span>
            </div>
            <img src="https://picsum.photos/seed/simulation/600/340" className="w-full h-full object-cover opacity-60" alt="Simulation" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
              <div className="flex gap-2">
                <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white">UAV-03</div>
                <div className="px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[10px] text-white">ALT: 120m</div>
              </div>
              <div className="px-2 py-1 bg-emerald-500 rounded text-[10px] text-white font-bold">READY</div>
            </div>
          </div>

          <div className="flex gap-4">
            <Button variant="secondary" className="flex-1" onClick={() => setIsDispatchWorkbenchOpen(false)}>取消</Button>
            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 border-none" onClick={() => {
              toast.success('AI 调度指令已下发，航线已更新');
              setIsDispatchWorkbenchOpen(false);
            }}>确认执行调度</Button>
          </div>
        </div>
      </Modal>
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
    if (id === 'lowaltitudeops') {
      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: `low-altitude-welcome-${Date.now()}`,
          role: 'assistant',
          content: '量仔在线，已接入城市低空网络，可通过语音快速发起任务调度。',
          timestamp: Date.now(),
          type: 'text'
        }
      });
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
      ) : id === 'lowaltitudeops' ? (
        <div className="space-y-6">
          {/* Sub-module Content */}
          <div className="min-h-[600px]">
            {state.lowAltitudeSubModule === 'SITUATION_OVERVIEW' ? (
              <LowAltitudeSituationOverview />
            ) : state.lowAltitudeSubModule === 'TASK_CENTER' ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">任务中心</h3>
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <ClipboardList size={48} className="mb-4 opacity-20" />
                  <p>任务中心模块内容正在建设中...</p>
                </div>
              </div>
            ) : state.lowAltitudeSubModule === 'EVENT_CENTER' ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">事件中心</h3>
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <AlertCircle size={48} className="mb-4 opacity-20" />
                  <p>事件中心模块内容正在建设中...</p>
                </div>
              </div>
            ) : state.lowAltitudeSubModule === 'ALGORITHM_CENTER' ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">算法中心</h3>
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <BrainCircuit size={48} className="mb-4 opacity-20" />
                  <p>算法中心模块内容正在建设中...</p>
                </div>
              </div>
            ) : state.lowAltitudeSubModule === 'OPERATIONS_CENTER' ? (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">运营中心</h3>
                <div className="p-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p>运营中心模块内容正在建设中...</p>
                </div>
              </div>
            ) : null}
          </div>
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
