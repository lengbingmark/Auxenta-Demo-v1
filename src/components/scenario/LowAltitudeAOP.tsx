import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CityMapBackground } from './CityMapBackground';
import { 
  Plane, 
  Navigation, 
  AlertTriangle, 
  Activity, 
  Mic, 
  Send, 
  ShieldCheck, 
  Map as MapIcon, 
  Wind, 
  Radio,
  Video,
  Info,
  CheckCircle2,
  Clock,
  MapPin,
  Zap,
  Network,
  Cpu,
  Database,
  ChevronRight,
  Loader2,
  Bot,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

// --- Mock Data ---
const METRICS = [
  { label: '机巢总数', value: '5', unit: '座', icon: MapPin, color: 'text-blue-400' },
  { label: '在线无人机', value: '9', unit: '架', icon: Plane, color: 'text-emerald-400' },
  { label: '今日执行任务', value: '32', unit: '项', icon: Navigation, color: 'text-sky-400' },
  { label: '累计飞行里程', value: '186', unit: 'km', icon: Activity, color: 'text-indigo-400' },
];

const EVENTS = [
  { id: 1, level: 'high', title: '火情疑似告警', time: '14:20', location: '滨江森林公园', status: '待处置' },
  { id: 2, level: 'medium', title: '空域临时管制', time: '13:45', location: '中心商务区', status: '处理中' },
  { id: 3, level: 'low', title: '设备低电量预警', time: '13:10', location: '3号机巢', status: '已闭环' },
];

const NESTS = [
  { id: 'A', name: '1号机巢-中心站', status: 'online', drones: 3, pos: { x: 30, y: 40 } },
  { id: 'B', name: '2号机巢-滨江站', status: 'online', drones: 2, pos: { x: 70, y: 30 } },
  { id: 'C', name: '3号机巢-森林站', status: 'warning', drones: 1, pos: { x: 50, y: 70 } },
  { id: 'D', name: '4号机巢-工业园', status: 'online', drones: 2, pos: { x: 20, y: 80 } },
  { id: 'E', name: '5号机巢-港口站', status: 'offline', drones: 1, pos: { x: 85, y: 65 } },
];

const DRONES = [
  { id: 'D-01', type: 'M300 RTK', status: 'flying', task: '巡检任务', battery: 78, pos: { x: 45, y: 45 } },
  { id: 'D-02', type: 'M30', status: 'idle', task: '待命', battery: 92, pos: { x: 32, y: 42 } },
];

export const LowAltitudeAOP = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);

  const handleVoiceCommand = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputValue('发现滨江森林公园疑似火情，请立即调度最近无人机前往核查并规划合规航线。');
    }, 2000);
  };

  const handleDispatch = () => {
    if (!inputValue) return;
    setIsDispatching(true);
    setAiResponse(null);
    
    setTimeout(() => {
      setIsDispatching(false);
      setAiResponse('已识别意图：【应急火情核查】。正在检索最近机巢资源... 锁定 1 号机巢 D-01 无人机。正在进行 AI 合规航线规划：已避开 2 处禁飞区，考虑当前 3 级北风影响，生成最优路径。预计 4 分钟到达。');
      toast.success('AI 调度指令已下发');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-6 font-sans selection:bg-blue-500/30">
      {/* --- Header / Title --- */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <Navigation className="text-white" size={24} />
            </div>
            AOP <span className="text-blue-500 font-light">Autonomous Operations Platform</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide uppercase">城市低空自主运营指挥中心 · 智慧调度系统</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-blue-400 tracking-widest uppercase">System Online</span>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">当前时间</div>
            <div className="text-sm font-mono font-bold text-white">2026.03.13 17:34:39</div>
          </div>
        </div>
      </div>

      {/* --- Top Metrics --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {METRICS.map((m, i) => (
          <Card key={i} className="bg-slate-900/40 border-slate-800/50 backdrop-blur-md p-5 hover:border-blue-500/30 transition-all group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg bg-slate-800 group-hover:bg-blue-500/10 transition-colors ${m.color}`}>
                <m.icon size={20} />
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time</div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white tracking-tighter">{m.value}</span>
              <span className="text-xs font-bold text-slate-500 uppercase">{m.unit}</span>
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1">{m.label}</div>
          </Card>
        ))}
      </div>

      {/* --- Main Situation Overview Area --- */}
      <div className="relative w-full h-[65vh] mb-8 rounded-[2rem] overflow-hidden border border-slate-800/50 shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-slate-900">
        {/* Map Background */}
        <CityMapBackground />

        {/* --- Left Overlay: Low Altitude Safety Situation --- */}
        <div className="absolute left-6 top-6 bottom-6 w-80 z-20 pointer-events-auto">
          <Card className="h-full bg-slate-900/80 border-slate-800/50 backdrop-blur-xl p-4 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle size={16} className="text-amber-500" />
                低空安全态势
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-red-500/20 text-red-400 rounded">3 待处理</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {EVENTS.map(event => (
                <div 
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                    selectedEvent?.id === event.id 
                      ? 'bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(37,99,235,0.1)]' 
                      : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
                      event.level === 'high' ? 'bg-red-500 text-white' : 
                      event.level === 'medium' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                    }`}>
                      {event.level}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">{event.time}</span>
                  </div>
                  <div className="text-sm font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">{event.title}</div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <MapPin size={10} />
                    {event.location}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{event.status}</span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* --- Center Content: Nests & Drones --- */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Nests */}
          {NESTS.map(nest => (
            <motion.div 
              key={nest.id}
              className="absolute cursor-pointer group/nest pointer-events-auto"
              style={{ left: `${nest.pos.x}%`, top: `${nest.pos.y}%` }}
              whileHover={{ scale: 1.2 }}
            >
              <div className={`w-5 h-5 rounded-full border-2 border-white shadow-lg ${
                nest.status === 'online' ? 'bg-emerald-500' : 
                nest.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900/95 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover/nest:opacity-100 transition-opacity z-30 shadow-xl">
                {nest.name} ({nest.drones}架)
              </div>
            </motion.div>
          ))}

          {/* Drones */}
          {DRONES.map(drone => (
            <motion.div 
              key={drone.id}
              className="absolute cursor-pointer group/drone pointer-events-auto"
              style={{ left: `${drone.pos.x}%`, top: `${drone.pos.y}%` }}
              animate={{ 
                x: [0, 20, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "linear"
              }}
            >
              <div className="relative">
                <Plane size={20} className="text-blue-600 drop-shadow-md" />
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-slate-900/95 border border-slate-700 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap opacity-0 group-hover/drone:opacity-100 transition-opacity z-30 shadow-xl">
                {drone.id} | {drone.type} | {drone.battery}%
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Right Overlay: Low Altitude Operation Situation --- */}
        <div className="absolute right-6 top-6 bottom-6 w-80 z-20 pointer-events-auto">
          <Card className="h-full bg-slate-900/80 border-slate-800/50 backdrop-blur-xl p-5 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 border-b border-slate-800/50 pb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Cpu size={16} className="text-blue-500" />
                低空运行态势
              </h3>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">AI Active</span>
              </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
              {/* Voice Interface */}
              <div className="flex flex-col items-center justify-center p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl relative overflow-hidden group/voice">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover/voice:opacity-100 transition-opacity" />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleVoiceCommand}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all relative z-10 ${
                    isRecording 
                      ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' 
                      : 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-blue-500'
                  }`}
                >
                  {isRecording ? (
                    <div className="flex gap-1">
                      <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white rounded-full" />
                      <motion.div animate={{ height: [12, 24, 12] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.1 }} className="w-1 bg-white rounded-full" />
                      <motion.div animate={{ height: [8, 20, 8] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="w-1 bg-white rounded-full" />
                    </div>
                  ) : (
                    <Mic className="text-white" size={28} />
                  )}
                </motion.button>
                <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {isRecording ? '正在倾听...' : '点击发起语音调度'}
                </div>
              </div>

              {/* Input Fallback */}
              <div className="relative">
                <textarea 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="输入任务指令..."
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 text-xs font-medium text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors resize-none h-24"
                />
                <Button 
                  size="sm" 
                  className="absolute bottom-2 right-2 h-8 w-8 p-0 bg-blue-600 hover:bg-blue-500 border-none"
                  onClick={handleDispatch}
                  disabled={isDispatching || !inputValue}
                >
                  {isDispatching ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </Button>
              </div>

              {/* AI Response */}
              <AnimatePresence>
                {aiResponse && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-800/50 border border-blue-500/20 rounded-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                    <p className="text-xs text-slate-300 leading-relaxed font-medium">
                      {aiResponse}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Recommended Tasks */}
              <div className="space-y-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI 推荐任务</div>
                {[
                  { title: '每日合规巡检', desc: '覆盖中心商务区 12 处重点楼宇', icon: ShieldCheck },
                  { title: '机巢巡检自检', icon: Settings2, desc: '对 3 号机巢进行例行维护检查' }
                ].map((task, idx) => (
                  <div key={idx} className="p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl hover:border-slate-600 transition-colors cursor-pointer flex items-center gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-400 transition-colors">
                      <task.icon size={16} />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-200">{task.title}</div>
                      <div className="text-[9px] text-slate-500 mt-0.5">{task.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Map Controls */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
          <div className="px-4 py-2 bg-slate-900/80 border border-slate-800/50 backdrop-blur-xl rounded-full flex gap-6 shadow-2xl">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-red-500" /> 禁飞区
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-amber-500" /> 限飞区
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> 适飞区
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" className="bg-slate-900/80 border-slate-800/50 backdrop-blur-xl h-10 w-10 p-0 rounded-full shadow-2xl">
              <MapIcon size={16} />
            </Button>
            <Button size="sm" variant="secondary" className="bg-slate-900/80 border-slate-800/50 backdrop-blur-xl h-10 w-10 p-0 rounded-full shadow-2xl">
              <Wind size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* --- Bottom: Network Topology --- */}
      <div className="mt-6">
        <Card className="bg-slate-900/40 border-slate-800/50 backdrop-blur-md p-6 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Network size={16} className="text-indigo-500" />
              城市低空运营网络拓扑
            </h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">机巢节点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">无人机终端</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">数据决策流</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between relative px-12">
            {/* Connection Lines */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                    <stop offset="50%" stopColor="rgba(99, 102, 241, 0.5)" />
                    <stop offset="100%" stopColor="rgba(59, 130, 246, 0.2)" />
                  </linearGradient>
                </defs>
                <path d="M 100 50 Q 400 50 800 50" stroke="url(#lineGrad)" strokeWidth="2" fill="none" />
                <motion.circle 
                  r="3" 
                  fill="#6366f1" 
                  animate={{ offsetDistance: ["0%", "100%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ offsetPath: "path('M 100 50 Q 400 50 800 50')" }}
                />
              </svg>
            </div>

            {[
              { label: '机巢 (Nest)', icon: MapPin, color: 'text-blue-400', sub: '资源底座' },
              { label: '无人机 (Drone)', icon: Plane, color: 'text-emerald-400', sub: '执行终端' },
              { label: '任务 (Task)', icon: Navigation, color: 'text-sky-400', sub: '业务驱动' },
              { label: '数据 (Data)', icon: Database, color: 'text-indigo-400', sub: '感知回传' },
              { label: '决策 (Decision)', icon: Cpu, color: 'text-purple-400', sub: 'AI 闭环' },
            ].map((node, i) => (
              <div key={i} className="flex flex-col items-center gap-3 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group hover:border-blue-500/50 transition-all cursor-pointer">
                  <node.icon size={28} className={`${node.color} group-hover:scale-110 transition-transform`} />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{node.label}</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{node.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
