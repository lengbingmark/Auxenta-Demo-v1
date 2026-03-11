import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area
} from 'recharts';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Network, 
  Search, 
  Info, 
  Zap, 
  Shield, 
  Tags, 
  ChevronRight, 
  Database, 
  Activity,
  Filter,
  CheckCircle,
  Play,
  Save,
  BrainCircuit,
  History,
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import * as d3 from 'd3';
import { useGlobalStore } from '../../store/GlobalStore';
import { useCopilot } from '../../copilot/core/CopilotContext';
import { motion, AnimatePresence } from 'motion/react';
import { X, ExternalLink, FileText, Link as LinkIcon } from 'lucide-react';

// --- Components ---

const KnowledgeLedger = () => {
  const { state } = useGlobalStore();

  return (
    <div className="space-y-4 h-full overflow-y-auto pr-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <History size={16} className="text-blue-500" />
          知识资产台账
        </h3>
        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
          {state.knowledgeLedger.length} 条记录
        </span>
      </div>
      
      {state.knowledgeLedger.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Database size={32} className="text-gray-300 mb-3" />
          <p className="text-xs text-gray-400">暂无知识沉淀记录</p>
        </div>
      ) : (
        <>
          {state.currentUserRole === 'ADMIN' && (
            <Card className="p-4 bg-slate-900 border-slate-800 mb-4">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">全量知识资产</div>
              <div className="text-2xl font-black text-white tracking-tight">12,480 <span className="text-xs font-normal text-slate-500">条</span></div>
              <div className="mt-2 h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[75%]" />
              </div>
              <div className="mt-1 text-[8px] text-slate-600">较上月增长 12.5%</div>
            </Card>
          )}
          {state.currentUserRole === 'MANAGER' && (
            <Card className="p-4 bg-indigo-50 border-indigo-100 mb-4">
              <div className="text-[10px] text-indigo-400 uppercase font-bold mb-2">部门知识结构分布</div>
              <div className="space-y-2">
                {[
                  { label: '产业链', val: 65, color: 'bg-pink-500' },
                  { label: '政策库', val: 45, color: 'bg-indigo-500' },
                  { label: '风险项', val: 30, color: 'bg-amber-500' },
                ].map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className="text-indigo-900">{s.label}</span>
                      <span className="text-indigo-600">{s.val}%</span>
                    </div>
                    <div className="h-1 bg-indigo-100 rounded-full overflow-hidden">
                      <div className={`h-full ${s.color}`} style={{ width: `${s.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
          {state.knowledgeLedger.map((entry, i) => (
          <Card key={i} className="p-4 border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-2">
              <div className="text-xs font-bold text-gray-900">{entry.title}</div>
              <div className="text-[10px] text-gray-400">{new Date(entry.timestamp).toLocaleString()}</div>
            </div>
            <div className="text-[11px] text-gray-500 mb-3 leading-relaxed">
              {entry.desc}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {entry.stats.map((s: any, j: number) => (
                <span key={j} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-medium">
                  {s.label}: {s.value}
                </span>
              ))}
            </div>
          </Card>
        ))}
        </>
      )}
    </div>
  );
};

const CollaborationAnalysis = () => {
  const data = [
    { name: 'Mon', collab: 75, conflict: 5 },
    { name: 'Tue', collab: 78, conflict: 4 },
    { name: 'Wed', collab: 82, conflict: 8 },
    { name: 'Thu', collab: 80, conflict: 3 },
    { name: 'Fri', collab: 85, conflict: 2 },
    { name: 'Sat', collab: 82, conflict: 1 },
    { name: 'Sun', collab: 88, conflict: 0 },
  ];

  const conflicts = [
    { id: 1, time: '2024-03-20 14:30', rule: '现金流风险', user: '0.4', ai: '0.8', status: '已记录' },
    { id: 2, time: '2024-03-19 10:15', rule: '行业准入', user: '0.9', ai: '0.7', status: '已复盘' },
    { id: 3, time: '2024-03-18 16:45', rule: '高新补贴', user: '0.2', ai: '0.5', status: '待处理' },
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">人机协同趋势</h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-500 rounded-full" /> 一致性指数</div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-red-500 rounded-full" /> 冲突频次</div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="collab" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} />
                <Line type="monotone" dataKey="conflict" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 bg-blue-600 text-white shadow-xl shadow-blue-200">
            <div className="text-xs font-bold opacity-80 uppercase mb-2">AI 采纳率</div>
            <div className="text-4xl font-black mb-1">94.2%</div>
            <div className="text-[10px] opacity-70">较上周提升 2.4%</div>
            <div className="mt-6 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white w-[94%]" />
            </div>
          </Card>
          <Card className="p-6 bg-slate-900 text-white">
            <div className="text-xs font-bold text-slate-400 uppercase mb-4">决策冲突趋势</div>
            <div className="h-20 flex items-end gap-1">
              {[30, 45, 25, 60, 35, 20, 15].map((h, i) => (
                <div key={i} className="flex-1 bg-red-500/40 rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">最近冲突记录</h3>
            <div className="space-y-3">
              {conflicts.map(c => (
                <div key={c.id} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-900">{c.rule}</span>
                      <span className="text-[10px] text-slate-400">{c.time}</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      c.status === '已复盘' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                    }`}>{c.status}</span>
                  </div>
                  <div className="flex items-center gap-6 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">AI 建议:</span>
                      <span className="font-mono font-bold text-blue-600">{c.ai}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">用户设定:</span>
                      <span className="font-mono font-bold text-amber-600">{c.user}</span>
                    </div>
                    <button className="ml-auto opacity-0 group-hover:opacity-100 text-blue-600 font-bold transition-opacity">展开详情</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div className="col-span-4 space-y-6">
          <Card className="p-6 bg-amber-50 border-amber-100">
            <h3 className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
              <BrainCircuit size={18} />
              组织知识缺口提示
            </h3>
            <p className="text-xs text-amber-800 leading-relaxed mb-4">
              当前团队在<span className="font-bold">“新兴产业准入”</span>维度的决策偏离度较高，建议组织一次针对性的专家知识对齐会议。
            </p>
            <Button className="w-full bg-amber-600 hover:bg-amber-700 text-xs py-2">发起知识对齐</Button>
          </Card>
          <Button variant="outline" className="w-full py-3 flex items-center justify-center gap-2 text-sm font-bold border-blue-200 text-blue-600">
            <FileText size={18} />
            导出诊断报告
          </Button>
        </div>
      </div>
    </div>
  );
};

const LearningAnalysis = () => {
  const { dispatch: copilotDispatch } = useCopilot();
  const accuracyData = [
    { name: 'W1', acc: 88 },
    { name: 'W2', acc: 90 },
    { name: 'W3', acc: 89 },
    { name: 'W4', acc: 92 },
    { name: 'W5', acc: 94 },
  ];

  const growthData = [
    { name: '产业链', value: 85 },
    { name: '政策库', value: 70 },
    { name: '风险项', value: 90 },
    { name: '企业画像', value: 65 },
    { name: '财务模型', value: 80 },
  ];

  const handleCorrection = (item: any) => {
    const scripts: Record<string, string> = {
      '高新技术企业': '【纠偏建议 - 高新技术企业】\n系统检测到该企业的核心专利中有 3 项已进入“失效”状态，但标签库仍将其识别为高新企业。建议：\n1. 立即核查专利局最新公示信息；\n2. 在“规则与权重”中调高“专利时效性”的扣分权重；\n3. 手动将该标签置信度降至 0.6 以下。',
      'B轮融资': '【纠偏建议 - B轮融资】\n系统识别到该企业于上月完成了由“红杉中国”领投的新一轮融资，实际已进入 C 轮阶段。建议：\n1. 更新企业画像中的“融资轮次”字段；\n2. 触发关联的“高成长性规则”重新计算评分；\n3. 修正图谱中与该企业关联的投资机构关系。',
      '供应链风险': '【纠偏建议 - 供应链风险】\n当前系统对该企业的“地域性风险因子”权重设定仅为 0.15，未能充分反映近期国际局势对半导体原材料供应的影响。建议：\n1. 将“地域风险”权重提升至 0.45；\n2. 引入“替代供应商”作为风险对冲标签；\n3. 重新运行路径测试，查看风险等级变化。'
    };

    copilotDispatch({
      type: 'SET_NOTIFICATION',
      payload: {
        title: `纠偏建议: ${item.tag}`,
        content: scripts[item.tag] || '正在分析该标签的误判原因，请稍候...',
        type: 'warning',
        isLarge: true
      }
    });

    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `correction-${Date.now()}`,
        role: 'assistant',
        content: scripts[item.tag] || '正在分析该标签的误判原因，请稍候...',
        timestamp: Date.now(),
        type: 'text'
      }
    });

    // Also open the drawer to show the full dialogue
    // copilotDispatch({ type: 'TOGGLE_DRAWER', payload: true });
  };

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      <div className="grid grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">标签准确率趋势</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyData}>
                <defs>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} domain={[80, 100]} />
                <Tooltip />
                <Area type="monotone" dataKey="acc" stroke="#10b981" fillOpacity={1} fill="url(#colorAcc)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">知识维度成长曲线</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} width={80} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">高频误判提示列表</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { tag: '高新技术企业', errorRate: '12%', reason: '专利时效性识别偏差' },
            { tag: 'B轮融资', errorRate: '8%', reason: '多轮次融资信息混淆' },
            { tag: '供应链风险', errorRate: '15%', reason: '地域性风险因子权重过低' },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-red-50/50 border border-red-100 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-red-900">{item.tag}</span>
                <span className="text-xs font-black text-red-600">{item.errorRate}</span>
              </div>
              <div className="text-[10px] text-red-700 opacity-70">主因: {item.reason}</div>
              <Button 
                variant="outline" 
                className="w-full mt-3 text-[10px] py-1 border-red-200 text-red-600 hover:bg-red-100"
                onClick={() => handleCorrection(item)}
              >
                查看纠偏建议
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

const GrowthAnalysis = () => {
  const radarData = [
    { subject: '行业理解', A: 120, fullMark: 150 },
    { subject: '规则设计', A: 98, fullMark: 150 },
    { subject: '风险识别', A: 86, fullMark: 150 },
    { subject: '数据分析', A: 99, fullMark: 150 },
    { subject: '决策一致', A: 85, fullMark: 150 },
    { subject: '系统协同', A: 110, fullMark: 150 },
  ];

  return (
    <div className="space-y-6 h-full overflow-y-auto pr-2">
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-7 p-8 flex flex-col items-center min-h-[500px]">
          <div className="w-full flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">能力雷达图</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="w-3 h-3 bg-purple-500 rounded-full" /> 当前能力分布
            </div>
          </div>
          <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#e2e8f0" strokeWidth={1} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#475569', fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar 
                  name="能力值" 
                  dataKey="A" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fill="#8b5cf6" 
                  fillOpacity={0.5} 
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="col-span-12 lg:col-span-5 space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-bold text-gray-900 mb-4">AI 陪跑记录统计</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
              {[
                { label: '共同决策', value: '1,240', icon: Zap, color: 'blue' },
                { label: '纠偏次数', value: '85', icon: Shield, color: 'amber' },
                { label: '知识贡献', value: '42', icon: BrainCircuit, color: 'emerald' },
              ].map((s, i) => (
                <div key={i} className={`p-4 bg-${s.color}-50 rounded-2xl border border-${s.color}-100 flex items-center gap-4`}>
                  <div className={`w-12 h-12 rounded-xl bg-${s.color}-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-${s.color}-100`}>
                    <s.icon size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-0.5">{s.label}</div>
                    <div className="text-2xl font-black text-gray-900">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-8 bg-slate-900 text-white relative overflow-hidden min-h-[220px] flex flex-col justify-center">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp size={160} />
            </div>
            <div className="relative z-10">
              <div className="text-xs font-bold text-slate-400 uppercase mb-3 tracking-widest">当前成长等级</div>
              <div className="text-4xl font-black mb-6 flex items-center gap-4">
                高级知识架构师
                <span className="text-sm bg-blue-600 px-3 py-1 rounded-full border border-blue-400/30 shadow-lg">Lvl 42</span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <span>经验值 (XP)</span>
                  <span>8,450 / 10,000</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '84.5%' }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_12px_rgba(59,130,246,0.5)]" 
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-6 leading-relaxed">
                再完成 <span className="text-blue-400 font-bold">15</span> 次高难度决策冲突复盘，即可晋升为“资深知识架构师”。
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DetailDrawer = ({ entityId, onClose }: { entityId: string | null; onClose: () => void }) => {
  const { state } = useGlobalStore();
  const entity = state.knowledgeEngine.graphData.nodes.find(n => n.id === entityId);
  const { dispatch } = useCopilot();

  if (!entityId || !entity) return null;

  return (
    <motion.div 
      key={entityId}
      initial={{ x: '100%' }} 
      animate={{ x: 0 }} 
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl border-l border-gray-100 z-50 flex flex-col"
    >
      <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-slate-50/50">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Info size={16} className="text-blue-500" />
          知识节点详情
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
          <X size={18} className="text-gray-400" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="pb-4 border-b border-slate-100">
          <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">{entity.type}</div>
          <h2 className="text-xl font-bold text-gray-900">{entity.name}</h2>
        </div>

        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
            <FileText size={12} /> 定义与描述
          </h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {entity.desc || `这是关于“${entity.name}”的系统定义。该节点在${state.knowledgeEngine.activeIndustry === 'invest' ? '招商' : '通用'}知识体系中扮演关键角色。`}
          </p>
        </section>

        {entity.rules && entity.rules.length > 0 && (
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Shield size={12} /> 关联规则
            </h4>
            <div className="space-y-2">
              {entity.rules.map((r: string, i: number) => (
                <div key={i} className="p-2 bg-purple-50 border border-purple-100 rounded-lg text-xs text-purple-700 flex items-center gap-2">
                  <Zap size={10} /> {r}
                </div>
              ))}
            </div>
          </section>
        )}

        {entity.tags && entity.tags.length > 0 && (
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <Tags size={12} /> 关联标签
            </h4>
            <div className="flex flex-wrap gap-2">
              {entity.tags.map((t: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-100">
                  {t}
                </span>
              ))}
            </div>
          </section>
        )}

        {entity.cases && entity.cases.length > 0 && (
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <History size={12} /> 关联案例
            </h4>
            <div className="space-y-2">
              {entity.cases.map((c: string, i: number) => (
                <div key={i} className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-700 flex items-center gap-2">
                  <CheckCircle size={10} /> {c}
                </div>
              ))}
            </div>
          </section>
        )}

        {entity.group === 'risk' && (
          <section className="p-4 bg-red-50 border border-red-100 rounded-2xl">
            <h4 className="text-xs font-bold text-red-600 uppercase mb-2 flex items-center gap-2">
              <Zap size={14} /> 规则联动逻辑
            </h4>
            <p className="text-[11px] text-red-800 leading-relaxed">
              该风险因子由“{entity.rules?.[0] || '系统内置规则'}”触发。当企业画像中的财务指标或行业动态偏离预设阈值时，系统会自动激活此节点，并联动机审流程进入“人工核实”阶段。
            </p>
          </section>
        )}

        {entity.evidence && (
          <section>
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">核心证据</h4>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <div className="flex items-start gap-2">
                <FileText size={14} className="text-amber-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-amber-800 italic">“{entity.evidence}”</p>
              </div>
            </div>
          </section>
        )}

        <section>
          <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">关联关系图谱</h4>
          <div className="space-y-2">
            {state.knowledgeEngine.graphData.links
              .filter(l => {
                const sId = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
                const tId = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
                return sId === entityId || tId === entityId;
              })
              .map((l, i) => {
                const sId = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
                const tId = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
                const otherId = sId === entityId ? tId : sId;
                const otherNode = state.knowledgeEngine.graphData.nodes.find(n => n.id === otherId);
                return (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <LinkIcon size={12} className="text-gray-400" />
                      <span className="text-xs text-gray-400">{l.label}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-700">{otherNode?.name || otherId}</span>
                  </div>
                );
              })}
          </div>
        </section>
      </div>

      <div className="p-4 border-t border-gray-50 bg-slate-50/30">
        <Button className="w-full flex items-center justify-center gap-2 py-2.5">
          <ExternalLink size={14} />
          查看完整溯源
        </Button>
      </div>
    </motion.div>
  );
};

const KnowledgeFramework = () => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const models = [
    { title: '实体 (Entity)', desc: '定义行业核心对象，如企业、政策、产业链节点', icon: Database, color: 'blue' },
    { title: '关系 (Relation)', desc: '定义对象间的逻辑关联，如属于、适配、触发', icon: Network, color: 'indigo' },
    { title: '证据 (Evidence)', desc: '为结论提供事实支撑，如专利数据、财报原文', icon: FileText, color: 'amber' },
    { title: '标签 (Tag)', desc: '多维度的画像特征，如高新技术、风险等级', icon: Tags, color: 'emerald' },
    { title: '规则 (Rule)', desc: '基于逻辑的判定标准，如准入阈值、权重系数', icon: Shield, color: 'purple' },
    { title: '决策 (Decision)', desc: '标准化的业务推进路径，如初筛、尽调、签约', icon: Zap, color: 'orange' },
    { title: '结果 (Outcome)', desc: '最终的业务产出，如建议签约、建议放弃', icon: CheckCircle, color: 'pink' },
  ];

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      {/* Left: Cards */}
      <div className="col-span-4 space-y-3 overflow-y-auto pr-2">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-1">通用知识模型框架</h3>
          <p className="text-xs text-gray-500">Auxenta 统一的行业知识方法论，确保跨行业知识的可迁移性与标准化。</p>
        </div>
        {models.map((m, i) => (
          <Card 
            key={i} 
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-4 cursor-pointer transition-all border-l-4 ${
              hoveredIdx === i ? `border-l-${m.color}-500 shadow-md bg-${m.color}-50/30` : 'border-l-transparent shadow-sm'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl transition-colors ${
                hoveredIdx === i ? `bg-${m.color}-600 text-white` : `bg-${m.color}-50 text-${m.color}-600`
              }`}>
                <m.icon size={20} />
              </div>
              <div>
                <h4 className={`font-bold text-sm transition-colors ${hoveredIdx === i ? `text-${m.color}-600` : 'text-gray-900'}`}>
                  {m.title}
                </h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{m.desc}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Right: Visualization */}
      <div className="col-span-8 bg-slate-50 rounded-2xl relative overflow-hidden border border-slate-200 shadow-inner flex flex-col">
        <div className="p-6 border-b border-slate-200 bg-white/50 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="text-blue-500" size={18} />
            <span className="text-sm font-bold text-slate-700">标准化知识生产流水线</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Methodology Pipeline</div>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="relative w-full max-w-3xl py-12">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2" />
            
            <div className="flex justify-between items-center relative z-10">
              {models.map((m, i) => (
                <div key={i} className="flex flex-col items-center group">
                  <motion.div 
                    animate={{ 
                      scale: hoveredIdx === i ? 1.2 : 1,
                      backgroundColor: hoveredIdx === i ? 'var(--tw-color-white)' : 'var(--tw-color-slate-50)'
                    }}
                    className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center transition-all ${
                      hoveredIdx === i ? `border-${m.color}-500 shadow-lg shadow-${m.color}-100` : 'border-slate-200'
                    } bg-white`}
                  >
                    <m.icon size={24} className={hoveredIdx === i ? `text-${m.color}-600` : 'text-slate-400'} />
                  </motion.div>
                  <div className={`mt-3 text-[10px] font-bold transition-colors ${hoveredIdx === i ? `text-${m.color}-600` : 'text-slate-400'}`}>
                    {m.title.split(' ')[0]}
                  </div>
                  
                  {/* Flow Arrow */}
                  {i < models.length - 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 right-0 w-full flex justify-center pointer-events-none" style={{ left: `${(i * 100 / (models.length - 1)) + (50 / (models.length - 1))}%` }}>
                      <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Detail Card for Hovered Item */}
            <AnimatePresence>
              {hoveredIdx !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 w-full max-w-md bg-white p-4 rounded-2xl border border-slate-200 shadow-xl flex items-start gap-4"
                >
                  <div className={`p-3 rounded-xl bg-${models[hoveredIdx].color}-50 text-${models[hoveredIdx].color}-600`}>
                    {React.createElement(models[hoveredIdx].icon, { size: 24 })}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{models[hoveredIdx].title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {models[hoveredIdx].desc}。在 Auxenta 引擎中，该维度负责将原始数据转化为可被算法理解的结构化资产。
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {!hoveredIdx && (
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-xs text-slate-400 italic mt-12"
            >
              将鼠标悬停在左侧卡片或上方节点，查看各维度的详细定义与作用。
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

const IndustryMapping = () => {
  const { state, dispatch } = useGlobalStore();
  const industries = [
    { id: 'power', name: '电力运维', status: 'ready' },
    { id: 'low', name: '低空智管', status: 'building' },
    { id: 'rural', name: '商业运营', status: 'building' },
    { id: 'police', name: '智慧警务', status: 'building' },
    { id: 'gov', name: '政务督办', status: 'building' },
  ];

  const knowledgeBases = [
    { id: 'public', name: '底座公共库' },
    { id: 'industry', name: '行业库' },
    { id: 'scenario', name: '场景库' },
    { id: 'project', name: '项目库' },
  ];

  return (
    <div className="flex flex-col h-full space-y-6 relative overflow-hidden">
      <div className="flex items-center gap-4 overflow-x-auto pb-2 shrink-0">
        {industries.map(ind => (
          <button
            key={ind.id}
            onClick={() => dispatch({ type: 'KE_SET_INDUSTRY', payload: ind.id })}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              state.knowledgeEngine.activeIndustry === ind.id 
                ? 'bg-blue-600 text-white shadow-lg' 
                : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300'
            }`}
          >
            {ind.name}
            {ind.status === 'building' && <span className="ml-2 text-[10px] opacity-60">(建设中)</span>}
          </button>
        ))}
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 min-h-0">
        <div className="col-span-9 bg-slate-900 rounded-2xl relative overflow-hidden border border-slate-800 shadow-2xl">
          <AnimatePresence mode="wait">
            {state.knowledgeEngine.activeIndustry === 'invest' ? (
              <motion.div 
                key="invest"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <D3Graph industry="invest" />
              </motion.div>
            ) : (
              <motion.div 
                key="other"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center p-12"
              >
                <Card className="max-w-md w-full p-8 text-center bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BrainCircuit className="text-blue-400" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">行业知识结构建设中</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    系统正在通过 LLM 与行业专家知识库进行深度对齐，预计将于近期完成该行业的知识框架映射。
                  </p>
                  <div className="mt-8 flex justify-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {state.selectedEntityId && (
              <DetailDrawer 
                entityId={state.selectedEntityId} 
                onClose={() => dispatch({ type: 'SELECT_ENTITY', payload: null })} 
              />
            )}
          </AnimatePresence>
        </div>

        <div className="col-span-3 space-y-6 overflow-y-auto pr-2">
          <Card className="p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Filter size={16} className="text-blue-500" />
              知识库勾选
            </h3>
            <div className="space-y-3">
              {knowledgeBases.map((base) => (
                <label key={base.id} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={state.knowledgeEngine.selectedBases.includes(base.id)}
                    onChange={() => dispatch({ type: 'KE_TOGGLE_BASE', payload: base.id })}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                  />
                  <span className={`text-sm transition-colors ${
                    state.knowledgeEngine.selectedBases.includes(base.id) ? 'text-blue-600 font-medium' : 'text-gray-600 group-hover:text-blue-600'
                  }`}>
                    {base.name}
                  </span>
                </label>
              ))}
            </div>
          </Card>

          {state.knowledgeEngine.activeIndustry === 'invest' && (
            <Card className="p-4 bg-blue-50 border-blue-100">
              <h3 className="text-sm font-bold text-blue-900 mb-2">招商运营知识概览</h3>
              <ul className="text-xs text-blue-700 space-y-2">
                <li>• 包含 8 大产业链条</li>
                <li>• 240 个企业画像维度</li>
                <li>• 15 个核心风险评估模型</li>
              </ul>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

const RulesAndWeights = () => {
  const { state, dispatch } = useGlobalStore();
  const { dispatch: copilotDispatch } = useCopilot();
  const [testing, setTesting] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [pendingConflict, setPendingConflict] = useState<any>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [simulatedImpact, setSimulatedImpact] = useState({ conflict: 0, risk: 0, match: 0 });

  useEffect(() => {
    // Real-time simulation logic
    const cashWeight = state.knowledgeEngine.rules.find(r => r.id === 'r2')?.weight || 0.8;
    const growthWeight = state.knowledgeEngine.rules.find(r => r.id === 'r1')?.weight || 0.6;
    
    setSimulatedImpact({
      conflict: Math.round((1 - cashWeight) * 100),
      risk: Math.round(cashWeight * 95),
      match: Math.round(growthWeight * 90 + 10)
    });
  }, [state.knowledgeEngine.rules]);

  const runTest = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      const cashWeight = state.knowledgeEngine.rules.find(r => r.id === 'r2')?.weight || 0.8;
      const growthWeight = state.knowledgeEngine.rules.find(r => r.id === 'r1')?.weight || 0.6;
      
      // Dynamic score calculation
      const baseScore = 85;
      const riskPenalty = cashWeight * 30;
      const growthBonus = growthWeight * 20;
      const finalScore = Math.min(100, Math.max(0, Math.round(baseScore - riskPenalty + growthBonus)));
      
      const isHighRisk = finalScore < 75 || cashWeight > 0.8;
      
      dispatch({ 
        type: 'KE_SET_TEST_RESULT', 
        payload: {
          conclusion: finalScore < 70 ? '建议：风控否决 / 暂缓推进' : (finalScore < 85 ? '建议：加强尽调 / 风险对冲' : '建议：快速准入 / 优先支持'),
          risk: finalScore < 70 ? '高' : (finalScore < 85 ? '中' : '低'),
          score: finalScore,
          reason: finalScore < 70 
            ? `综合评分 ${finalScore}，现金流风险权重 (${cashWeight.toFixed(2)}) 触发红线预警。` 
            : `综合评分 ${finalScore}，项目整体风险可控，建议按既定路径推进。`,
          path: finalScore < 70 ? ['初筛', '风控介入', '否决'] : (finalScore < 85 ? ['初筛', '风险核实', '尽调'] : ['初筛', '尽调', '签约']),
          ruleChain: [
            { name: '企业画像匹配', result: '通过', desc: `适配度 ${(80 + growthWeight * 20).toFixed(0)}%` },
            { name: '财务风险扫描', result: cashWeight > 0.7 ? '预警' : '通过', desc: `现金流权重: ${cashWeight.toFixed(2)}` },
            { name: '政策合规性校验', result: '通过', desc: '符合高新补贴政策' }
          ]
        }
      });

      copilotDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          title: '路径测试完成',
          content: `项目评分 ${finalScore}。${finalScore < 75 ? '检测到潜在风险偏高，已自动调整建议路径。' : '项目匹配度良好，建议维持当前推进节奏。'}`,
          type: finalScore < 75 ? 'warning' : 'info'
        }
      });

      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          role: 'assistant',
          content: `路径测试完成。基于当前权重设置，项目综合评分为 ${finalScore}。${finalScore < 75 ? '检测到潜在风险偏高，已自动调整建议路径。' : '项目匹配度良好，建议维持当前推进节奏。'}`,
          timestamp: Date.now(),
          type: 'text'
        }
      });
    }, 1500);
  };

  const handleSave = () => {
    const cashRule = state.knowledgeEngine.rules.find(r => r.id === 'r2');
    const isHighRisk = state.knowledgeEngine.testResult?.risk === '高' || state.knowledgeEngine.testResult?.score < 75;
    
    // Conflict logic: Key rule weight lowered AND high risk
    if (cashRule && cashRule.weight < 0.6 && isHighRisk) {
      const conflict = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        scenario: '招商准入评估',
        ruleName: cashRule.name,
        aiWeight: 0.85,
        userWeight: cashRule.weight,
        riskLevel: 'high',
        remark: '系统判定当前企业现金流风险极高，建议维持高权重以触发预警，用户调低权重可能导致风险漏判。'
      };
      setPendingConflict(conflict);
      setShowConflictWarning(true);
      
      copilotDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          title: '决策冲突警告',
          content: '检测到您正在调低关键风险规则权重，可能导致高风险项目漏判。',
          type: 'warning'
        }
      });

      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          role: 'assistant',
          content: '⚠️ 警告：检测到决策冲突！您正在大幅调低关键风险规则的权重，这可能导致高风险项目被错误准入。建议您重新评估该设置。',
          timestamp: Date.now(),
          type: 'text'
        }
      });
      return;
    }

    saveAndLog();
  };

  const saveAndLog = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      
      copilotDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          title: '规则保存成功',
          content: '新的权重体系已同步至全底座推理引擎。',
          type: 'success'
        }
      });

      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          role: 'assistant',
          content: '规则已成功保存并应用。新的权重体系已同步至全底座推理引擎。',
          timestamp: Date.now(),
          type: 'text'
        }
      });
      
      setShowConflictWarning(false);
      setPendingConflict(null);
    }, 800);
  };

  const persistConflict = () => {
    if (pendingConflict) {
      dispatch({ type: 'KE_ADD_CONFLICT_LOG', payload: pendingConflict });
      dispatch({
        type: 'KE_ADD_LEDGER_ENTRY',
        payload: {
          title: '决策冲突沉淀回执',
          desc: `在“${pendingConflict.scenario}”中，用户对“${pendingConflict.ruleName}”执行了非标决策。`,
          timestamp: Date.now(),
          stats: [
            { label: '偏离度', value: (pendingConflict.aiWeight - pendingConflict.userWeight).toFixed(2) },
            { label: '风险等级', value: '红色' }
          ]
        }
      });

      copilotDispatch({
        type: 'SET_NOTIFICATION',
        payload: {
          title: '冲突已记录',
          content: '该偏离行为已存入知识资产台账，将作为未来规则修正的依据。',
          type: 'info'
        }
      });

      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: Date.now().toString(),
          role: 'assistant',
          content: '已记录本次决策冲突。该偏离行为已存入知识资产台账，将作为未来规则自动修正与人机协同复盘的重要参考依据。',
          timestamp: Date.now(),
          type: 'text'
        }
      });
    }
    saveAndLog();
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full relative">
      {showConflictWarning && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm rounded-2xl">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl max-w-md border border-red-100"
          >
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-6 mx-auto">
              <AlertTriangle size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">检测到决策冲突</h3>
            <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
              系统判定当前操作存在<span className="text-red-600 font-bold">高风险漏判</span>可能。您确定要坚持降低“{pendingConflict?.ruleName}”的权重吗？
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1 py-3" onClick={() => setShowConflictWarning(false)}>
                取消并还原
              </Button>
              <Button className="flex-1 py-3 bg-red-600 hover:bg-red-700" onClick={persistConflict}>
                坚持保存并记录
              </Button>
            </div>
          </motion.div>
        </div>
      )}
      <div className="col-span-3 space-y-4 overflow-y-auto pr-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">规则列表</h3>
        {state.knowledgeEngine.rules.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-900">{r.name}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                r.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'
              }`}>
                {r.enabled ? '已启用' : '已停用'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>权重系数</span>
                <span className="font-mono">{r.weight.toFixed(2)}</span>
              </div>
              <input 
                type="range" min="0" max="1" step="0.05" 
                value={r.weight} 
                onChange={(e) => dispatch({ type: 'KE_UPDATE_RULE_WEIGHT', payload: { id: r.id, weight: parseFloat(e.target.value) } })}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="text-[10px] text-gray-400 mt-3 italic">影响: {r.impact}</div>
          </Card>
        ))}
      </div>

      <div className="col-span-6 flex flex-col space-y-6">
        <Card className="p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Play size={20} className="text-blue-500" />
            路径测试面板
          </h3>
          <div className="space-y-4 flex-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">模拟企业画像</label>
              <select className="w-full p-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none">
                <option>高新技术企业 (研发密集型)</option>
                <option>专精特新“小巨人” (成长型)</option>
                <option>传统制造业 (资产密集型)</option>
              </select>
            </div>
            <Button 
              className="w-full py-3 text-base font-bold" 
              onClick={runTest}
              disabled={testing}
            >
              {testing ? (
                <div className="flex items-center gap-2">
                  <Activity size={18} className="animate-spin" />
                  正在基于当前权重进行推理...
                </div>
              ) : '运行路径测试'}
            </Button>

            {state.knowledgeEngine.testResult && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="mt-6 p-6 bg-white border-2 border-blue-100 rounded-2xl shadow-xl shadow-blue-50/50 overflow-y-auto max-h-[400px]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${state.knowledgeEngine.testResult.risk === '高' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                      {state.knowledgeEngine.testResult.risk === '高' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
                    </div>
                    <h4 className="text-base font-bold text-gray-900">推理结论卡片</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">综合匹配分</div>
                    <div className={`text-2xl font-black ${state.knowledgeEngine.testResult.score > 80 ? 'text-green-600' : 'text-amber-600'}`}>
                      {state.knowledgeEngine.testResult.score}
                    </div>
                  </div>
                </div>
                
                <div className="mb-6">
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase mb-2">
                    <span>置信度评分</span>
                    <span>{state.knowledgeEngine.testResult.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${state.knowledgeEngine.testResult.score}%` }}
                      className={`h-full ${state.knowledgeEngine.testResult.score > 80 ? 'bg-green-500' : 'bg-amber-500'}`}
                    />
                  </div>
                </div>

                <div className="text-2xl font-black text-slate-800 mb-6 leading-tight">
                  {state.knowledgeEngine.testResult.conclusion}
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      规则触发链
                    </div>
                    <div className="space-y-2">
                      {state.knowledgeEngine.testResult.ruleChain?.map((r: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
                          <div className={`w-2 h-2 rounded-full ${r.result === '预警' ? 'bg-red-500' : 'bg-green-500'}`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-700">{r.name}</span>
                              <span className={`text-[10px] font-bold ${r.result === '预警' ? 'text-red-600' : 'text-green-600'}`}>{r.result}</span>
                            </div>
                            <div className="text-[10px] text-slate-400">{r.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                      <div className="w-1 h-3 bg-blue-500 rounded-full" />
                      建议推进路径
                    </div>
                    <div className="flex items-center gap-2">
                      {state.knowledgeEngine.testResult.path.map((p: string, i: number) => (
                        <React.Fragment key={i}>
                          <div className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                            i === state.knowledgeEngine.testResult.path.length - 1 
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' 
                              : 'bg-white text-slate-600 border-slate-200'
                          }`}>
                            {p}
                          </div>
                          {i < state.knowledgeEngine.testResult.path.length - 1 && <ChevronRight size={14} className="text-slate-300" />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-bold text-slate-400 uppercase mb-2">推理逻辑溯源</div>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{state.knowledgeEngine.testResult.reason}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </Card>
        <div className="flex justify-end gap-3">
          <Button variant="outline" className="px-6">重置权重</Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`flex items-center gap-2 px-8 transition-all ${isSaving ? 'bg-green-600' : ''}`}
          >
            {isSaving ? <CheckCircle size={16} /> : <Save size={16} />}
            {isSaving ? '保存成功' : '保存并应用规则'}
          </Button>
        </div>
      </div>

      <div className="col-span-3 space-y-6">
        <Card className="p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">节点部署范围</h3>
          <div className="space-y-3">
            {['当前场景', '全底座', '本项目'].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg transition-colors group">
                <span className="text-sm text-gray-600 group-hover:text-blue-600">{item}</span>
                <div className="w-10 h-5 bg-blue-600 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
            <Activity size={14} className="text-blue-500" />
            影响模拟预览
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">决策冲突概率</span>
                <span className={`font-mono ${simulatedImpact.conflict > 50 ? 'text-red-500' : 'text-green-500'}`}>{simulatedImpact.conflict}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${simulatedImpact.conflict}%` }} className={`h-full ${simulatedImpact.conflict > 50 ? 'bg-red-500' : 'bg-green-500'}`} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">风险识别率</span>
                <span className="font-mono text-blue-500">{simulatedImpact.risk}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${simulatedImpact.risk}%` }} className="h-full bg-blue-500" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-slate-500">匹配率变化</span>
                <span className="font-mono text-emerald-500">{simulatedImpact.match}%</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ width: `${simulatedImpact.match}%` }} className="h-full bg-emerald-500" />
              </div>
            </div>
            <p className="text-[8px] text-slate-600 italic">
              * 模拟基于历史 10,000+ 笔真实决策数据计算得出。
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

const TagsAndLearning = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const { state, dispatch } = useGlobalStore();
  const [tagging, setTagging] = useState(false);
  const [tempTags, setTempTags] = useState<any[]>([]);

  const handleTag = () => {
    setTagging(true);
    setTimeout(() => {
      setTagging(false);
      setTempTags([
        { name: '高新技术', confidence: 0.98, evidence: '企业拥有24项发明专利' },
        { name: '研发密集', confidence: 0.94, evidence: '研发人员占比超过35%' },
        { name: '成长型', confidence: 0.88, evidence: '近三年营收复合增长率42%' },
      ]);
      window.dispatchEvent(new CustomEvent('copilot-input', { detail: '一键打标' }));
    }, 1200);
  };

  const addToGraph = (tag: any) => {
    dispatch({ type: 'KE_ADD_TAG', payload: { id: Date.now().toString(), name: tag.name, category: 'enterprise', confidence: tag.confidence, evidence: tag.evidence } });
    
    // Auto jump to mapping and highlight
    setActiveTab('mapping');
    dispatch({ type: 'HIGHLIGHT_NODE', payload: 'ent_vision_ai' }); // Mock highlighting a relevant node
    
    window.dispatchEvent(new CustomEvent('copilot-input', { 
      detail: `已将标签“${tag.name}”关联至图谱，并自动跳转至行业映射视图进行高亮展示。` 
    }));
  };

  const jumpToNode = (nodeId: string) => {
    setActiveTab('mapping');
    dispatch({ type: 'HIGHLIGHT_NODE', payload: nodeId });
    window.dispatchEvent(new CustomEvent('copilot-input', { 
      detail: `正在为您定位该标签关联的知识节点...` 
    }));
  };

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-4 space-y-6 overflow-y-auto pr-2">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">标签库统计</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { title: '行业标签', count: 125, color: 'blue' },
            { title: '企业标签', count: 450, color: 'green' },
            { title: '风险标签', count: 85, color: 'amber' },
            { title: '行为标签', count: 210, color: 'purple' },
            { title: '政策标签', count: 160, color: 'indigo' },
          ].map((t, i) => (
            <Card key={i} className="p-4">
              <div className={`w-8 h-8 rounded-lg bg-${t.color}-50 flex items-center justify-center mb-3`}>
                <Tags size={16} className={`text-${t.color}-600`} />
              </div>
              <div className="text-xs text-gray-500 mb-1">{t.title}</div>
              <div className="text-xl font-bold text-gray-900">{t.count}</div>
            </Card>
          ))}
        </div>
      </div>

      <div className="col-span-5 space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BrainCircuit size={20} className="text-blue-500" />
            智能打标演示
          </h3>
          <div className="space-y-4">
            <textarea 
              placeholder="输入一段招商企业描述文本，例如：该企业是一家专注于工业视觉AI的高新技术企业，近期完成了B轮融资，研发团队占比40%..." 
              className="w-full h-32 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 mb-2 resize-none"
            />
            <Button className="w-full py-3 font-bold" onClick={handleTag} disabled={tagging}>
              {tagging ? '正在深度学习识别中...' : '一键智能打标'}
            </Button>

            <AnimatePresence>
              {tempTags.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-4"
                >
                  <h4 className="text-xs font-bold text-slate-400 uppercase">识别结果 (含置信度与证据)</h4>
                  <div className="space-y-3">
                    {tempTags.map((tag, i) => (
                      <div key={i} className="p-3 bg-white border border-gray-100 rounded-xl shadow-sm group hover:border-blue-200 transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800 cursor-pointer hover:text-blue-600" onClick={() => jumpToNode('ent_vision_ai')}>{tag.name}</span>
                            <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded">置信度 {(tag.confidence * 100).toFixed(0)}%</span>
                          </div>
                          <button 
                            onClick={() => addToGraph(tag)}
                            className="text-[10px] text-blue-600 font-bold hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            一键入库
                          </button>
                        </div>
                        <div className="text-[10px] text-gray-500 flex items-start gap-1">
                          <FileText size={10} className="mt-0.5 shrink-0" />
                          证据: {tag.evidence}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full text-xs py-2" onClick={() => setTempTags([])}>清除结果</Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </div>

      <div className="col-span-3 space-y-6">
        <Card className="p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">学习数据提示</h3>
          <div className="space-y-5">
            {[
              { label: '本周新增标签', value: '42', change: '+12%', icon: Activity },
              { label: '建议采纳率', value: '94%', change: '+5%', icon: CheckCircle },
              { label: '决策冲突次数', value: '2', change: '-60%', icon: Info },
              { label: '热点风险因子', value: '低空合规', change: 'NEW', icon: Shield },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <s.icon size={14} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-gray-500">{s.label}</span>
                    <span className={`text-[10px] font-bold ${s.change.includes('+') || s.change === 'NEW' ? 'text-green-500' : 'text-amber-500'}`}>
                      {s.change}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-gray-900">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">知识库演进趋势</h3>
          <div className="h-24 flex items-end gap-1 px-2">
            {[40, 65, 45, 90, 70, 85, 100].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 bg-blue-500/40 rounded-t-sm hover:bg-blue-500 transition-colors cursor-help"
                title={`Day ${i+1}: ${h}% growth`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
            <span>Mon</span>
            <span>Sun</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

const D3Graph = ({ industry }: { industry?: string }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { state, dispatch } = useGlobalStore();
  const { graphData, selectedBases } = state.knowledgeEngine;

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    svg.on('click', (event) => {
      if (event.target === svgRef.current) {
        dispatch({ type: 'HIGHLIGHT_NODE', payload: null });
        dispatch({ type: 'SELECT_ENTITY', payload: null });
      }
    });

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Create a container for all graph elements to enable zoom/pan
    const g = svg.append('g').attr('class', 'graph-container');

    // Define zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Filter nodes based on selected bases (mock logic)
    const filteredNodes = graphData.nodes.filter(n => {
      if (selectedBases.length === 0) return n.group === 'core';
      if (selectedBases.includes('public') && n.group === 'core') return true;
      if (selectedBases.includes('industry') && n.group === 'chain') return true;
      if (selectedBases.includes('project') && n.group === 'enterprise') return true;
      if (selectedBases.includes('scenario') && (n.group === 'policy' || n.group === 'risk')) return true;
      return false;
    }).map(n => ({ ...n })); // Clone to prevent mutation

    const filteredLinks = graphData.links.filter(l => {
      const sourceId = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
      const targetId = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
      return filteredNodes.some(n => n.id === sourceId) && filteredNodes.some(n => n.id === targetId);
    }).map(l => ({ ...l })); // Clone to prevent mutation

    const simulation = d3.forceSimulation(filteredNodes as any)
      .force('link', d3.forceLink(filteredLinks).id((d: any) => d.id).distance(140))
      .force('charge', d3.forceManyBody().strength(-500))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Glow effect
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'glow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const link = g.append('g')
      .selectAll('line')
      .data(filteredLinks)
      .enter().append('line')
      .attr('stroke', '#3b82f6')
      .attr('stroke-opacity', 0.2)
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', (d: any) => d.label === '触发' ? '0' : '5,5')
      .attr('class', 'transition-all duration-300');

    // Add flowing light effect to links
    if (industry === 'invest') {
      link.attr('stroke-dasharray', '10,10')
          .append('animate')
          .attr('attributeName', 'stroke-dashoffset')
          .attr('from', '100')
          .attr('to', '0')
          .attr('dur', '3s')
          .attr('repeatCount', 'indefinite');
    }

    const node = g.append('g')
      .selectAll('g')
      .data(filteredNodes)
      .enter().append('g')
      .attr('class', 'cursor-pointer')
      .on('mouseenter', function(event, d: any) {
        // Show tooltip or info
        const tooltip = d3.select('body').append('div')
          .attr('id', 'graph-tooltip')
          .attr('class', 'fixed p-3 bg-slate-900/90 text-white rounded-xl border border-slate-700 shadow-2xl pointer-events-none z-[100] max-w-xs')
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY + 10) + 'px')
          .html(`
            <div class="text-xs font-bold text-blue-400 uppercase mb-1">${d.type}</div>
            <div class="text-sm font-bold mb-1">${d.name}</div>
            <div class="text-[10px] text-slate-300 leading-relaxed">${d.desc || '暂无详细说明'}</div>
          `);

        // Highlight connected links and nodes
        link.transition().duration(200)
          .attr('stroke-opacity', (l: any) => {
            const sId = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
            const tId = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
            return (sId === d.id || tId === d.id) ? 0.8 : 0.05;
          })
          .attr('stroke-width', (l: any) => {
            const sId = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
            const tId = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
            return (sId === d.id || tId === d.id) ? 3 : 1.5;
          });
        
        node.transition().duration(200)
          .attr('opacity', (n: any) => {
            if (n.id === d.id) return 1;
            const isConnected = filteredLinks.some(l => {
              const sId = (l.source && typeof l.source === 'object') ? l.source.id : l.source;
              const tId = (l.target && typeof l.target === 'object') ? l.target.id : l.target;
              return (sId === d.id && tId === n.id) || (tId === d.id && sId === n.id);
            });
            return isConnected ? 1 : 0.2;
          });

        d3.select(this).select('circle').transition().attr('r', d.group === 'core' ? 28 : 22).attr('stroke-width', 6);
        d3.select(this).select('text').transition().attr('font-size', '14px').attr('fill', '#fff').attr('font-weight', 'bold');
      })
      .on('mouseleave', function(event, d: any) {
        d3.select('#graph-tooltip').remove();
        link.transition().duration(200).attr('stroke-opacity', 0.2).attr('stroke-width', 1.5);
        node.transition().duration(200).attr('opacity', 1);
        
        d3.select(this).select('circle').transition().attr('r', d.group === 'core' ? 20 : 14).attr('stroke-width', 2);
        d3.select(this).select('text').transition().attr('font-size', '10px').attr('fill', '#94a3b8').attr('font-weight', '500');
      })
      .on('click', (event, d: any) => {
        event.stopPropagation();
        dispatch({ type: 'SELECT_ENTITY', payload: d.id });
        dispatch({ type: 'HIGHLIGHT_NODE', payload: d.id });
      })
      .call(d3.drag<any, any>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    node.append('circle')
      .attr('r', (d: any) => d.group === 'core' ? 20 : 14)
      .attr('fill', (d: any) => {
        if (d.group === 'core') return '#3b82f6';
        if (d.group === 'enterprise') return '#10b981';
        if (d.group === 'risk') return '#f59e0b';
        if (d.group === 'policy') return '#6366f1';
        if (d.group === 'chain') return '#ec4899';
        return '#1e293b';
      })
      .attr('stroke', (d: any) => {
        if (state.highlightedNodeId === d.id) return '#fff';
        if (d.group === 'core') return '#60a5fa';
        if (d.group === 'enterprise') return '#34d399';
        if (d.group === 'risk') return '#fbbf24';
        if (d.group === 'policy') return '#818cf8';
        if (d.group === 'chain') return '#f472b6';
        return '#3b82f6';
      })
      .attr('stroke-width', (d: any) => state.highlightedNodeId === d.id ? 4 : 2)
      .attr('filter', 'url(#glow)');

    // Highlight effect for highlightedNodeId
    if (state.highlightedNodeId) {
      node.filter((d: any) => d.id === state.highlightedNodeId)
        .select('circle')
        .transition()
        .duration(500)
        .attr('r', (d: any) => (d.group === 'core' ? 20 : 14) * 1.5)
        .transition()
        .duration(500)
        .attr('r', (d: any) => d.group === 'core' ? 20 : 14);
    }

    // Breathing animation for core node
    node.filter((d: any) => d.group === 'core')
      .select('circle')
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', '20;22;20')
      .attr('dur', '3s')
      .attr('repeatCount', 'indefinite');

    node.append('text')
      .text((d: any) => d.name)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('font-weight', '500')
      .attr('text-anchor', 'middle')
      .attr('dy', (d: any) => d.group === 'core' ? 38 : 32);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
      d3.select('#graph-tooltip').remove();
    };
  }, [industry, graphData, selectedBases, state.highlightedNodeId]);

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-6 left-6 flex flex-col gap-2 bg-slate-800/80 backdrop-blur-md p-3 rounded-xl border border-slate-700">
        {[
          { label: '核心节点', color: '#3b82f6' },
          { label: '产业链', color: '#ec4899' },
          { label: '企业实体', color: '#10b981' },
          { label: '政策规则', color: '#6366f1' },
          { label: '风险因子', color: '#f59e0b' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{item.label}</span>
          </div>
        ))}
      </div>
      
      {/* Interaction Hint */}
      <div className="absolute top-6 right-6 text-[10px] text-slate-500 font-medium bg-slate-800/40 px-3 py-1 rounded-full border border-slate-700/50">
        滚轮缩放 · 拖拽移动 · 点击查看详情
      </div>
    </div>
  );
};

// --- Main Page ---

export const KnowledgeGraphPage: React.FC = () => {
  const { state, dispatch: storeDispatch } = useGlobalStore();
  const { dispatch } = useCopilot();
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const role = state.currentUserRole || 'ADMIN';

  const perspectiveMap = {
    ADMIN: { title: '行业战略大脑视角', badge: '战略大脑模式', defaultTab: 'framework' },
    MANAGER: { title: '组织智能诊断视角', badge: '组织诊断模式', defaultTab: 'conflicts' },
    OPERATOR: { title: '行业能力学院视角', badge: '能力学院模式', defaultTab: 'learning' },
  };

  const currentPerspective = perspectiveMap[role as keyof typeof perspectiveMap] || perspectiveMap.ADMIN;

  const allTabs = [
    { id: 'framework', name: '知识框架', icon: Network },
    { id: 'mapping', name: '行业映射', icon: Database },
    { id: 'rules', name: '规则与权重', icon: Shield },
    { id: 'learning', name: '标签与学习', icon: Tags },
    { id: 'conflicts', name: '决策冲突', icon: AlertTriangle },
    { id: 'collaboration', name: '协同指数分析', icon: Activity, hidden: true },
    { id: 'learning_analysis', name: '学习趋势分析', icon: TrendingUp, hidden: true },
    { id: 'growth_analysis', name: '个人成长分析', icon: Zap, hidden: true },
  ];

  // Reorder tabs based on role
  const tabs = useMemo(() => {
    const visibleTabs = allTabs.filter(t => !t.hidden);
    if (role === 'OPERATOR') {
      return [
        visibleTabs.find(t => t.id === 'learning')!,
        visibleTabs.find(t => t.id === 'mapping')!,
        visibleTabs.find(t => t.id === 'framework')!,
        visibleTabs.find(t => t.id === 'rules')!,
        visibleTabs.find(t => t.id === 'conflicts')!,
      ];
    }
    if (role === 'MANAGER') {
      return [
        visibleTabs.find(t => t.id === 'conflicts')!,
        visibleTabs.find(t => t.id === 'learning')!,
        visibleTabs.find(t => t.id === 'mapping')!,
        visibleTabs.find(t => t.id === 'framework')!,
        visibleTabs.find(t => t.id === 'rules')!,
      ];
    }
    return [
      visibleTabs.find(t => t.id === 'framework')!,
      visibleTabs.find(t => t.id === 'mapping')!,
      visibleTabs.find(t => t.id === 'rules')!,
      visibleTabs.find(t => t.id === 'conflicts')!,
      visibleTabs.find(t => t.id === 'learning')!,
    ];
  }, [role]);

  const [activeTab, setActiveTab] = useState(currentPerspective?.defaultTab || 'framework');

  useEffect(() => {
    if (currentPerspective) {
      setActiveTab(currentPerspective.defaultTab);
    }
  }, [role, currentPerspective]);

  const runOneClickDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    
    // Step 1: Extraction
    window.dispatchEvent(new CustomEvent('copilot-input', { 
      detail: '我将为你演示如何把招商经验转化为可复用知识资产。第一步：从招商企业文本中抽取知识...' 
    }));
    
    setTimeout(() => {
      const newNodes = [
        { id: 'ent_demo_ai', name: '智影科技 (AI芯片)', group: 'enterprise', type: 'company', tags: ['国产替代', 'B+轮'], evidence: '拥有核心专利120项，流片成功率100%。' },
        { id: 'risk_demo_supply', name: '供应链波动风险', group: 'risk', type: 'risk', desc: '上游原材料受国际局势影响，存在断供风险。' }
      ];
      const newLinks = [
        { source: 'chain_semiconductor', target: 'ent_demo_ai', label: '适配' },
        { source: 'ent_demo_ai', target: 'risk_demo_supply', label: '触发' }
      ];
      const newTags = [
        { id: 'tag_demo_1', name: '核心技术突破', category: 'enterprise' },
        { id: 'tag_demo_2', name: '供应链风险', category: 'risk' }
      ];
      
      storeDispatch({ 
        type: 'KE_ADD_MULTIPLE_ELEMENTS', 
        payload: { nodes: newNodes, links: newLinks, tags: newTags } 
      });

      window.dispatchEvent(new CustomEvent('copilot-input', { 
        detail: '知识抽取完成！新增 2 个实体，2 条关系，2 个标签。现在跳转到行业映射查看图谱变化。' 
      }));

      // Step 2: Mapping
      setActiveTab('mapping');
      storeDispatch({ type: 'KE_SET_SELECTED_BASES', payload: ['public', 'industry', 'scenario'] });
      
      setTimeout(() => {
        storeDispatch({ type: 'SELECT_ENTITY', payload: 'risk_demo_supply' });

        window.dispatchEvent(new CustomEvent('copilot-input', { 
          detail: '图谱节点已更新，已自动聚焦新增的“供应链波动风险”节点。接下来进入规则推理阶段。' 
        }));

        // Step 3: Reasoning
        setTimeout(() => {
          setActiveTab('rules');
          
          setTimeout(() => {
            // Trigger reasoning
            const isHighRisk = state.knowledgeEngine.rules.find(r => r.id === 'r2')?.weight > 0.9;
            storeDispatch({ 
              type: 'KE_SET_TEST_RESULT', 
              payload: {
                conclusion: '建议：加强尽调 / 风险对冲',
                risk: '中高',
                score: 75,
                reason: '触发供应链风险预警，需核实备货周期。',
                path: ['初筛', '风险核实', '尽调'],
                ruleChain: [
                  { name: '画像匹配', result: '通过', desc: '半导体产业链高度契合' },
                  { name: '风险扫描', result: '预警', desc: '触发供应链波动风险' },
                  { name: '政策对齐', result: '通过', desc: '符合集成电路专项补贴' }
                ]
              }
            });

            window.dispatchEvent(new CustomEvent('copilot-input', { 
              detail: '推理完成！触发 3 条规则，综合风险等级：中高。建议路径已生成。' 
            }));

            // Step 4: Ledger
            setTimeout(() => {
              storeDispatch({
                type: 'KE_ADD_LEDGER_ENTRY',
                payload: {
                  title: '智影科技招商项目知识沉淀',
                  desc: '基于企业文本自动抽取半导体产业链知识，识别核心技术突破点及供应链潜在风险。',
                  timestamp: Date.now(),
                  stats: [
                    { label: '新增实体', value: 2 },
                    { label: '触发规则', value: 3 },
                    { label: '风险等级', value: '中高' }
                  ]
                }
              });

              storeDispatch({
                type: 'ADD_ACTION_LOG',
                payload: { type: 'knowledge_deposit', desc: '完成智影科技招商项目知识沉淀' }
              });

              window.dispatchEvent(new CustomEvent('copilot-input', { 
                detail: '演示结束。本次新增知识条目：6，触发规则：3，风险等级：中高。知识资产已存入台账。' 
              }));
              setIsDemoRunning(false);
            }, 2000);
          }, 1000);
        }, 2000);
      }, 2000);
    }, 2000);
  };

  useEffect(() => {
    dispatch({ type: 'UPDATE_CONTEXT', payload: { subModule: activeTab } });
    
    if (activeTab === 'mapping' && !isDemoRunning) {
      window.dispatchEvent(new CustomEvent('copilot-input', { 
        detail: '欢迎来到行业映射视图。这里展示了底座方法论、产业链结构与招商场景的深度融合。建议您点击“风险因子”相关节点（黄色），查看其背后的规则逻辑。' 
      }));
    }
  }, [activeTab]);

  return (
    <div className="h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between shrink-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200">
            <BrainCircuit size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">行业知识引擎</h1>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                <span className="opacity-60">当前视角:</span>
                <span>{currentPerspective.badge}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{currentPerspective.title} - 驱动自动化、可解释的智能决策</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {role === 'MANAGER' && (
            <Button variant="outline" className="flex items-center gap-2 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
              <FileText size={14} />
              导出组织诊断报告
            </Button>
          )}
          <Button 
            onClick={runOneClickDemo} 
            disabled={isDemoRunning}
            className={`flex items-center gap-2 px-5 py-2 text-sm font-bold shadow-md transition-all ${
              isDemoRunning ? 'bg-slate-400' : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            <Zap size={16} className={isDemoRunning ? '' : 'animate-pulse'} />
            {isDemoRunning ? '演示进行中...' : '一键演示'}
          </Button>
          <div className="flex bg-slate-100/50 p-1 rounded-xl border border-slate-200/60">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon size={14} />
                {tab.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-12 gap-6">
        <div className="col-span-9 flex flex-col space-y-6">
          {/* Value Proposition Banner */}
          <div className="grid grid-cols-4 gap-4 shrink-0">
            {role === 'OPERATOR' ? (
              <>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setActiveTab('learning')}>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <BrainCircuit size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-900">智能打标</div>
                    <div className="text-[10px] text-blue-700/70">快速上手行业打法</div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setActiveTab('learning_analysis')}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-indigo-900">学习趋势</div>
                    <div className="text-[10px] text-indigo-700/70">标签采纳率稳步提升</div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setActiveTab('mapping')}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Network size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-900">图谱可视化</div>
                    <div className="text-[10px] text-emerald-700/70">直观查看知识关联</div>
                  </div>
                </div>
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setActiveTab('growth_analysis')}>
                  <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                    <Zap size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-purple-900">个人成长</div>
                    <div className="text-[10px] text-purple-700/70">本周掌握 12 个新知识点</div>
                  </div>
                </div>
              </>
            ) : role === 'MANAGER' ? (
              <>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setActiveTab('conflicts')}>
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                    <AlertTriangle size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-900">决策冲突</div>
                    <div className="text-[10px] text-amber-700/70">本周共 8 次人机偏离</div>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setActiveTab('collaboration')}>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-900">协同指数</div>
                    <div className="text-[10px] text-blue-700/70">团队一致性 82%</div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setActiveTab('framework')}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Database size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-indigo-900">知识分布</div>
                    <div className="text-[10px] text-indigo-700/70">半导体产业链覆盖 95%</div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setActiveTab('learning')}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-900">标签准确率</div>
                    <div className="text-[10px] text-emerald-700/70">AI 自动识别准确率 94%</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setActiveTab('framework')}>
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Network size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-blue-900">规则体系</div>
                    <div className="text-[10px] text-blue-700/70">5 大核心规则库已就绪</div>
                  </div>
                </div>
                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-indigo-100 transition-colors" onClick={() => setActiveTab('rules')}>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-indigo-900">权重调整</div>
                    <div className="text-[10px] text-indigo-700/70">支持多维度动态调参</div>
                  </div>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setActiveTab('rules')}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                    <Play size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-emerald-900">路径测试</div>
                    <div className="text-[10px] text-emerald-700/70">模拟真实决策链路</div>
                  </div>
                </div>
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-amber-100 transition-colors" onClick={() => setActiveTab('conflicts')}>
                  <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                    <Activity size={20} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-amber-900">冲突趋势</div>
                    <div className="text-[10px] text-amber-700/70">本月冲突率下降 15%</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 min-h-0"
            >
              {activeTab === 'framework' && <KnowledgeFramework />}
              {activeTab === 'mapping' && <IndustryMapping />}
              {activeTab === 'rules' && <RulesAndWeights />}
              {activeTab === 'learning' && <TagsAndLearning setActiveTab={setActiveTab} />}
              {activeTab === 'conflicts' && <DecisionConflicts />}
              {activeTab === 'collaboration' && <CollaborationAnalysis />}
              {activeTab === 'learning_analysis' && <LearningAnalysis />}
              {activeTab === 'growth_analysis' && <GrowthAnalysis />}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="col-span-3 h-full overflow-hidden">
          <KnowledgeLedger />
        </div>
      </div>
    </div>
  );
};

const DecisionConflicts = () => {
  const { state, dispatch } = useGlobalStore();
  const { conflictLogs } = state.knowledgeEngine;

  return (
    <div className="grid grid-cols-12 gap-6 h-full">
      <div className="col-span-9 space-y-6 overflow-y-auto pr-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">决策冲突记录</h3>
          <div className="text-[10px] bg-amber-50 text-amber-600 px-2 py-1 rounded border border-amber-100 font-bold">
            检测到 {conflictLogs.length} 次人机决策偏离
          </div>
        </div>

        <div className="space-y-4">
          {conflictLogs.length === 0 ? (
            <Card className="p-12 flex flex-col items-center justify-center text-center bg-slate-50/50 border-dashed">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h4 className="text-sm font-bold text-gray-900 mb-1">暂无决策冲突</h4>
              <p className="text-xs text-gray-500 max-w-xs">当前所有人工决策均与系统知识规则保持一致，知识沉淀运行良好。</p>
            </Card>
          ) : (
            conflictLogs.map((log) => (
              <Card key={log.id} className="p-5 hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-900">{log.scenario}</span>
                      <span className="text-[10px] text-gray-400">|</span>
                      <span className="text-[10px] text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <h4 className="text-sm font-bold text-blue-600">{log.ruleName}</h4>
                  </div>
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.riskLevel === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    系统风险: {log.riskLevel === 'high' ? '红色预警' : '橙色预警'}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 mb-1">AI 建议权重</div>
                    <div className="text-sm font-mono font-bold text-gray-900">{log.aiWeight}</div>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <div className="text-[10px] text-amber-600 mb-1">用户设定权重</div>
                    <div className="text-sm font-mono font-bold text-amber-700">{log.userWeight}</div>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <div className="text-[10px] text-gray-500 mb-1">偏离度</div>
                    <div className="text-sm font-mono font-bold text-red-500">
                      {Math.abs(log.aiWeight - log.userWeight).toFixed(1)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
                  <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-blue-700 leading-relaxed italic">
                    “{log.remark}”
                  </p>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      <div className="col-span-3 space-y-6">
        <Card className="p-4">
          <h3 className="text-sm font-bold text-gray-900 mb-4">冲突复盘摘要</h3>
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[10px] text-gray-500 mb-2 uppercase font-bold tracking-wider">核心矛盾点</div>
              <p className="text-xs text-gray-700 leading-relaxed">
                多数冲突集中在<span className="font-bold text-blue-600">“现金流风险”</span>规则。用户倾向于给予高成长性企业更多容忍度，而系统规则基于历史违约数据执行严格准入。
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <div className="text-[10px] text-gray-500 mb-2 uppercase font-bold tracking-wider">知识修正建议</div>
              <p className="text-xs text-gray-700 leading-relaxed">
                建议考虑引入<span className="font-bold text-green-600">“融资轮次”</span>作为调节因子，对B轮以后且有知名机构背书的企业，适当放宽现金流硬性指标。
              </p>
            </div>
            <Button variant="outline" className="w-full text-xs py-2 flex items-center justify-center gap-2">
              <FileText size={14} />
              导出复盘报告
            </Button>
          </div>
        </Card>

        <Card className="p-4 bg-slate-900 border-slate-800">
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">人机协同指数</h3>
          <div className="flex items-center justify-center py-4">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 * (1 - 0.82)} className="text-blue-500" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-white">82%</span>
                <span className="text-[8px] text-slate-500 uppercase">一致性</span>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
            当前决策一致性处于健康区间，冲突主要源于对新兴产业风险偏好的差异。
          </p>
        </Card>
      </div>
    </div>
  );
};
