import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { useGlobalStore } from '../../store/GlobalStore';
import { useNavigate } from 'react-router-dom';

export const Topbar: React.FC = () => {
  const { state, dispatch } = useGlobalStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Search / Breadcrumb Placeholder */}
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="全局搜索..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200 mx-1"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{state.currentUserRole}</p>
            <p className="text-xs text-gray-500">Auxenta Corp</p>
          </div>
          <button 
            onClick={handleLogout}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
            title="Logout"
          >
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
