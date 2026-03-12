import React from 'react';
import { useGlobalStore } from '../../store/GlobalStore';
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
  status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed' | 'Risk';
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
  const { state, dispatch: globalDispatch } = useGlobalStore();
  const { system_state, dynamic_ticket_store } = state;
  const { dispatch } = useCopilot();
  const [filterType, setFilterType] = React.useState<string>('All');
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [filterPriority, setFilterPriority] = React.useState<string>('All');
  const [filterSource, setFilterSource] = React.useState<string>('All');
  const [filterStation, setFilterStation] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [activeActionMenu, setActiveActionMenu] = React.useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = React.useState<WorkOrder | null>(null);
  const [editingOrder, setEditingOrder] = React.useState<WorkOrder | null>(null);
  const [showDetailModal, setShowDetailModal] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    type: 'Cleaning' as WorkOrder['type'],
    station: 'XX光伏电站-A区',
    deviceName: '',
    assignee: '',
    priority: 'P1' as WorkOrder['priority'],
    description: '',
    expectedCompletion: ''
  });

  React.useEffect(() => {
    if (editingOrder) {
      setFormData({
        name: editingOrder.name,
        type: editingOrder.type,
        station: editingOrder.station,
        deviceName: editingOrder.deviceName || '',
        assignee: editingOrder.assignee,
        priority: editingOrder.priority,
        description: editingOrder.description || '',
        expectedCompletion: editingOrder.expectedCompletion || ''
      });
    } else {
      setFormData({
        name: '',
        type: 'Cleaning',
        station: 'XX光伏电站-A区',
        deviceName: '',
        assignee: '',
        priority: 'P1',
        description: '',
        expectedCompletion: ''
      });
    }
  }, [editingOrder, showCreateModal]);

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error('请输入工单名称');
      return;
    }

    const ticketId = editingOrder ? editingOrder.id : `WO-${Date.now()}`;
    
    globalDispatch({
      type: 'UPSERT_DYNAMIC_TICKET',
      payload: {
        ticket_id: ticketId,
        run_id: system_state?.run_id || 'manual',
        ticket_name: formData.name,
        ticket_type: formData.type,
        source: editingOrder ? (editingOrder.source === 'AI' ? 'AI生成' : '人工创建') : '人工创建',
        station: formData.station,
        assignee: formData.assignee,
        priority: formData.priority,
        status: editingOrder ? editingOrder.status : 'Pending',
        created_at: editingOrder ? new Date(editingOrder.createdAt).getTime() : Date.now(),
        expires_at: Date.now() + 24 * 60 * 60 * 1000,
        description: formData.description
      }
    });

    toast.success(editingOrder ? '工单更新成功！' : '工单创建成功！');
    setShowCreateModal(false);
    setEditingOrder(null);
  };

  const handleMarkComplete = (order: WorkOrder) => {
    // If it's a mock order, we need to upsert it to dynamic store first
    globalDispatch({
      type: 'UPSERT_DYNAMIC_TICKET',
      payload: {
        ticket_id: order.id,
        run_id: system_state?.run_id || 'manual',
        ticket_name: order.name,
        ticket_type: order.type,
        source: order.source === 'AI' ? 'AI生成' : '人工创建',
        station: order.station,
        assignee: order.assignee,
        priority: order.priority,
        status: 'Completed',
        created_at: Date.now(),
        expires_at: Date.now() + 24 * 60 * 60 * 1000,
        description: order.description
      }
    });
    toast.success(`工单 ${order.id} 已标记完成`);
    setActiveActionMenu(null);
  };

  const handleCancelOrder = (order: WorkOrder) => {
    // For simplicity, we'll just delete it if it's dynamic, or "cancel" it by upserting with a status if we had one.
    // Since we don't have a 'Cancelled' status in the type, let's just delete it from dynamic store.
    globalDispatch({ type: 'DELETE_DYNAMIC_TICKET', payload: order.id });
    toast.error(`工单 ${order.id} 已取消`);
    setActiveActionMenu(null);
  };

  const handleEditOrder = (order: WorkOrder) => {
    setEditingOrder(order);
    setShowCreateModal(true);
    setActiveActionMenu(null);
  };

  const handleViewDetails = (order: WorkOrder) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    setActiveActionMenu(null);
  };

  const aiOrder = React.useMemo(() => {
    if (!system_state || (!['execution', 'acceptance', 'closed'].includes(system_state.current_stage) && !['confirmed', 'running', 'completed'].includes(system_state.task_status))) {
      return null;
    }

    let status: WorkOrder['status'] = 'Pending';
    if (system_state.task_status === 'confirmed') status = 'Pending';
    if (system_state.task_status === 'running') status = 'In Progress';
    if (system_state.task_status === 'completed') status = 'Completed';
    if (system_state.risk_status === 'warning') status = 'Risk';

    return {
      id: `WO-${system_state.run_id}-001`,
      name: '组件清洗任务',
      type: 'Cleaning' as const,
      priority: 'P1' as const,
      status,
      assignee: '清洗机器人-A01',
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 16),
      source: 'AI' as const,
      station: 'XX光伏电站-B区',
      description: system_state.risk_status === 'warning' ? '【风险提示】检测到环境异常，请注意作业安全' : 'AI自动生成的组件清洗任务'
    };
  }, [system_state]);

  // Cleanup expired tickets on mount
  React.useEffect(() => {
    globalDispatch({ type: 'CLEANUP_EXPIRED_TICKETS' });
  }, []);

  // Sync current AI order to persistent store
  React.useEffect(() => {
    if (aiOrder && system_state?.run_id) {
      globalDispatch({
        type: 'UPSERT_DYNAMIC_TICKET',
        payload: {
          ticket_id: aiOrder.id,
          run_id: system_state.run_id,
          ticket_name: aiOrder.name,
          ticket_type: aiOrder.type,
          source: 'AI生成',
          station: aiOrder.station,
          assignee: aiOrder.assignee,
          priority: aiOrder.priority,
          status: aiOrder.status,
          created_at: Date.now(),
          expires_at: Date.now() + 24 * 60 * 60 * 1000,
          description: aiOrder.description
        }
      });
    }
  }, [aiOrder?.status, aiOrder?.id, system_state?.run_id]);

  const allOrders = React.useMemo(() => {
    const now = Date.now();
    const activeDynamic = (dynamic_ticket_store || []).filter(t => t.expires_at > now);
    
    const dynamicAsWorkOrders: WorkOrder[] = activeDynamic.map(t => ({
      id: t.ticket_id,
      name: t.ticket_name,
      type: t.ticket_type as any,
      priority: t.priority as any,
      status: t.status as any,
      assignee: t.assignee,
      createdAt: new Date(t.created_at).toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-').slice(0, 16),
      source: 'AI' as const,
      station: t.station,
      description: t.description
    }));

    // Combine with mock orders, avoiding duplicates (by ID)
    const combined = [...dynamicAsWorkOrders];
    mockOrders.forEach(mo => {
      if (!combined.find(co => co.id === mo.id)) {
        combined.push(mo);
      }
    });

    // If current aiOrder is not in dynamic_ticket_store yet (e.g. just generated), add it
    if (aiOrder && !combined.find(o => o.id === aiOrder.id)) {
      combined.unshift(aiOrder);
    }

    return combined;
  }, [aiOrder, dynamic_ticket_store]);

  React.useEffect(() => {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'Pending').length;
    const inProgress = allOrders.filter(o => o.status === 'In Progress' || o.status === 'Risk').length;
    const completed = allOrders.filter(o => o.status === 'Completed').length;

    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: `wo-summary-${Date.now()}`,
        role: 'assistant',
        content: `当前共有${total}个工单：

待处理：${pending}
执行中：${inProgress}
已完成：${completed}

${aiOrder?.status === 'Risk' ? '⚠️ 检测到AI生成工单处于风险状态，请及时关注。' : '检测到1个高优先级维修工单，建议优先处理。'}`,
        timestamp: Date.now(),
        type: 'text',
        actions: [
          { 
            label: '查看工单', 
            event: 'E_VIEW_TASKS', 
            payload: { ticketId: aiOrder?.id || 'WO-20240309-001' }, 
            primary: true 
          }
        ]
      }
    });
  }, [aiOrder?.id, aiOrder?.status]);

  React.useEffect(() => {
    const handlePowerOpsEvent = (e: any) => {
      const { event, payload } = e.detail;
      if (event === 'E_VIEW_TASKS' || (event === 'NAV_TO_MODULE' && payload?.module === 'TICKETS')) {
        const ticketId = payload?.ticketId;
        if (ticketId) {
          const order = allOrders.find(o => o.id === ticketId);
          if (order) {
            handleViewDetails(order);
          } else {
            // Fallback: if not found by ID, just toast
            toast.error(`未找到工单: ${ticketId}`);
          }
        } else {
          // If no specific ID, maybe just highlight the first one or show a general toast
          // But usually we want to be specific.
        }
      }
    };

    window.addEventListener('powerops-event', handlePowerOpsEvent);
    return () => window.removeEventListener('powerops-event', handlePowerOpsEvent);
  }, [allOrders]);

  const filteredOrders = allOrders.filter(order => {
    const matchesType = filterType === 'All' || order.type === filterType;
    const matchesStatus = filterStatus === 'All' || order.status === filterStatus || (filterStatus === 'In Progress' && order.status === 'Risk');
    const matchesPriority = filterPriority === 'All' || order.priority === filterPriority;
    const matchesSource = filterSource === 'All' || order.source === filterSource;
    const matchesStation = filterStation === 'All' || order.station === filterStation;
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesType && matchesStatus && matchesPriority && matchesSource && matchesStation && matchesSearch;
  });

  const kpis = React.useMemo(() => {
    const total = allOrders.length;
    const pending = allOrders.filter(o => o.status === 'Pending').length;
    const inProgress = allOrders.filter(o => o.status === 'In Progress' || o.status === 'Risk').length;
    const completed = allOrders.filter(o => o.status === 'Completed').length;

    return [
      { label: '总工单数', value: total.toString(), unit: '份', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: '待处理', value: pending.toString(), unit: '份', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: '执行中', value: inProgress.toString(), unit: '份', icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: '已完成', value: completed.toString(), unit: '份', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  }, [allOrders]);

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
                      order.status === 'Risk' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {order.status === 'Completed' ? <CheckCircle2 size={12} /> : 
                       order.status === 'In Progress' ? <Clock size={12} className="animate-pulse" /> : 
                       order.status === 'Delayed' ? <AlertTriangle size={12} /> : 
                       order.status === 'Risk' ? <AlertTriangle size={12} className="animate-pulse" /> :
                       <Clock size={12} />}
                      {order.status === 'Completed' ? '已完成' : 
                       order.status === 'In Progress' ? '执行中' : 
                       order.status === 'Delayed' ? '已逾期' : 
                       order.status === 'Risk' ? '风险中' : '待处理'}
                      {order.status === 'Completed' && order.source === 'AI' && system_state?.acceptance_status === 'passed' && (
                        <span className="ml-1 text-[8px] bg-emerald-100 text-emerald-700 px-1 rounded">已验收</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${order.source === 'AI' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                        {order.source === 'AI' ? <Bot size={12} className="text-indigo-600" /> : <User size={12} className="text-slate-500" />}
                      </div>
                      <span className="text-sm text-slate-600">{order.assignee}</span>
                      {order.source === 'AI' && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1 rounded font-bold">AI</span>
                      )}
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
                            onClick={() => handleViewDetails(order)}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <FileText size={14} /> 查看详情
                          </button>
                          <button 
                            onClick={() => handleEditOrder(order)}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center gap-2"
                          >
                            <Plus size={14} className="rotate-45" /> 编辑工单
                          </button>
                          <button 
                            onClick={() => handleMarkComplete(order)}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle2 size={14} /> 标记完成
                          </button>
                          <div className="h-px bg-slate-50 my-1" />
                          <button 
                            onClick={() => handleCancelOrder(order)}
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
          <div>显示 {filteredOrders.length} 条记录，共 {allOrders.length} 条</div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50" disabled>上一页</button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50">下一页</button>
          </div>
        </div>
      </Card>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg ${
                    selectedOrder.type === 'Cleaning' ? 'bg-blue-600 shadow-blue-100' : 
                    selectedOrder.type === 'Inspection' ? 'bg-indigo-600 shadow-indigo-100' : 'bg-amber-600 shadow-amber-100'
                  }`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">工单详情</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.id}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">工单名称</div>
                    <div className="text-sm font-bold text-slate-900">{selectedOrder.name}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">工单类型</div>
                    <div className="text-sm font-bold text-slate-900">
                      {selectedOrder.type === 'Cleaning' ? '清洗工单' : 
                       selectedOrder.type === 'Inspection' ? '巡检工单' : '维修工单'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">优先级</div>
                    <div className="text-sm font-bold text-slate-900">{selectedOrder.priority}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">当前状态</div>
                    <div className="text-sm font-bold text-slate-900">{selectedOrder.status}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">执行人</div>
                    <div className="text-sm font-bold text-slate-900">{selectedOrder.assignee}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">所属电站</div>
                    <div className="text-sm font-bold text-slate-900">{selectedOrder.station}</div>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">任务描述</div>
                  <div className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
                    {selectedOrder.description || '暂无详细描述'}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <Bot size={20} className="text-indigo-600" />
                  <div className="text-[10px] text-indigo-700 leading-relaxed">
                    该工单由 {selectedOrder.source === 'AI' ? 'AI 智能引擎' : '人工'} 创建于 {selectedOrder.createdAt}。
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>关闭</Button>
                {selectedOrder.status !== 'Completed' && (
                  <Button onClick={() => handleMarkComplete(selectedOrder)}>标记完成</Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                    {editingOrder ? <FileText size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{editingOrder ? '编辑工单' : '新建工单'}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{editingOrder ? `正在修改工单 ${editingOrder.id}` : '系统将自动生成工单编号与创建时间'}</p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowCreateModal(false); setEditingOrder(null); }}
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">工单类型</label>
                    <select 
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="Cleaning">清洗工单</option>
                      <option value="Inspection">巡检工单</option>
                      <option value="Repair">维修工单</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500">所属电站</label>
                    <select 
                      value={formData.station}
                      onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
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
                      value={formData.deviceName}
                      onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
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
                        value={formData.assignee}
                        onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
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
                          onClick={() => setFormData({ ...formData, priority: p as any })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                            formData.priority === p 
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
                        value={formData.expectedCompletion}
                        onChange={(e) => setFormData({ ...formData, expectedCompletion: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500">任务描述</label>
                    <textarea 
                      rows={3}
                      placeholder="请详细描述工单任务内容..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
                    />
                  </div>
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-3">
                  <Bot size={20} className="text-blue-600 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-blue-900">Liangzai 智能助手</div>
                    <p className="text-[10px] text-blue-700 mt-1 leading-relaxed">
                      检测到您正在为“{formData.station}”{editingOrder ? '修改' : '创建'}工单。该区域目前有3个待处理告警，建议在任务描述中补充相关告警信息，以便运维人员快速定位。
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingOrder(null); }}>取消</Button>
                <Button 
                  className="px-8"
                  onClick={handleSubmit}
                >
                  {editingOrder ? '保存修改' : '提交工单'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
