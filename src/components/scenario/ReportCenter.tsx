import React from 'react';
import { useGlobalStore } from '../../store/GlobalStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  CheckCircle2,
  MoreVertical,
  PieChart,
  BarChart2,
  TrendingUp,
  X,
  Zap,
  Activity,
  AlertTriangle,
  Bot,
  Edit2,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';
import { useCopilot } from '../../copilot/core/CopilotContext';

interface Report {
  id: string;
  name: string;
  type: '日报' | '周报' | '月报' | '运维报告' | '分析报告';
  generatedAt: string;
  size: string;
  status: 'Ready' | 'Generating';
  method: 'AI自动生成' | '人工生成';
  station?: string;
  summary?: string;
  metrics?: {
    generation?: string;
    health?: number;
  };
  risks?: string;
  aiAdvice?: string;
}

const mockReports: Report[] = [
  { 
    id: 'REP-001', 
    name: '2024年3月9日 运维日报', 
    type: '日报', 
    generatedAt: '2024-03-09 22:45', 
    size: '1.2MB', 
    status: 'Ready', 
    method: 'AI自动生成',
    station: 'XX光伏电站',
    summary: '今日电站运行平稳，发电量符合预期。',
    metrics: { generation: '128.6MWh', health: 92 },
    risks: 'A区组件污染率上升。',
    aiAdvice: '建议安排组件清洗。'
  },
  { id: 'REP-002', name: '2024年3月8日 运维日报', type: '日报', generatedAt: '2024-03-08 22:45', size: '1.1MB', status: 'Ready', method: 'AI自动生成' },
  { id: 'REP-003', name: '2024年3月7日 运维日报', type: '日报', generatedAt: '2024-03-07 22:45', size: '1.3MB', status: 'Ready', method: 'AI自动生成' },
  { id: 'REP-004', name: '2024年3月第1周 运维周报', type: '周报', generatedAt: '2024-03-04 08:30', size: '4.5MB', status: 'Ready', method: 'AI自动生成' },
  { id: 'REP-005', name: '2024年2月 全站运行月报', type: '月报', generatedAt: '2024-03-01 09:00', size: '12.8MB', status: 'Ready', method: 'AI自动生成' },
  { id: 'REP-006', name: '逆变器异常分析报告', type: '分析报告', generatedAt: '2024-03-09 14:20', size: '3.1MB', status: 'Ready', method: 'AI自动生成' },
];

export const ReportCenter: React.FC = () => {
  const { state, dispatch: globalDispatch } = useGlobalStore();
  const { system_state, dynamic_report_store, run } = state;
  const { dispatch } = useCopilot();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState('全部');
  const [previewReport, setPreviewReport] = React.useState<Report | null>(null);
  const [activeActionMenu, setActiveActionMenu] = React.useState<string | null>(null);

  // Cleanup expired reports on mount
  React.useEffect(() => {
    globalDispatch({ type: 'CLEANUP_EXPIRED_REPORTS' });
  }, []);

  // Automatic report generation logic
  React.useEffect(() => {
    if (!system_state || !run) return;

    const isClosed = 
      system_state.acceptance_status === 'passed' || 
      system_state.current_stage === 'knowledge' || 
      system_state.knowledge_status === 'stored';

    if (isClosed) {
      const reportId = `REP-${system_state.run_id}`;
      
      // Check if report already exists in dynamic store to avoid duplicates
      const exists = dynamic_report_store.some(r => r.run_id === system_state.run_id);
      
      if (!exists) {
        const now = Date.now();
        const stationName = run.station?.name || 'XX光伏电站';
        
        globalDispatch({
          type: 'UPSERT_DYNAMIC_REPORT',
          payload: {
            report_id: reportId,
            run_id: system_state.run_id,
            report_title: `${stationName} 运维复盘报告`,
            report_type: '运维报告',
            source: 'AI自动生成',
            station: stationName,
            created_at: now,
            expires_at: now + 24 * 60 * 60 * 1000,
            file_size: '2.4MB',
            status: 'Ready',
            summary: `本报告针对 ${stationName} 的运维任务进行复盘。诊断结论为：${run.evidenceChain.diagnosis.finalConclusion || run.evidenceChain.diagnosis.aiConclusion || '组件积灰导致PR下降'}。`,
            preview_data: {
              diagnosis_conclusion: run.evidenceChain.diagnosis.finalConclusion || run.evidenceChain.diagnosis.aiConclusion || '组件积灰导致PR下降',
              task_result: system_state.task_status === 'completed' ? '已完成组件清洗与PR复测' : '任务执行中',
              risk_result: system_state.risk_status === 'warning' ? '执行中出现设备异常，已完成缓解处理' : '未检测到显著运行风险',
              acceptance_result: system_state.acceptance_status === 'passed' ? `验收通过，PR恢复至${run.acceptance.metrics?.pr || '82.1%'}` : '验收进行中',
              knowledge_result: system_state.knowledge_status === 'stored' ? '本次案例已沉淀为运维经验知识' : '知识沉淀处理中'
            }
          }
        });
      }
    }
  }, [system_state?.acceptance_status, system_state?.current_stage, system_state?.knowledge_status, system_state?.run_id, run, dynamic_report_store]);

  const allReports = React.useMemo(() => {
    const now = Date.now();
    const activeDynamic = (dynamic_report_store || []).filter(r => r.expires_at > now);
    
    const dynamicAsReports: Report[] = activeDynamic.map(r => ({
      id: r.report_id,
      name: r.report_title,
      type: r.report_type as any,
      generatedAt: new Date(r.created_at).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 16),
      size: r.file_size,
      status: r.status as any,
      method: r.source as any,
      station: r.station,
      summary: r.summary,
      metrics: {
        generation: r.preview_data.acceptance_result,
        health: 95
      },
      risks: r.preview_data.risk_result,
      aiAdvice: r.preview_data.knowledge_result,
      // Custom fields for preview
      previewData: r.preview_data
    }));

    // Combine with mock reports, avoiding duplicates (by ID)
    const combined = [...dynamicAsReports];
    mockReports.forEach(mr => {
      if (!combined.find(cr => cr.id === mr.id)) {
        combined.push(mr);
      }
    });

    return combined;
  }, [dynamic_report_store]);

  const filteredReports = allReports.filter(report => {
    const matchesSearch = report.name.includes(searchTerm);
    const matchesCategory = activeCategory === '全部' || report.type === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const kpis = React.useMemo(() => {
    const total = allReports.length;
    const latest = allReports[0]; // Assuming sorted by creation time
    
    // Calculate storage: mock reports are around 23MB total, dynamic are 2.4MB each
    const mockSize = 23.3; // MB
    const dynamicSize = (dynamic_report_store || []).length * 2.4;
    const totalSizeGB = ((mockSize + dynamicSize) / 1024).toFixed(2);
    const usagePercent = Math.min(Math.round(((mockSize + dynamicSize) / 3072) * 100), 100); // 3GB total limit

    return {
      total,
      latest,
      totalSizeGB,
      usagePercent
    };
  }, [allReports, dynamic_report_store]);

  const handlePreview = (report: Report) => {
    setPreviewReport(report);
  };

  const handleDownload = (report: Report) => {
    const fileName = report.id.startsWith('REP-RUN') 
      ? `report_${report.id.replace('REP-', '')}_operation_review.pdf`
      : (report.name.toLowerCase().includes('日报') ? 'report_20240309_daily.pdf' : 'report_download.pdf');
    
    toast.success(`${fileName}\n下载完成`, {
      duration: 3000,
      icon: '📥'
    });
  };

  React.useEffect(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `report-summary-${Date.now()}`,
        role: 'assistant',
        content: `当前共有${kpis.total}份报告。
        
最近生成：
${kpis.latest?.name || '2024年3月9日运维日报'}。

如果需要，我可以为您生成
设备运行分析报告。`,
        timestamp: Date.now(),
        type: 'text'
      }
    });
  }, [kpis.total, kpis.latest?.id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <PieChart size={24} />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black border border-emerald-100">
                <TrendingUp size={12} />
                <span>+12%</span>
              </div>
            </div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">本月生成报告</div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-slate-900 tracking-tight">{kpis.total}</span>
              <span className="text-sm font-bold text-slate-400">份</span>
            </div>
            <div className="mt-4 text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500" />
              数据已同步至云端
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -right-8 -bottom-8 text-slate-50 opacity-10 group-hover:text-indigo-50 group-hover:opacity-20 transition-all">
            <PieChart size={160} />
          </div>
        </Card>
        
        <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4">报告存储空间</div>
          <div className="text-3xl font-black text-slate-900 mb-2">{kpis.totalSizeGB} <span className="text-sm font-bold text-slate-500">GB</span></div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${kpis.usagePercent}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400">
            <span>已使用 {kpis.usagePercent}%</span>
            <span>剩余 {(3 - parseFloat(kpis.totalSizeGB)).toFixed(2)} GB</span>
          </div>
        </Card>

        <Card className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">最近一次生成</div>
              <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black border border-emerald-100 animate-pulse">
                LATEST
              </div>
            </div>
            <div className="text-lg font-black text-slate-900 leading-tight mb-3 group-hover:text-emerald-600 transition-colors">
              {kpis.latest?.name || '2024年3月9日 运维日报'}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-600 font-bold">
                <CheckCircle2 size={14} />
                <span>生成成功</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400">
                {kpis.latest?.id.startsWith('REP-RUN') ? '刚刚' : '10分钟前'}
              </span>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -right-4 -bottom-4 text-emerald-50 opacity-20 group-hover:scale-110 transition-transform">
            <CheckCircle2 size={100} />
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">报告中心</h3>
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold">
                <FileText size={14} />
                <span>共 {mockReports.length} 份报告</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索报告名称..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                />
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['全部', '日报', '周报', '月报', '运维报告', '分析报告'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="group p-5 border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all bg-white flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  report.type === '日报' ? 'bg-blue-50 text-blue-600' :
                  report.type === '周报' ? 'bg-indigo-50 text-indigo-600' :
                  report.type === '月报' ? 'bg-emerald-50 text-emerald-600' :
                  'bg-amber-50 text-amber-600'
                }`}>
                  {report.type === '月报' ? <BarChart2 size={20} /> : <FileText size={20} />}
                </div>
                <div className="flex flex-col items-end relative">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{report.type}</span>
                  <button 
                    onClick={() => setActiveActionMenu(activeActionMenu === report.id ? null : report.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {activeActionMenu === report.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenu(null)} />
                      <div className="absolute right-0 top-12 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                        <button 
                          onClick={() => { toast.success('进入编辑模式'); setActiveActionMenu(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={14} /> 修改报告
                        </button>
                        <button 
                          onClick={() => { toast.error('报告已删除'); setActiveActionMenu(null); }}
                          className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                        >
                          <Trash2 size={14} /> 删除报告
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex-1">
                <h4 className="text-sm font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">{report.name}</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Calendar size={12} />
                    <span>生成时间: {report.generatedAt}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} />
                    <span>文件大小: {report.size}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-500">
                    <Zap size={10} />
                    <span>{report.method}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 flex items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="flex-1 text-xs h-8 gap-1.5"
                  onClick={() => handlePreview(report)}
                >
                  <Eye size={14} /> 预览
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1 text-xs h-8 gap-1.5"
                  onClick={() => handleDownload(report)}
                >
                  <Download size={14} /> 下载
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-slate-50 flex items-center justify-center">
          <Button variant="outline" size="sm" className="text-slate-400 border-slate-200">
            查看更多历史报告
          </Button>
        </div>
      </Card>

      {/* Report Preview Modal */}
      <AnimatePresence>
        {previewReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">报告预览</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{previewReport.name}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setPreviewReport(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-auto max-h-[70vh] space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">生成时间</div>
                    <div className="text-sm font-bold text-slate-900">{previewReport.generatedAt}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">所属电站</div>
                    <div className="text-sm font-bold text-slate-900">{previewReport.station || '全站'}</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">报告摘要</div>
                  <div className="p-4 bg-slate-50 rounded-2xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                    {previewReport.summary || '暂无详细摘要信息。'}
                  </div>
                </div>

                {/* Dynamic Preview Data for AI Reports */}
                {(previewReport as any).previewData && (
                  <div className="space-y-4">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">详细复盘数据</div>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">诊断结论</span>
                        <span className="text-xs font-bold text-slate-900">{(previewReport as any).previewData.diagnosis_conclusion}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">任务执行</span>
                        <span className="text-xs font-bold text-slate-900">{(previewReport as any).previewData.task_result}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">风险处理</span>
                        <span className="text-xs font-bold text-slate-900">{(previewReport as any).previewData.risk_result}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">验收结果</span>
                        <span className="text-xs font-bold text-slate-900">{(previewReport as any).previewData.acceptance_result}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs text-slate-500">知识沉淀</span>
                        <span className="text-xs font-bold text-slate-900">{(previewReport as any).previewData.knowledge_result}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">关键运行指标</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                      <div className="text-[10px] font-bold text-blue-400 uppercase mb-1">今日发电量</div>
                      <div className="text-xl font-black text-blue-600">{previewReport.metrics?.generation || '128.6MWh'}</div>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase mb-1">设备健康指数</div>
                      <div className="text-xl font-black text-emerald-600">{previewReport.metrics?.health || 92}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                      <AlertTriangle size={12} /> 风险提示
                    </div>
                    <div className="p-4 bg-red-50/50 rounded-2xl text-sm text-red-700 font-bold border border-red-100">
                      {previewReport.risks || '未检测到显著运行风险。'}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Bot size={12} /> AI 建议
                    </div>
                    <div className="p-4 bg-indigo-50/50 rounded-2xl text-sm text-indigo-700 font-bold border border-indigo-100">
                      {previewReport.aiAdvice || '建议维持当前运维策略。'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setPreviewReport(null)}>关闭</Button>
                <Button 
                  className="px-8 gap-2"
                  onClick={() => {
                    handleDownload(previewReport);
                    setPreviewReport(null);
                  }}
                >
                  <Download size={16} /> 下载 PDF 报告
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
