import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Network, 
  Database, 
  BrainCircuit, 
  Tags, 
  Settings, 
  Building2, 
  Briefcase, 
  Sprout, 
  Plane, 
  Zap, 
  Shield, 
  ClipboardList,
  ChevronDown,
  ChevronUp,
  Ticket,
  PieChart,
  AlertCircle
} from 'lucide-react';
import { useGlobalStore } from '../../store/GlobalStore';
import { PowerOpsSubModule, LowAltitudeSubModule } from '../../types';

export const Sidebar: React.FC = () => {
  const { state, dispatch } = useGlobalStore();
  const { currentUserRole } = state;
  const location = useLocation();
  const navigate = useNavigate();
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = React.useState(false);
  
  // Initialize activeScenarioId from URL
  const [activeScenarioId, setActiveScenarioId] = React.useState(() => {
    const pathParts = window.location.pathname.split('/');
    const scenarioId = pathParts[pathParts.length - 1];
    const validScenarios = ['powerops', 'lowaltitudeops', 'ruralops', 'policeops', 'govpmo'];
    return validScenarios.includes(scenarioId) ? scenarioId : 'powerops';
  });

  // Sync activeScenarioId with URL changes
  React.useEffect(() => {
    const pathParts = location.pathname.split('/');
    const scenarioId = pathParts[pathParts.length - 1];
    const validScenarios = ['powerops', 'lowaltitudeops', 'ruralops', 'policeops', 'govpmo'];
    if (validScenarios.includes(scenarioId) && scenarioId !== activeScenarioId) {
      setActiveScenarioId(scenarioId);
    }
  }, [location.pathname, activeScenarioId]);

  const scenarios = [
    { 
      id: 'powerops', 
      to: '/app/scenario/powerops', 
      icon: Zap, 
      label: '电力能源',
      subModules: [
        { id: 'HOME', name: '首页', icon: LayoutDashboard },
        { id: 'ASSETS', name: '资产台账', icon: Database },
        { id: 'TICKETS', name: '工单中心', icon: Ticket },
        { id: 'REPORTS', name: '报告中心', icon: PieChart },
      ]
    },
    { 
      id: 'lowaltitudeops', 
      to: '/app/scenario/lowaltitudeops', 
      icon: Plane, 
      label: '低空智航',
      subModules: [
        { id: 'SITUATION_OVERVIEW', name: '态势总览', icon: LayoutDashboard },
        { id: 'TASK_CENTER', name: '任务中心', icon: ClipboardList },
        { id: 'EVENT_CENTER', name: '事件中心', icon: AlertCircle },
        { id: 'ALGORITHM_CENTER', name: '算法中心', icon: BrainCircuit },
        { id: 'OPERATIONS_CENTER', name: '运营中心', icon: Settings },
      ]
    },
    { id: 'ruralops', to: '/app/scenario/ruralops', icon: Sprout, label: '商业运营' },
    { id: 'policeops', to: '/app/scenario/policeops', icon: Shield, label: '智慧警务' },
    { id: 'govpmo', to: '/app/scenario/govpmo', icon: ClipboardList, label: '政务督办' },
  ];

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  const menuGroups = [
    {
      title: '底座核心',
      items: [
        { to: '/app/knowledge-graph', icon: Network, label: '知识引擎' },
        { to: '/app/data-hub', icon: Database, label: '数据沉淀' },
        { to: '/app/reasoning-engine', icon: BrainCircuit, label: '推理引擎' },
      ]
    },
    {
      title: '资源库',
      items: [
        { to: '/app/resource/enterprises', icon: Building2, label: '企业库' },
        { to: '/app/tag-center', icon: Tags, label: '标签库' },
        { to: '/app/case-library', icon: Briefcase, label: '案例库' },
        { to: '/app/knowledge-library', icon: Database, label: '知识库' },
      ]
    },
    {
      title: '系统',
      items: [
        { to: '/app/settings', icon: Settings, label: '设置' },
      ]
    }
  ];

  const handleScenarioSelect = (scenario: any) => {
    setActiveScenarioId(scenario.id);
    setIsScenarioDropdownOpen(false);
    navigate(scenario.to);
    // Reset sub-module to HOME when switching scenarios
    dispatch({ type: 'SET_POWEROPS_SUBMODULE', payload: 'HOME' });
  };

  const handleSubModuleClick = (scenario: any, subId: string) => {
    if (location.pathname !== scenario.to) {
      navigate(scenario.to);
    }
    if (scenario.id === 'powerops') {
      dispatch({ type: 'SET_POWEROPS_SUBMODULE', payload: subId as PowerOpsSubModule });
    } else if (scenario.id === 'lowaltitudeops') {
      dispatch({ type: 'SET_LOWALTITUDE_SUBMODULE', payload: subId as LowAltitudeSubModule });
    }
  };

  const isSubModuleActive = (scenarioId: string, subId: string) => {
    if (!location.pathname.includes(scenarioId)) return false;
    if (scenarioId === 'powerops') return state.powerOpsSubModule === subId;
    if (scenarioId === 'lowaltitudeops') return state.lowAltitudeSubModule === subId;
    return false;
  };

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col border-r border-slate-800 shrink-0">
      {/* Logo Area */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
          <span className="font-bold text-lg">A</span>
        </div>
        <span className="font-bold text-lg tracking-tight">Auxenta</span>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
        {/* Scenario Selector Dropdown */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            场景包
          </h3>
          <div className="relative px-1">
            <button
              onClick={() => setIsScenarioDropdownOpen(!isScenarioDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <activeScenario.icon size={18} className="text-blue-400" />
                <span className="text-sm font-bold text-slate-200">{activeScenario.label}</span>
              </div>
              {isScenarioDropdownOpen ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
            </button>

            {isScenarioDropdownOpen && (
              <div className="absolute top-full left-1 right-1 mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleScenarioSelect(s)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-slate-700/50 ${
                      activeScenarioId === s.id ? 'text-blue-400 bg-blue-600/5' : 'text-slate-400'
                    }`}
                  >
                    <s.icon size={16} />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Scenario Sub-menus (一级菜单) */}
        {activeScenario.subModules && (
          <div className="space-y-1">
            {activeScenario.subModules.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubModuleClick(activeScenario, sub.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isSubModuleActive(activeScenario.id, sub.id)
                    ? 'bg-blue-600/10 text-blue-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <sub.icon size={18} />
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Global Menu Groups */}
        {menuGroups.map((group, idx) => (
          <div key={idx}>
            <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item: any) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* User Profile Snippet */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium">
            {currentUserRole?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{currentUserRole || 'Guest'}</p>
            <p className="text-xs text-slate-500 truncate">Online</p>
          </div>
        </div>
      </div>
    </div>
  );
};
