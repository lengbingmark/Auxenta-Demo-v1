import React from 'react';
import { useGlobalStore } from '../../store/GlobalStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Search, 
  Filter, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  MoreHorizontal,
  ArrowUpDown,
  XCircle,
  MapPin,
  Zap,
  Battery,
  User,
  Clock,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Asset {
  id: string;
  stationName: string;
  deviceType: string;
  healthScore: number;
  status: string;
  owner: string;
  lastMaintenance: string;
  installDate: string;
  runtime: string;
  lastInspection: string;
  history: { date: string; type: string; desc: string }[];
}

const mockAssets: Asset[] = [
  { id: 'ASSET-001', stationName: 'XX光伏电站-A区', deviceType: '逆变器', healthScore: 98, status: 'Normal', owner: '张工', lastMaintenance: '2024-03-01', installDate: '2022-05-12', runtime: '12,450h', lastInspection: '2024-03-08', history: [{ date: '2024-03-01', type: '维护', desc: '例行季度维护完成' }] },
  { id: 'ASSET-002', stationName: 'XX光伏电站-B区', deviceType: '汇流箱', healthScore: 82, status: 'Warning', owner: '李工', lastMaintenance: '2024-02-15', installDate: '2022-06-20', runtime: '11,200h', lastInspection: '2024-03-07', history: [{ date: '2024-02-15', type: '异常', desc: '通讯模块信号波动' }] },
  { id: 'ASSET-003', stationName: 'XX光伏电站-C区', deviceType: '变压器', healthScore: 95, status: 'Normal', owner: '王工', lastMaintenance: '2024-03-05', installDate: '2021-11-10', runtime: '18,900h', lastInspection: '2024-03-05', history: [{ date: '2024-03-05', type: '维护', desc: '绝缘油抽样检测合格' }] },
  { id: 'ASSET-004', stationName: 'XX光伏电站-B区', deviceType: '逆变器', healthScore: 45, status: 'Error', owner: '张工', lastMaintenance: '2024-01-20', installDate: '2022-06-20', runtime: '10,800h', lastInspection: '2024-03-09', history: [{ date: '2024-03-09', type: '故障', desc: 'IGBT模块过温保护触发' }] },
  { id: 'ASSET-005', stationName: 'YY风力电站-1号机', deviceType: '风机叶片', healthScore: 92, status: 'Normal', owner: '赵工', lastMaintenance: '2024-02-28', installDate: '2023-01-15', runtime: '8,200h', lastInspection: '2024-02-28', history: [{ date: '2024-02-28', type: '维护', desc: '叶片表面清洗与裂纹探伤' }] },
  { id: 'ASSET-006', stationName: 'YY风力电站-2号机', deviceType: '发电机', healthScore: 88, status: 'Normal', owner: '钱工', lastMaintenance: '2024-03-02', installDate: '2023-01-15', runtime: '7,900h', lastInspection: '2024-03-02', history: [] },
  { id: 'ASSET-007', stationName: 'ZZ储能电站', deviceType: '电池簇', healthScore: 78, status: 'Warning', owner: '孙工', lastMaintenance: '2024-02-10', installDate: '2023-08-05', runtime: '3,500h', lastInspection: '2024-03-06', history: [{ date: '2024-02-10', type: '维护', desc: '电芯均衡度校准' }] },
  { id: 'ASSET-008', stationName: 'XX光伏电站-A区', deviceType: '气象站', healthScore: 100, status: 'Normal', owner: '周工', lastMaintenance: '2024-03-08', installDate: '2022-05-12', runtime: '15,600h', lastInspection: '2024-03-08', history: [] },
  { id: 'ASSET-009', stationName: 'XX光伏电站-A区', deviceType: '无人机', healthScore: 94, status: 'Normal', owner: '吴工', lastMaintenance: '2024-03-07', installDate: '2023-10-10', runtime: '450h', lastInspection: '2024-03-07', history: [] },
  { id: 'ASSET-010', stationName: 'XX光伏电站-B区', deviceType: '清洗机器人', healthScore: 72, status: 'Warning', owner: '郑工', lastMaintenance: '2024-02-25', installDate: '2023-11-01', runtime: '820h', lastInspection: '2024-03-09', history: [{ date: '2024-02-25', type: '维护', desc: '履带更换与电机润滑' }] },
  { id: 'ASSET-011', stationName: 'YY风力电站-3号机', deviceType: '齿轮箱', healthScore: 85, status: 'Normal', owner: '冯工', lastMaintenance: '2024-02-20', installDate: '2023-01-15', runtime: '8,500h', lastInspection: '2024-02-20', history: [] },
  { id: 'ASSET-012', stationName: 'ZZ储能电站', deviceType: 'PCS逆变器', healthScore: 96, status: 'Normal', owner: '陈工', lastMaintenance: '2024-03-04', installDate: '2023-08-05', runtime: '3,800h', lastInspection: '2024-03-04', history: [] },
  { id: 'ASSET-013', stationName: 'XX光伏电站-A区', deviceType: '汇流箱', healthScore: 91, status: 'Normal', owner: '褚工', lastMaintenance: '2024-03-02', installDate: '2022-05-12', runtime: '12,100h', lastInspection: '2024-03-02', history: [] },
  { id: 'ASSET-014', stationName: 'XX光伏电站-B区', deviceType: '巡检机器人', healthScore: 89, status: 'Normal', owner: '卫工', lastMaintenance: '2024-03-06', installDate: '2023-12-15', runtime: '320h', lastInspection: '2024-03-06', history: [] },
  { id: 'ASSET-015', stationName: 'YY风力电站-4号机', deviceType: '变频器', healthScore: 76, status: 'Warning', owner: '蒋工', lastMaintenance: '2024-02-12', installDate: '2023-01-15', runtime: '8,100h', lastInspection: '2024-03-05', history: [{ date: '2024-02-12', type: '维护', desc: '散热风扇更换' }] },
  { id: 'ASSET-016', stationName: 'ZZ储能电站', deviceType: '电池簇', healthScore: 93, status: 'Normal', owner: '郑工', lastMaintenance: '2024-03-02', installDate: '2023-08-05', runtime: '3,600h', lastInspection: '2024-03-02', history: [] },
  { id: 'ASSET-017', stationName: 'XX光伏电站-C区', deviceType: '逆变器', healthScore: 88, status: 'Normal', owner: '冯工', lastMaintenance: '2024-03-01', installDate: '2021-11-10', runtime: '19,200h', lastInspection: '2024-03-01', history: [] },
  { id: 'ASSET-018', stationName: 'YY风力电站-1号机', deviceType: '变压器', healthScore: 94, status: 'Normal', owner: '陈工', lastMaintenance: '2024-03-05', installDate: '2023-01-15', runtime: '8,400h', lastInspection: '2024-03-05', history: [] },
  { id: 'ASSET-019', stationName: 'XX光伏电站-A区', deviceType: '汇流箱', healthScore: 68, status: 'Warning', owner: '褚工', lastMaintenance: '2024-02-20', installDate: '2022-05-12', runtime: '12,300h', lastInspection: '2024-03-09', history: [{ date: '2024-02-20', type: '异常', desc: '支路电流采集偏低' }] },
  { id: 'ASSET-020', stationName: 'ZZ储能电站', deviceType: 'PCS逆变器', healthScore: 97, status: 'Normal', owner: '卫工', lastMaintenance: '2024-03-08', installDate: '2023-08-05', runtime: '3,950h', lastInspection: '2024-03-08', history: [] },
];

export const AssetLedger: React.FC = () => {
  const { state } = useGlobalStore();
  const system_state = state?.system_state;
  const [filterStatus, setFilterStatus] = React.useState<string>('All');
  const [filterStation, setFilterStation] = React.useState<string>('All');
  const [filterType, setFilterType] = React.useState<string>('All');
  const [filterScore, setFilterScore] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [activeKpiModal, setActiveKpiModal] = React.useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = React.useState<Asset | null>(null);
  const [showActionMenu, setShowActionMenu] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  const assets = React.useMemo(() => {
    return mockAssets.map(asset => {
      if (asset.id === 'ASSET-001') {
        let status = asset.status;
        let score = asset.healthScore;

        // Apply rules based on system_state (Step 2-B Integration)
        // 1. AI诊断完成 (diagnosis_result = shading)
        if (system_state?.diagnosis_result === 'shading') {
          status = 'Error'; // Displayed as '异常'
          score = 45;
        }
        // 2. 任务执行开始 (task_status = running)
        if (system_state?.task_status === 'running') {
          status = '维修处理中';
          score = 70;
        }
        // 3. 风险触发 (risk_status = warning)
        if (system_state?.risk_status === 'warning') {
          status = '风险监测';
          score = 55;
        }
        // 4. 任务完成 (task_status = completed)
        if (system_state?.task_status === 'completed') {
          status = '已恢复';
          score = 92;
        }

        return { ...asset, status, healthScore: score };
      }
      return asset;
    });
  }, [system_state]);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterStation, filterType, filterScore, searchTerm]);

  const filteredAssets = assets.filter(asset => {
    const matchesStatus = filterStatus === 'All' || 
      asset.status === filterStatus || 
      (filterStatus === 'Normal' && asset.status === '已恢复') ||
      (filterStatus === 'Warning' && (asset.status === '维修处理中' || asset.status === '风险监测')) ||
      (filterStatus === 'Error' && (asset.status === '异常设备' || asset.status === 'Error'));
    const matchesStation = filterStation === 'All' || asset.stationName === filterStation;
    const matchesType = filterType === 'All' || asset.deviceType === filterType;
    const matchesScore = filterScore === 'All' || (
      filterScore === '90+' ? asset.healthScore >= 90 :
      filterScore === '70-90' ? (asset.healthScore >= 70 && asset.healthScore < 90) :
      asset.healthScore < 70
    );
    const matchesSearch = 
      asset.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.stationName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.deviceType.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesStation && matchesType && matchesScore && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAssets.length / pageSize);
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const kpis = React.useMemo(() => {
    const baseAbnormal = 5;
    const isAsset001Abnormal = assets.find(a => a.id === 'ASSET-001')?.status === 'Error';
    const displayAbnormal = isAsset001Abnormal ? baseAbnormal + 1 : baseAbnormal;

    return [
      { label: '电站数量', value: '12', unit: '座', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: '设备总数', value: '238', unit: '台', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: '在线设备率', value: '97', unit: '%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: '异常设备', value: displayAbnormal.toString(), unit: '台', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];
  }, [assets]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <Card 
            key={i} 
            className="p-6 border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer hover:ring-2 hover:ring-blue-500/20 group"
            onClick={() => setActiveKpiModal(kpi.label)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <kpi.icon size={24} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">实时监测</span>
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-bold text-slate-900">资产明细台账</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="text" 
                  placeholder="搜索资产编号、电站或设备..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-64"
                />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter size={16} /> 导出
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">电站筛选</label>
              <select 
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部电站</option>
                <option value="XX光伏电站-A区">XX光伏电站-A区</option>
                <option value="XX光伏电站-B区">XX光伏电站-B区</option>
                <option value="YY风力电站-1号机">YY风力电站</option>
                <option value="ZZ储能电站">ZZ储能电站</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">设备类型</label>
              <select 
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部类型</option>
                <option value="逆变器">逆变器</option>
                <option value="变压器">变压器</option>
                <option value="汇流箱">汇流箱</option>
                <option value="无人机">无人机</option>
                <option value="清洗机器人">清洗机器人</option>
                <option value="巡检机器人">巡检机器人</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">运行状态</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部状态</option>
                <option value="Normal">正常</option>
                <option value="Warning">警告</option>
                <option value="Error">异常</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">健康评分</label>
              <select 
                value={filterScore}
                onChange={(e) => setFilterScore(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <option value="All">全部评分</option>
                <option value="90+">90以上</option>
                <option value="70-90">70-90</option>
                <option value="70-">70以下</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-50">
                <th className="px-6 py-4">资产编号</th>
                <th className="px-6 py-4">所属场站</th>
                <th className="px-6 py-4">设备类型</th>
                <th className="px-6 py-4 flex items-center gap-1">
                  健康评分 <ArrowUpDown size={12} />
                </th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">责任人</th>
                <th className="px-6 py-4">最后维护时间</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/50 transition-colors group relative">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{asset.id}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{asset.stationName}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{asset.deviceType}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            asset.healthScore > 90 ? 'bg-emerald-500' : 
                            asset.healthScore > 70 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${asset.healthScore}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${
                        asset.healthScore > 90 ? 'text-emerald-600' : 
                        asset.healthScore > 70 ? 'text-amber-600' : 'text-red-600'
                      }`}>{asset.healthScore}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                      (asset.status === 'Normal' || asset.status === '已恢复') ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      (asset.status === 'Warning' || asset.status === '维修处理中' || asset.status === '风险监测') ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-red-50 text-red-600 border-red-100'
                    }`}>
                      {(asset.status === 'Normal' || asset.status === '已恢复') ? <CheckCircle2 size={12} /> : 
                       (asset.status === 'Warning' || asset.status === '维修处理中' || asset.status === '风险监测') ? <AlertTriangle size={12} /> : <AlertCircle size={12} />}
                      {asset.status === 'Normal' ? '正常' : 
                       asset.status === 'Warning' ? '警告' : 
                       asset.status === 'Error' ? '异常' : asset.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                        {asset.owner.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{asset.owner}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">{asset.lastMaintenance}</td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={() => setShowActionMenu(showActionMenu === asset.id ? null : asset.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {showActionMenu === asset.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowActionMenu(null)} />
                        <div className="absolute right-6 top-12 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button 
                            onClick={() => { setSelectedAsset(asset); setShowActionMenu(null); }}
                            className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                          >
                            查看详情
                          </button>
                          <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                            设备历史
                          </button>
                          <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                            创建工单
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
          <div>显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, filteredAssets.length)} 条记录，共 {filteredAssets.length} 条</div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              上一页
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-lg transition-all ${
                  currentPage === page 
                    ? 'bg-blue-600 text-white' 
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              下一页
            </button>
          </div>
        </div>
      </Card>

      {/* Asset Details Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">资产详情: {selectedAsset.id}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedAsset.stationName} · {selectedAsset.deviceType}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                >
                  <XCircle size={28} />
                </button>
              </div>

              <div className="flex-1 overflow-auto p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Basic Info */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">基本信息</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">安装时间</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAsset.installDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">运行状态</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          (selectedAsset.status === 'Normal' || selectedAsset.status === '已恢复') ? 'bg-emerald-50 text-emerald-600' :
                          (selectedAsset.status === 'Warning' || selectedAsset.status === '维修处理中' || selectedAsset.status === '风险监测') ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                        }`}>
                          {selectedAsset.status === 'Normal' ? '正常' : 
                           selectedAsset.status === 'Warning' ? '警告' : 
                           selectedAsset.status === 'Error' ? '异常' : selectedAsset.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">健康评分</span>
                        <span className={`text-sm font-black ${
                          selectedAsset.healthScore > 90 ? 'text-emerald-600' : 
                          selectedAsset.healthScore > 70 ? 'text-amber-600' : 'text-red-600'
                        }`}>{selectedAsset.healthScore}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">责任人</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAsset.owner}</span>
                      </div>
                    </div>
                  </div>

                  {/* Running Data */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">运行数据</h4>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">累计运行时间</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAsset.runtime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">最近巡检时间</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAsset.lastInspection}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold">最近维护时间</span>
                        <span className="text-xs font-bold text-slate-700">{selectedAsset.lastMaintenance}</span>
                      </div>
                    </div>
                  </div>

                  {/* History */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
                      <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">历史记录</h4>
                    </div>
                    <div className="space-y-4">
                      {selectedAsset.history.length > 0 ? selectedAsset.history.map((h, i) => (
                        <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center mb-1">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                              h.type === '故障' ? 'bg-red-100 text-red-600' :
                              h.type === '异常' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                            }`}>{h.type}</span>
                            <span className="text-[10px] text-slate-400 font-bold">{h.date}</span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{h.desc}</p>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-slate-400 text-xs italic">暂无历史记录</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedAsset(null)}>关闭</Button>
                <Button className="px-8">导出报告</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* KPI Details Modals */}
      <AnimatePresence>
        {activeKpiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    {activeKpiModal === '电站数量' && <Database size={24} />}
                    {activeKpiModal === '设备总数' && <Activity size={24} />}
                    {activeKpiModal === '在线设备率' && <CheckCircle2 size={24} />}
                    {activeKpiModal === '异常设备' && <AlertCircle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {activeKpiModal === '电站数量' && '电站资产列表'}
                      {activeKpiModal === '设备总数' && '设备资产列表'}
                      {activeKpiModal === '在线设备率' && '设备在线状态'}
                      {activeKpiModal === '异常设备' && '异常设备列表'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {activeKpiModal === '电站数量' && '展示所有在管光伏与风力电站基础运行数据'}
                      {activeKpiModal === '设备总数' && '包含装机生产设备与运维辅助设备'}
                      {activeKpiModal === '在线设备率' && '实时监测设备通讯链路与在线健康度'}
                      {activeKpiModal === '异常设备' && '当前系统中存在告警或故障的设备明细'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setActiveKpiModal(null)}
                  className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-100 rounded-full"
                >
                  <XCircle size={28} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-auto p-8">
                {activeKpiModal === '电站数量' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="px-4 py-3">电站编号</th>
                          <th className="px-4 py-3">电站名称</th>
                          <th className="px-4 py-3">地理位置</th>
                          <th className="px-4 py-3">装机容量</th>
                          <th className="px-4 py-3">健康评分</th>
                          <th className="px-4 py-3">今日发电</th>
                          <th className="px-4 py-3">今日收益</th>
                          <th className="px-4 py-3">月度收益</th>
                          <th className="px-4 py-3">运行状态</th>
                          <th className="px-4 py-3">最后巡检</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { id: 'PS-001', name: '宁夏银川光伏电站', loc: '宁夏银川', cap: '120MW', score: 92, gen: '128.6MWh', daily: '¥98,240', monthly: '¥2,340,000', status: '正常', last: '2026-03-08' },
                          { id: 'PS-002', name: '青海格尔木光伏电站', loc: '青海格尔木', cap: '80MW', score: 87, gen: '94.3MWh', daily: '¥72,110', monthly: '¥1,820,000', status: '预警', last: '2026-03-07' },
                          { id: 'PS-003', name: '内蒙古乌兰察布光伏电站', loc: '内蒙古乌兰察布', cap: '95MW', score: 90, gen: '110.2MWh', daily: '¥83,200', monthly: '¥2,050,000', status: '正常', last: '2026-03-08' },
                          { id: 'PS-004', name: '甘肃酒泉新能源电站', loc: '甘肃酒泉', cap: '140MW', score: 91, gen: '150.5MWh', daily: '¥112,300', monthly: '¥2,780,000', status: '正常', last: '2026-03-09' },
                          { id: 'PS-005', name: '新疆哈密新能源电站', loc: '新疆哈密', cap: '130MW', score: 88, gen: '142.8MWh', daily: '¥108,450', monthly: '¥2,650,000', status: '正常', last: '2026-03-08' },
                          { id: 'PS-006', name: '江苏盐城分布式电站', loc: '江苏盐城', cap: '60MW', score: 85, gen: '66.3MWh', daily: '¥49,210', monthly: '¥1,210,000', status: '预警', last: '2026-03-06' },
                          { id: 'PS-007', name: '山东东营新能源电站', loc: '山东东营', cap: '90MW', score: 93, gen: '102.4MWh', daily: '¥77,600', monthly: '¥1,960,000', status: '正常', last: '2026-03-09' },
                          { id: 'PS-008', name: '河北张北新能源电站', loc: '河北张北', cap: '110MW', score: 89, gen: '121.5MWh', daily: '¥91,500', monthly: '¥2,210,000', status: '正常', last: '2026-03-08' },
                          { id: 'PS-009', name: '陕西榆林新能源电站', loc: '陕西榆林', cap: '85MW', score: 86, gen: '97.6MWh', daily: '¥72,880', monthly: '¥1,780,000', status: '正常', last: '2026-03-07' },
                          { id: 'PS-010', name: '山西大同光伏电站', loc: '山西大同', cap: '75MW', score: 90, gen: '84.5MWh', daily: '¥64,500', monthly: '¥1,650,000', status: '正常', last: '2026-03-08' },
                          { id: 'PS-011', name: '青海德令哈光伏电站', loc: '青海德令哈', cap: '100MW', score: 91, gen: '113.8MWh', daily: '¥85,900', monthly: '¥2,030,000', status: '正常', last: '2026-03-09' },
                          { id: 'PS-012', name: '宁夏中卫光伏电站', loc: '宁夏中卫', cap: '115MW', score: 92, gen: '127.4MWh', daily: '¥96,800', monthly: '¥2,280,000', status: '正常', last: '2026-03-08' }
                        ].map((ps) => (
                          <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-4 text-xs font-mono text-slate-500">{ps.id}</td>
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">{ps.name}</td>
                            <td className="px-4 py-4 text-sm text-slate-600 flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" />{ps.loc}</td>
                            <td className="px-4 py-4 text-sm font-medium text-slate-700">{ps.cap}</td>
                            <td className="px-4 py-4">
                              <span className={`text-sm font-bold ${ps.score > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{ps.score}</span>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-900 font-bold">{ps.gen}</td>
                            <td className="px-4 py-4 text-sm text-emerald-600 font-bold">{ps.daily}</td>
                            <td className="px-4 py-4 text-sm text-blue-600 font-bold">{ps.monthly}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ps.status === '正常' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                {ps.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-xs text-slate-400">{ps.last}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeKpiModal === '设备总数' && (
                  <div className="space-y-8">
                    {/* 分类统计 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-6 bg-blue-50/30 border-blue-100">
                        <div className="text-sm font-bold text-blue-900 mb-4 flex items-center gap-2">
                          <Zap size={18} /> 装机设备 (208台)
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">逆变器</div>
                            <div className="text-xl font-black text-slate-900">120 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">汇流箱</div>
                            <div className="text-xl font-black text-slate-900">60 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">变压器</div>
                            <div className="text-xl font-black text-slate-900">18 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">监测设备</div>
                            <div className="text-xl font-black text-slate-900">10 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                        </div>
                      </Card>
                      <Card className="p-6 bg-indigo-50/30 border-indigo-100">
                        <div className="text-sm font-bold text-indigo-900 mb-4 flex items-center gap-2">
                          <Settings size={18} /> 运维设备 (30台)
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">无人机</div>
                            <div className="text-xl font-black text-slate-900">8 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">清洗机器人</div>
                            <div className="text-xl font-black text-slate-900">12 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">巡检机器人</div>
                            <div className="text-xl font-black text-slate-900">6 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                          <div className="space-y-1">
                            <div className="text-[10px] text-slate-400 font-bold uppercase">巡逻车</div>
                            <div className="text-xl font-black text-slate-900">4 <span className="text-xs font-normal text-slate-400">台</span></div>
                          </div>
                        </div>
                      </Card>
                    </div>

                    {/* 装机设备 */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
                        <h4 className="text-base font-bold text-slate-900">装机设备示例</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'INV-A01', type: '逆变器', station: 'XX光伏电站-A区', score: 88, status: '正常', runtime: '1280小时', last: '2026-02-10' },
                          { id: 'TR-02', type: '变压器', station: 'XX光伏电站-B区', score: 91, status: '正常', runtime: '-', last: '2026-02-18' }
                        ].map((dev) => (
                          <div key={dev.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                <Zap size={20} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{dev.id} <span className="text-xs font-normal text-slate-400 ml-2">{dev.type}</span></div>
                                <div className="text-xs text-slate-500 mt-0.5">{dev.station}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-emerald-600 mb-1">{dev.status}</div>
                              <div className="text-[10px] text-slate-400">维护: {dev.last}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 运维设备 */}
                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
                        <h4 className="text-base font-bold text-slate-900">运维设备示例</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'UAV-03', type: '无人机', station: 'XX光伏电站-A区', status: '待命', battery: '93%', last: '2026-03-07' },
                          { id: 'RB-02', type: '清洗机器人', station: 'XX光伏电站-B区', status: '维护中', battery: '-', last: '2026-02-25' }
                        ].map((dev) => (
                          <div key={dev.id} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                {dev.type === '无人机' ? <MapPin size={20} /> : <Settings size={20} />}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{dev.id} <span className="text-xs font-normal text-slate-400 ml-2">{dev.type}</span></div>
                                <div className="text-xs text-slate-500 mt-0.5">{dev.station}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-bold mb-1 ${dev.status === '待命' ? 'text-emerald-600' : 'text-amber-600'}`}>{dev.status}</div>
                              <div className="text-[10px] text-slate-400">{dev.battery !== '-' ? `电量: ${dev.battery}` : `最近维护: ${dev.last}`}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeKpiModal === '在线设备率' && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { name: 'XX光伏电站-A区', total: 48, online: 47, offline: 1, rate: '97.9%' },
                        { name: 'XX光伏电站-B区', total: 52, online: 50, offline: 2, rate: '96.1%' },
                        { name: 'XX光伏电站-C区', total: 36, online: 35, offline: 1, rate: '97.2%' },
                        { name: 'YY风力电站', total: 28, online: 27, offline: 1, rate: '96.4%' },
                        { name: '宁夏光伏电站', total: 74, online: 72, offline: 2, rate: '97.3%' }
                      ].map((site, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="text-sm font-bold text-slate-900 mb-2">{site.name}</div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase">在线率</span>
                            <span className="text-sm font-black text-emerald-600">{site.rate}</span>
                          </div>
                          <div className="flex items-center gap-3 text-[10px] font-bold">
                            <span className="text-slate-500">总数: {site.total}</span>
                            <span className="text-emerald-600">在线: {site.online}</span>
                            <span className="text-red-600">离线: {site.offline}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                          <CheckCircle2 size={32} />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">全站汇总统计</h4>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs text-slate-500">设备总数: <span className="font-bold text-slate-900">238</span></span>
                            <span className="text-xs text-slate-500">在线设备: <span className="font-bold text-emerald-600">231</span></span>
                            <span className="text-xs text-slate-500">离线设备: <span className="font-bold text-red-600">7</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-emerald-600">97%</div>
                        <div className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">综合在线率</div>
                      </div>
                    </div>

                    <section>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-1.5 h-4 bg-red-600 rounded-full" />
                        <h4 className="text-base font-bold text-slate-900">离线设备列表</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { id: 'INV-A08', type: '逆变器', station: 'XX光伏电站-A区', reason: '通讯模块异常', advice: '重启设备' },
                          { id: 'RB-02', type: '清洗机器人', station: 'XX光伏电站-B区', reason: '电池故障', advice: '更换电池' },
                          { id: 'UAV-05', type: '巡检无人机', station: '宁夏光伏电站', reason: '维护中', advice: '等待维护完成' },
                          { id: 'TR-06', type: '变压器', station: 'XX光伏电站-C区', reason: '监测模块异常', advice: '现场核查' },
                          { id: 'INV-A12', type: '逆变器', station: 'YY风力电站', reason: '通信链路故障', advice: '检查网关' },
                          { id: 'RB-04', type: '清洗机器人', station: '宁夏光伏电站', reason: '电池更换中', advice: '等待更换' },
                          { id: 'UAV-07', type: '无人机', station: 'XX光伏电站-B区', reason: '例行维护', advice: '等待维护完成' }
                        ].map((dev) => (
                          <div key={dev.id} className="p-5 border border-red-100 rounded-2xl bg-red-50/30 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-red-600 shadow-sm">
                                <AlertTriangle size={20} />
                              </div>
                              <div>
                                <div className="text-sm font-bold text-slate-900">{dev.id} <span className="text-xs font-normal text-slate-400 ml-2">{dev.type}</span></div>
                                <div className="text-[10px] text-slate-500 font-bold">{dev.station}</div>
                                <div className="text-xs text-red-600 mt-0.5">原因: {dev.reason}</div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] border-red-200 text-red-600 hover:bg-red-50">
                              {dev.advice}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeKpiModal === '异常设备' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
                          <th className="px-4 py-3">设备编号</th>
                          <th className="px-4 py-3">设备类型</th>
                          <th className="px-4 py-3">所属电站</th>
                          <th className="px-4 py-3">异常类型</th>
                          <th className="px-4 py-3">异常等级</th>
                          <th className="px-4 py-3">处理措施</th>
                          <th className="px-4 py-3">修复进度</th>
                          <th className="px-4 py-3">责任人</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { id: 'INV-A08', type: '逆变器', station: 'XX光伏电站-A区', error: '温度异常', level: '高', action: '已创建维修工单', progress: 60, owner: '张工' },
                          { id: 'RB-02', type: '清洗机器人', station: 'XX光伏电站-B区', error: '电池故障', level: '中', action: '更换电池', progress: 20, owner: '李工' },
                          { id: 'TR-B03', type: '变压器', station: 'XX光伏电站-B区', error: '油位过低', level: '高', action: '补充绝缘油', progress: 40, owner: '王工' },
                          { id: 'WTG-04', type: '风力发电机', station: 'YY风力电站-4号机', error: '振动过大', level: '中', action: '停机检查', progress: 10, owner: '蒋工' },
                          { id: 'BAT-C01', type: '电池簇', station: 'ZZ储能电站', error: '温差过大', level: '高', action: '均衡维护', progress: 80, owner: '孙工' }
                        ].map((dev) => (
                          <tr key={dev.id} className="hover:bg-red-50/30 transition-colors">
                            <td className="px-4 py-4 text-xs font-mono text-slate-500">{dev.id}</td>
                            <td className="px-4 py-4 text-sm font-bold text-slate-900">{dev.type}</td>
                            <td className="px-4 py-4 text-sm text-slate-600">{dev.station}</td>
                            <td className="px-4 py-4 text-sm text-red-600 font-bold">{dev.error}</td>
                            <td className="px-4 py-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${dev.level === '高' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                                {dev.level}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">{dev.action}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 w-16 bg-slate-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${dev.progress}%` }} />
                                </div>
                                <span className="text-xs font-bold text-slate-400">{dev.progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-900 flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                <User size={12} />
                              </div>
                              {dev.owner}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <Button onClick={() => setActiveKpiModal(null)} className="px-8">
                  关闭
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Data Source Footer */}
      <div className="flex items-center justify-center gap-6 py-4 border-t border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <Clock size={12} />
          数据更新时间：10分钟前
        </div>
        <div className="w-1 h-1 rounded-full bg-slate-200" />
        <div className="flex items-center gap-2">
          <Database size={12} />
          数据来源：SCADA监控系统
        </div>
      </div>
    </div>
  );
};
