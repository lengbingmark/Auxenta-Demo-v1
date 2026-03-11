import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Search, 
  Filter, 
  Ticket, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  MoreHorizontal,
  ArrowUpDown,
  User,
  Plus,
  X,
  Calendar,
  FileText,
  Zap,
  Bot,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCopilot } from '../../copilot/core/CopilotContext';
import { toast } from 'react-hot-toast';

interface WorkOrder {
  id: string;
  name: string;
  type: 'Cleaning' | 'Inspection' | 'Repair';
  priority: 'P0' | 'P1' | 'P2';
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed';
  assignee: string;
  createdAt: string;
  source: 'AI' | 'Manual';
  station: string;
  deviceName?: string;
  description?: string;
  expectedCompletion?: string;
}

const mockOrders: WorkOrder[] = [
  { id: 'WO-20240309-001', name: '区域A组件清洗', type: 'Cleaning', priority: 'P0', status: 'In Progress', assignee: '清洗机器人-A02', createdAt: '2024-03-09 10:24', source: 'AI', station: 'XX光伏电站-A区', deviceName: '组件阵列-A1', description: '检测到灰尘遮挡，执行自动清洗' },
  { id: 'WO-20240309-002', name: '全站红外巡检', type: 'Inspection', priority: 'P1', status: 'Pending', assignee: '无人机-Alpha', createdAt: '2024-03-09 11:15', source: 'Manual', station: 'XX光伏电站-A区', description: '例行周度红外热斑巡检' },
  { id: 'WO-20240308-045', name: '逆变器故障维修', type: 'Repair', priority: 'P0', status: 'Completed', assignee: '张工 (运维组)', createdAt: '2024-03-08 09:30', source: 'AI', station: 'XX光伏电站-B区', deviceName: 'INV-B04', description: 'IGBT模块过温故障修复' },
  { id: 'WO-20240308-042', name: '区域B组件清洗', type: 'Cleaning', priority: 'P2', status: 'Completed', assignee: '清洗机器人-01', createdAt: '2024-03-08 14:20', source: 'Manual', station: 'XX光伏电站-B区' },
  { id: 'WO-20240307-088', name: '变压器漏油处理', type: 'Repair', priority: 'P1', status: 'Delayed', assignee: '李工 (运维组)', createdAt: '2024-03-07 16:45', source: 'Manual', station: 'XX光伏电站-A区', deviceName: 'TR-A01', description: '密封圈老化导致渗油' },
  { id: 'WO-20240307-085', name: '航道障碍物巡检', type: 'Inspection', priority: 'P2', status: 'Completed', assignee: '无人机-Beta', createdAt: '2024-03-07 10:10', source: 'AI', station: 'YY风力电站' },
  { id: 'WO-20240306-120', name: '风机叶片清洗', type: 'Cleaning', priority: 'P1', status: 'Completed', assignee: '清洗机器人-03', createdAt: '2024-03-06 13:55', source: 'Manual', station: 'YY风力电站' },
  { id: 'WO-20240306-115', name: '储能电池维护', type: 'Repair', priority: 'P0', status: 'Completed', assignee: '王工 (运维组)', createdAt: '2024-03-06 09:15', source: 'AI', station: 'ZZ储能电站', deviceName: 'BAT-01' },
  { id: 'WO-20240305-150', name: '电缆接头巡检', type: 'Inspection', priority: 'P1', status: 'Completed', assignee: '无人机-Alpha', createdAt: '2024-03-05 15:30', source: 'Manual', station: 'XX光伏电站-C区' },
  { id: 'WO-20240305-145', name: '组件除雪', type: 'Cleaning', priority: 'P2', status: 'Completed', assignee: '清洗机器人-02', createdAt: '2024-03-05 10:00', source: 'AI', station: '宁夏光伏电站' },
  { id: 'WO-20240304-201', name: '汇流箱熔丝更换', type: 'Repair', priority: 'P1', status: 'Completed', assignee: '赵工 (运维组)', createdAt: '2024-03-04 14:30', source: 'AI', station: 'XX光伏电站-A区', deviceName: 'CB-A12' },
  { id: 'WO-20240304-198', name: '环境监测站校准', type: 'Inspection', priority: 'P2', status: 'Completed', assignee: '钱工 (运维组)', createdAt: '2024-03-04 09:15', source: 'Manual', station: 'XX光伏电站-B区' },
];

export const WorkOrderCenter: React.FC = () => {
  const { dispatch } = useCopilot();
  const [filterType, setFilterType] = React.useState<string>('All');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [filterPriority, setFilterPriority] = React.useState<string>('All');
  const [filterSource, setFilterSource] = React.useState<string>('All');
  const [filterStation, setFilterStation] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [activeActionMenu, setActiveActionMenu] = React.useState<string | null>(null);

  React.useEffect(() => {
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `wo-summary-${Date.now()}`,
        role: 'assistant',
        content: `当前共有42个工单：

待处理：8
执行中：12
已完成：22

检测到1个高优先级维修工单，
建议优先处理。`,
        timestamp: Date.now(),
        type: 'text'
      }
    });
  }, []);

  const filteredOrders = mockOrders.filter(order => {
    const matchesType = filterType === 'All' || order.type === filterType;
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || order.priority === filterPriority;
    const matchesSource = filterSource === 'All' || order.source === filterSource;
    const matchesStation = filterStation === 'All' || order.station === filterStation;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesPriority && matchesSource && matchesStation && matchesSearch;
  });

  const kpis = [
    { label: '总工单数', value: '42', unit: '份', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '待处理', value: '8', unit: '份', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '执行中', value: '12', unit: '份', icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: '已完成', value: '22', unit: '份', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card key={i} className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                <kpi.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">工单统计</span>
            </div>
            <div className="text-sm font-bold text-slate-400 mb-1">{kpi.label}</div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-slate-900">{kpi.value}</span>
              <span className="text-sm font-bold text-slate-500">{kpi.unit}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Table Section */}
      <Card className="border-none shadow-sm bg-white overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <h3 className="text-lg font-bold text-slate-900">工单管理中心</h3>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                {['All', 'Cleaning', 'Inspection', 'Repair'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                      filterType === t 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t === 'All' ? '全部' : t === 'Cleaning' ? '清洗' : t === 'Inspection' ? '巡检' : '维修'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索工单号、名称或执行人..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                />
              </div>
              <Button onClick={() => setShowCreateModal(true)} className="gap-2 shadow-lg shadow-blue-100">
                <Plus size={16} /> 新建工单
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">状态</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部状态</option>
                <option value="Pending">待处理</option>
                <option value="In Progress">执行中</option>
                <option value="Completed">已完成</option>
                <option value="Delayed">已逾期</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">优先级</label>
              <select 
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部优先级</option>
                <option value="P0">P0 (紧急)</option>
                <option value="P1">P1 (高)</option>
                <option value="P2">P2 (普通)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">来源</label>
              <select 
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部来源</option>
                <option value="AI">AI 生成</option>
                <option value="Manual">人工创建</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">所属电站</label>
              <select 
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部电站</option>
                <option value="XX光伏电站-A区">XX光伏电站-A区</option>
                <option value="XX光伏电站-B区">XX光伏电站-B区</option>
                <option value="YY风力电站">YY风力电站</option>
                <option value="ZZ储能电站">ZZ储能电站</option>
                <option value="宁夏光伏电站">宁夏光伏电站</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">责任人</label>
              <select 
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部责任人</option>
                <option value="张工">张工</option>
                <option value="李工">李工</option>
                <option value="王工">王工</option>
                <option value="清洗机器人">清洗机器人</option>
                <option value="无人机">无人机</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-50">
                <th className="px-6 py-4">工单编号</th>
                <th className="px-6 py-4">工单类型</th>
                <th className="px-6 py-4">优先级</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">执行人 / 资源</th>
                <th className="px-6 py-4 flex items-center gap-1">
                  创建时间 <ArrowUpDown size={12} />
                </th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        order.type === 'Cleaning' ? 'bg-blue-500' : 
                        order.type === 'Inspection' ? 'bg-indigo-500' : 'bg-amber-500'
                      }`} />
                      <span className="text-sm font-bold text-slate-900">
                        {order.type === 'Cleaning' ? '清洗工单' : 
                         order.type === 'Inspection' ? '巡检工单' : '维修工单'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-black border ${
                      order.priority === 'P0' ? 'bg-red-50 text-red-600 border-red-100' : 
                      order.priority === 'P1' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {order.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      order.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      order.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      order.status === 'Delayed' ? 'bg-red-50 text-red-600 border-red-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {order.status === 'Completed' ? <CheckCircle2 size={12} /> : 
                       order.status === 'In Progress' ? <Clock size={12} className="animate-pulse" /> : 
                       order.status === 'Delayed' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                      {order.status === 'Completed' ? '已完成' : 
                       order.status === 'In Progress' ? '执行中' : 
                       order.status === 'Delayed' ? '已逾期' : '待处理'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                        <User size={12} className="text-slate-500" />
                      </div>
                      <span className="text-sm text-slate-600">{order.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{order.createdAt}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setActiveActionMenu(activeActionMenu === order.id ? null : order.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>

                    {activeActionMenu === order.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveActionMenu(null)} />
                        <div className="absolute right-6 top-12 w-36 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={() => { toast.success('正在加载详情...'); setActiveActionMenu(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <FileText size={14} /> 查看详情
                          </button>
                          <button 
                            onClick={() => { toast.success('进入编辑模式'); setActiveActionMenu(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <Plus size={14} className="rotate-45" /> 编辑工单
                          </button>
                          <button 
                            onClick={() => { toast.success('工单已标记完成'); setActiveActionMenu(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} /> 标记完成
                          </button>
                          <div className="h-px bg-slate-50 my-1" />
                          <button 
                            onClick={() => { toast.error('工单已取消'); setActiveActionMenu(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                          >
                            <AlertCircle size={14} /> 取消工单
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-50 flex items-center justify-between text-xs font-bold text-slate-400">
          <div>显示 {filteredOrders.length} 条记录，共 {mockOrders.length} 条</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>上一页</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">下一页</button>
          </div>
        </div>
      </Card>

      {/* Create Work Order Modal */}
      <AnimatePresence>
        {showCreateModal && (
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
                    <Plus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">新建工单</h3>
                    <p className="text-xs text-slate-500 mt-0.5">系统将自动生成工单编号与创建时间</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 overflow-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">工单名称</label>
                    <input 
                      type="text" 
                      placeholder="例如：逆变器故障排查"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">工单类型</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="Cleaning">清洗工单</option>
                      <option value="Inspection">巡检工单</option>
                      <option value="Repair">维修工单</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">所属电站</label>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                      <option value="XX光伏电站-A区">XX光伏电站-A区</option>
                      <option value="XX光伏电站-B区">XX光伏电站-B区</option>
                      <option value="YY风力电站">YY风力电站</option>
                      <option value="ZZ储能电站">ZZ储能电站</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">关联设备</label>
                    <input 
                      type="text" 
                      placeholder="例如：INV-A01"
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">责任人</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="输入姓名或选择资源"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">优先级</label>
                    <div className="flex gap-3">
                      {['P0', 'P1', 'P2'].map((p) => (
                        <button
                          key={p}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            p === 'P1' 
                              ? 'bg-blue-50 border-blue-200 text-blue-600' 
                              : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">预计完成时间</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="datetime-local" 
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">任务描述</label>
                    <textarea 
                      rows={3}
                      placeholder="请详细描述工单任务内容..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Bot size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-blue-900">Liangzai 智能助手</div>
                    <p className="text-[10px] text-blue-700 mt-1 leading-relaxed">
                      检测到您正在为“XX光伏电站-A区”创建工单。该区域目前有3个待处理告警，建议在任务描述中补充相关告警信息，以便运维人员快速定位。
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>取消</Button>
                <Button 
                  className="px-8"
                  onClick={() => {
                    toast.success('工单创建成功！');
                    setShowCreateModal(false);
                  }}
                >
                  提交工单
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
