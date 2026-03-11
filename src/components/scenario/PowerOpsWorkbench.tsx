import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Upload, 
  FileText, 
  BarChart3, 
  Search, 
  Zap, 
  Send, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Database,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  RefreshCcw,
  History,
  Download,
  Share2,
  Plus,
  Trash2,
  User,
  Clock,
  Loader2
} from 'lucide-react';
import { useGlobalStore } from '../../store/GlobalStore';
import { useCopilot } from '../../copilot/core/CopilotContext';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';
import { PowerOpsWorkbenchStep } from '../../types';

const STEPS: { id: PowerOpsWorkbenchStep; label: string; icon: React.ElementType }[] = [
  { id: 'COLLECTION', label: '信息采集', icon: Upload },
  { id: 'ANALYSIS', label: '数据分析', icon: BarChart3 },
  { id: 'DIAGNOSIS', label: '问题诊断', icon: Search },
  { id: 'PLANNING', label: '生成预案', icon: Zap },
  { id: 'DISPATCH', label: '任务派发', icon: Send },
  { id: 'TRACKING', label: '执行跟踪', icon: Activity },
  { id: 'ALERT', label: '风险预警', icon: AlertTriangle },
  { id: 'DECISION', label: '辅助决策', icon: CheckCircle2 },
  { id: 'REPORT', label: '复盘报告', icon: FileText },
  { id: 'STORAGE', label: '入库沉淀', icon: Database },
];

export const PowerOpsWorkbench: React.FC = () => {
  const { state, dispatch } = useGlobalStore();
  const { dispatch: copilotDispatch } = useCopilot();
  const currentStep = state.powerOpsWorkbenchStep || 'COLLECTION';
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<{ step: PowerOpsWorkbenchStep; time: string; version: string }[]>([
    { step: 'COLLECTION', time: '10:00', version: 'V1' }
  ]);

  const handleStepChange = (step: PowerOpsWorkbenchStep) => {
    dispatch({ type: 'SET_POWEROPS_WORKBENCH_STEP', payload: step });
    setHistory(prev => [{ step, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), version: `V${prev.length + 1}` }, ...prev]);
  };

  const nextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex < STEPS.length - 1) {
      handleStepChange(STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      handleStepChange(STEPS[currentIndex - 1].id);
    }
  };

  const simulateLoading = (callback: () => void, duration: number = 1500) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      callback();
    }, duration);
  };

  const addToLedger = (action: string, details: string) => {
    dispatch({
      type: 'ADD_POWEROPS_LEDGER_ENTRY',
      payload: {
        id: `ledger-${Date.now()}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        step: currentStep,
        action,
        details,
        executor: state.currentUserRole || 'OPERATOR'
      }
    });
  };

  // Render Step Content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'COLLECTION':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <Card className="p-6 border-dashed border-2 border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors cursor-pointer group">
                <Upload size={48} className="mb-4 group-hover:scale-110 transition-transform" />
                <span className="font-bold">上传巡检报告/图片</span>
                <span className="text-xs mt-2">支持 PDF, JPG, PNG (Max 20MB)</span>
              </Card>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FileText size={16} className="text-blue-500" />
                    BP/文档自动解析
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">解析进度</span>
                      <span className="text-blue-600 font-bold">100%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-full" />
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => {
                  dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { collection: { station: '区域B南侧阵列', type: '异常巡检', date: '2024-02-27' } } });
                  toast.success('已自动填充示例数据');
                }}>一键填充示例数据</Button>
              </div>
            </div>
            {state.powerOpsWorkbenchData?.collection && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="p-4 bg-blue-50 border-blue-100">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">解析结果预览</h4>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div><span className="text-blue-700/60">电站名称：</span><span className="text-blue-900 font-bold">{state.powerOpsWorkbenchData.collection.station}</span></div>
                    <div><span className="text-blue-700/60">采集类型：</span><span className="text-blue-900 font-bold">{state.powerOpsWorkbenchData.collection.type}</span></div>
                    <div><span className="text-blue-700/60">采集日期：</span><span className="text-blue-900 font-bold">{state.powerOpsWorkbenchData.collection.date}</span></div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        );
      case 'ANALYSIS':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">发电性能分析</h3>
              <Button onClick={() => simulateLoading(() => {
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { analysis: { pr: '82.4%', generation: '128.6 MWh', trend: 'up' } } });
                addToLedger('数据分析', '完成全站发电性能分析，PR值 82.4%');
              })} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <RefreshCcw className="mr-2" size={16} />}
                重新生成分析
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <Card className="p-4 bg-white shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">PR (性能比)</div>
                <div className="text-2xl font-black text-slate-900">{state.powerOpsWorkbenchData?.analysis?.pr || '--'}</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">↑ 0.6% 环比昨日</div>
              </Card>
              <Card className="p-4 bg-white shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">今日发电量</div>
                <div className="text-2xl font-black text-slate-900">{state.powerOpsWorkbenchData?.analysis?.generation || '--'}</div>
                <div className="text-[10px] text-emerald-500 font-bold mt-1">↑ 2.3% 环比昨日</div>
              </Card>
              <Card className="p-4 bg-white shadow-sm">
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">故障分布</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <span className="text-xs text-slate-600">严重: 1</span>
                  <div className="h-2 w-2 rounded-full bg-amber-500" />
                  <span className="text-xs text-slate-600">一般: 3</span>
                </div>
              </Card>
            </div>
            <div className="h-48 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 italic text-sm">
              [ 发电量趋势图占位 ]
            </div>
          </div>
        );
      case 'DIAGNOSIS':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">问题诊断与溯源</h3>
              <Button onClick={() => simulateLoading(() => {
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { diagnosis: [
                  { cause: '区域B南侧阵列污染', confidence: '98%', impact: '高' },
                  { cause: '逆变器#03通讯异常', confidence: '85%', impact: '中' },
                  { cause: '支架阴影遮挡', confidence: '62%', impact: '低' }
                ] } });
                addToLedger('问题诊断', '识别到区域B南侧阵列污染风险，置信度 98%');
              }, 800)} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Search className="mr-2" size={16} />}
                启动智能诊断
              </Button>
            </div>
            <div className="space-y-4">
              {state.powerOpsWorkbenchData?.diagnosis?.map((d: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className={`p-4 flex items-center justify-between ${i === 0 ? 'border-blue-200 bg-blue-50/30' : ''}`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{d.cause}</div>
                        <div className="text-[10px] text-slate-500">疑似原因 Top {i+1}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">置信度</div>
                        <div className="text-sm font-black text-blue-600">{d.confidence}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-slate-400 uppercase font-bold">影响程度</div>
                        <div className={`text-sm font-black ${d.impact === '高' ? 'text-red-500' : d.impact === '中' ? 'text-amber-500' : 'text-slate-500'}`}>{d.impact}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'PLANNING':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">运维预案生成</h3>
              <Button onClick={() => simulateLoading(() => {
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { plans: [
                  { id: 'A', name: '机器人清洗', cost: '低', recovery: '+1.1%', risk: '中', recommended: false },
                  { id: 'B', name: '无人机巡检+定点清洗', cost: '中', recovery: '+1.1%', risk: '低', recommended: true },
                  { id: 'C', name: '人工深度检修', cost: '高', recovery: '+1.2%', risk: '极低', recommended: false }
                ] } });
                addToLedger('生成预案', '生成 3 套处置预案，推荐方案 B');
              })} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <Zap className="mr-2" size={16} />}
                生成预案对比
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-6">
              {state.powerOpsWorkbenchData?.plans?.map((p: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                  <Card className={`p-6 h-full flex flex-col relative ${p.recommended ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
                    {p.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full shadow-lg">
                        AI 推荐
                      </div>
                    )}
                    <div className="text-center mb-6">
                      <div className="text-xs font-bold text-slate-400 mb-1">方案 {p.id}</div>
                      <div className="text-base font-black text-slate-900">{p.name}</div>
                    </div>
                    <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">成本投入</span>
                        <span className="text-xs font-bold text-slate-900">{p.cost}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">预计恢复收益</span>
                        <span className="text-xs font-bold text-emerald-600">{p.recovery}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">误判风险</span>
                        <span className={`text-xs font-bold ${p.risk === '低' ? 'text-emerald-500' : 'text-amber-500'}`}>{p.risk}</span>
                      </div>
                    </div>
                    <Button variant={p.recommended ? 'primary' : 'outline'} className="mt-6 w-full" onClick={() => {
                      dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { selectedPlan: p } });
                      toast.success(`已选择方案 ${p.id}: ${p.name}`);
                    }}>选择此方案</Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        );
      case 'DISPATCH':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">任务拆解与派发</h3>
              <Button onClick={() => {
                const tasks = [
                  { id: 'T1', name: '无人机巡检-区域B', assignee: '班组-Alpha', priority: 'P0', status: 'pending' },
                  { id: 'T2', name: '清洗机器人02部署', assignee: '自动调度系统', priority: 'P0', status: 'pending' }
                ];
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { tasks } });
                addToLedger('任务派发', '拆解并派发 2 项运维任务');
                toast.success('任务已成功派发');
              }}>
                <Plus className="mr-2" size={16} />
                确认并派发任务
              </Button>
            </div>
            <div className="space-y-4">
              {state.powerOpsWorkbenchData?.tasks?.map((t: any, i: number) => (
                <Card key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{t.name}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-bold">{t.priority}</span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><User size={10} /> {t.assignee}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></Button>
                    <Button variant="outline" size="sm">修改</Button>
                  </div>
                </Card>
              ))}
              {!state.powerOpsWorkbenchData?.tasks && (
                <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  暂无任务，请先生成预案并确认
                </div>
              )}
            </div>
          </div>
        );
      case 'TRACKING':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">执行实时跟踪</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { tracking: { progress: 65, logs: ['10:30 无人机起飞', '10:35 到达区域B', '10:40 开始红外扫描'] } } });
                  addToLedger('执行跟踪', '更新执行进度至 65%');
                }}>模拟回传</Button>
              </div>
            </div>
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-8 space-y-6">
                <Card className="p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-sm font-bold text-slate-900">总体进度</h4>
                    <span className="text-blue-600 font-black">{state.powerOpsWorkbenchData?.tracking?.progress || 0}%</span>
                  </div>
                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden mb-8">
                    <motion.div 
                      className="h-full bg-blue-600" 
                      initial={{ width: 0 }} 
                      animate={{ width: `${state.powerOpsWorkbenchData?.tracking?.progress || 0}%` }} 
                    />
                  </div>
                  <div className="aspect-video bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/drone/800/450')] bg-cover opacity-50" />
                    <div className="relative z-10 flex flex-col items-center text-white">
                      <Activity className="animate-pulse mb-2" size={32} />
                      <span className="text-xs font-bold tracking-widest uppercase">Live Drone Feed - Region B</span>
                    </div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="px-2 py-1 bg-red-600 text-white text-[8px] font-bold rounded uppercase">Rec</div>
                      <div className="px-2 py-1 bg-black/50 text-white text-[8px] font-bold rounded">4K 60FPS</div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="col-span-4">
                <Card className="p-4 h-full">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <History size={16} className="text-slate-400" />
                    执行日志
                  </h4>
                  <div className="space-y-4">
                    {state.powerOpsWorkbenchData?.tracking?.logs?.map((log: string, i: number) => (
                      <div key={i} className="flex gap-3 text-[10px]">
                        <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                        <span className="text-slate-600">{log}</span>
                      </div>
                    ))}
                    {!state.powerOpsWorkbenchData?.tracking?.logs && (
                      <div className="text-xs text-slate-400 italic">等待数据回传...</div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case 'ALERT':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">风险预警监控</h3>
              <Button variant="outline" onClick={() => {
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { alerts: [
                  { type: '阈值触发', name: '区域B南侧污染指数 > 1.2', status: 'active', time: '10:45' },
                  { type: '规则触发', name: '清洗周期延迟 > 72h', status: 'active', time: '10:45' }
                ] } });
                addToLedger('风险预警', '触发 2 项环境与运维相关预警');
              }}>模拟预警触发</Button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {state.powerOpsWorkbenchData?.alerts?.map((a: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="p-6 border-red-100 bg-red-50/30">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertTriangle size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-red-600 px-2 py-1 bg-red-100 rounded-full">进行中</span>
                    </div>
                    <div className="text-xs font-bold text-red-800/60 uppercase mb-1">{a.type}</div>
                    <div className="text-base font-black text-red-900 mb-4">{a.name}</div>
                    <div className="flex items-center justify-between text-[10px] text-red-700/50">
                      <span>触发时间: {a.time}</span>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-100">查看详情</Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {!state.powerOpsWorkbenchData?.alerts && (
                <div className="col-span-2 h-48 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                  <span className="text-sm">当前无活跃风险预警</span>
                </div>
              )}
            </div>
          </div>
        );
      case 'DECISION':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">辅助决策支持</h3>
              <Button onClick={() => simulateLoading(() => {
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { decision: { impact: '+1.1%', suggestion: '建议将区域B清洗频率调整为 1次/周', roi: '15.4%' } } });
                addToLedger('辅助决策', '生成收益评估报告，建议调整清洗频率');
              })} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                生成决策建议
              </Button>
            </div>
            {state.powerOpsWorkbenchData?.decision && (
              <div className="grid grid-cols-12 gap-6">
                <div className="col-span-7">
                  <Card className="p-8 bg-indigo-900 text-white h-full flex flex-col justify-center">
                    <div className="text-xs font-bold text-indigo-300 uppercase mb-4 tracking-widest">收益恢复评估</div>
                    <div className="text-6xl font-black mb-6">{state.powerOpsWorkbenchData.decision.impact}</div>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      通过本次精准运维干预，预计挽回年度发电收益损失约 <span className="text-white font-bold">¥245,000</span>。
                      投资回报率 (ROI) 达 <span className="text-white font-bold">{state.powerOpsWorkbenchData.decision.roi}</span>。
                    </p>
                  </Card>
                </div>
                <div className="col-span-5">
                  <Card className="p-6 h-full flex flex-col">
                    <h4 className="text-sm font-bold text-slate-900 mb-6">策略优化建议</h4>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex-1">
                      <p className="text-xs text-slate-600 leading-relaxed italic">
                        “{state.powerOpsWorkbenchData.decision.suggestion}”
                      </p>
                    </div>
                    <Button className="mt-6 w-full">采纳并更新规则库</Button>
                  </Card>
                </div>
              </div>
            )}
          </div>
        );
      case 'REPORT':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">运维复盘报告</h3>
              <Button onClick={() => simulateLoading(() => {
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { report: { id: 'REP-20240227-01', name: '区域B异常处置复盘报告', date: '2024-02-27' } } });
                addToLedger('复盘报告', '生成运维复盘报告 REP-20240227-01');
              })} disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileText className="mr-2" size={16} />}
                一键生成报告
              </Button>
            </div>
            {state.powerOpsWorkbenchData?.report && (
              <Card className="p-8 flex items-center justify-between bg-white shadow-lg border-slate-200">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-20 bg-slate-50 border border-slate-200 rounded flex flex-col items-center justify-center text-slate-400 relative overflow-hidden">
                    <FileText size={32} />
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500" />
                  </div>
                  <div>
                    <div className="text-base font-black text-slate-900">{state.powerOpsWorkbenchData.report.name}</div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                      <span>编号: {state.powerOpsWorkbenchData.report.id}</span>
                      <span>日期: {state.powerOpsWorkbenchData.report.date}</span>
                      <span>大小: 1.2 MB</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="gap-2"><Download size={14} /> 下载</Button>
                  <Button variant="outline" size="sm" className="gap-2"><Share2 size={14} /> 分享</Button>
                  <Button size="sm" onClick={() => toast.success('正在打开报告预览...')}>在线预览</Button>
                </div>
              </Card>
            )}
          </div>
        );
      case 'STORAGE':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">知识入库沉淀</h3>
              <Button onClick={() => {
                addToLedger('入库沉淀', '将本次处置案例沉淀至电力运维知识库');
                toast.success('已成功入库沉淀至电力运维知识引擎');
                dispatch({ type: 'UPDATE_POWEROPS_WORKBENCH_DATA', payload: { storage: { status: 'stored', target: '电力运维库-案例集', id: 'KB-PO-2024-001' } } });
              }}>
                <Database className="mr-2" size={16} />
                确认并入库
              </Button>
            </div>
            {state.powerOpsWorkbenchData?.storage && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Card className="p-12 flex flex-col items-center justify-center text-center bg-emerald-50 border-emerald-100">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                    <CheckCircle2 size={48} />
                  </div>
                  <h4 className="text-xl font-black text-emerald-900 mb-2">入库成功</h4>
                  <p className="text-sm text-emerald-700 mb-8 max-w-md">
                    本次“区域B南侧阵列污染”处置案例已成功转化为结构化知识，沉淀至 <span className="font-bold">【{state.powerOpsWorkbenchData.storage.target}】</span>。
                  </p>
                  <div className="flex gap-4">
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-100">查看库内条目</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">完成闭环</Button>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Update Copilot on step change
  useEffect(() => {
    const stepLabel = STEPS.find(s => s.id === currentStep)?.label;
    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `workbench-step-${currentStep}-${Date.now()}`,
        role: 'assistant',
        content: `已进入【${stepLabel}】阶段。${getStepGuidance(currentStep)}`,
        timestamp: Date.now(),
        type: 'text',
        actions: [
          { label: '解释当前风险', event: 'E_EXPLAIN_RISK' },
          { label: '生成预案对比', event: 'E_GENERATE_PLAN_COMP' },
          { label: '把这一步写进台账', event: 'E_WRITE_LEDGER' }
        ]
      }
    });
  }, [currentStep]);

  const getStepGuidance = (step: PowerOpsWorkbenchStep) => {
    switch (step) {
      case 'COLLECTION': return '请上传巡检报告或点击“一键填充”开始数据采集。系统将自动解析关键指标。';
      case 'ANALYSIS': return '正在分析发电性能。关注 PR 值与发电量趋势，系统已识别出潜在的性能下滑。';
      case 'DIAGNOSIS': return '基于 AI 模型，我们已对异常进行了根因溯源。请确认 Top 1 疑似原因。';
      case 'PLANNING': return '已为您生成 3 套处置方案。建议优先考虑方案 B，其风险收益比最优。';
      case 'DISPATCH': return '方案已选定，正在进行任务拆解。请指派相关班组或启动自动调度机器人。';
      case 'TRACKING': return '任务执行中。您可以在此查看实时回传画面与执行日志，确保流程合规。';
      case 'ALERT': return '监控中... 当前触发了 2 项预警，请密切关注环境参数变化。';
      case 'DECISION': return '执行完成。系统已评估本次干预的收益恢复情况，并给出了长期的运维建议。';
      case 'REPORT': return '正在汇总全流程数据。点击“一键生成”即可获取完整的复盘报告。';
      case 'STORAGE': return '流程闭环的最后一步。将本次经验入库，可提升系统未来的诊断准确率。';
      default: return '';
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* A. Top Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">当前电站</span>
            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <span className="text-sm font-black text-slate-900">区域B光伏电站</span>
              <ChevronDown size={14} />
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase">时间范围</span>
            <div className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors">
              <span className="text-sm font-black text-slate-900">2024-02-27 (今日)</span>
              <ChevronDown size={14} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-600 rounded-full border border-amber-100">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold">异常处理中</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100">
            <span className="text-[10px] font-bold uppercase">V1.2.4</span>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        {/* B. Left Navigation */}
        <div className="col-span-3 flex flex-col gap-4">
          <Card className="p-4 flex-1 flex flex-col">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">业务闭环流程</h4>
            <div className="flex-1 space-y-1 overflow-y-auto pr-1">
              {STEPS.map((s, i) => {
                const isActive = currentStep === s.id;
                const isCompleted = STEPS.findIndex(step => step.id === currentStep) > i;
                return (
                  <div 
                    key={s.id}
                    onClick={() => handleStepChange(s.id)}
                    className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                      isCompleted ? 'bg-emerald-50 text-emerald-600' : 'hover:bg-slate-50 text-slate-500'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                      isActive ? 'bg-white/20' : isCompleted ? 'bg-emerald-100' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      {isCompleted ? <CheckCircle2 size={16} /> : <s.icon size={16} />}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <span className="text-xs font-bold">{s.label}</span>
                      <span className={`text-[8px] uppercase tracking-tighter ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>Step {i + 1}</span>
                    </div>
                    {isActive && <ChevronRight size={14} className="text-white/50" />}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                <History size={12} /> 历史追溯
              </h4>
              <div className="space-y-3">
                {history.slice(0, 3).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-[10px]">
                    <span className="text-slate-500">{h.time} - {STEPS.find(s => s.id === h.step)?.label}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded font-bold">{h.version}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* C. Main Workspace */}
        <div className="col-span-9 flex flex-col gap-6">
          <Card className="flex-1 p-8 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {React.createElement(STEPS.find(s => s.id === currentStep)?.icon || Upload, { size: 24 })}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{STEPS.find(s => s.id === currentStep)?.label}</h2>
                  <p className="text-sm text-slate-400 mt-1">请按照指引完成本阶段操作，所有动作将自动记入闭环台账。</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={prevStep} disabled={STEPS.findIndex(s => s.id === currentStep) === 0}>
                  <ChevronLeft className="mr-1" size={16} /> 上一步
                </Button>
                <Button size="sm" onClick={nextStep} disabled={STEPS.findIndex(s => s.id === currentStep) === STEPS.length - 1}>
                  下一步 <ChevronRight className="ml-1" size={16} />
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>
          </Card>

          {/* Bottom Ledger Preview */}
          <Card className="p-4 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Database size={14} className="text-slate-400" />
                闭环台账实时留痕
              </h4>
              <Button variant="ghost" size="sm" className="text-[10px] h-6">查看完整台账</Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {state.powerOpsClosedLoopLedger?.slice(0, 5).map((entry: any, i: number) => (
                <div key={i} className="shrink-0 w-48 p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                  <div className="flex justify-between text-[8px] mb-1">
                    <span className="text-slate-400">{entry.time}</span>
                    <span className="text-blue-600 font-bold">{STEPS.find(s => s.id === entry.step)?.label}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-900 truncate">{entry.action}</div>
                  <div className="text-[8px] text-slate-500 truncate mt-0.5">{entry.details}</div>
                </div>
              ))}
              {(!state.powerOpsClosedLoopLedger || state.powerOpsClosedLoopLedger.length === 0) && (
                <div className="text-[10px] text-slate-400 italic">暂无操作记录...</div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
