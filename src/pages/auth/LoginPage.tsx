import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalStore } from '../../store/GlobalStore';
import { UserRole } from '../../types';
import { Shield, User, Users } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { dispatch } = useGlobalStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (role: UserRole) => {
    setIsLoading(true);
    // Simulate network delay
    setTimeout(() => {
      dispatch({ type: 'LOGIN', payload: role });
      navigate('/app/scenario/powerops');
      setIsLoading(false);
    }, 800);
  };

  const roles: { id: UserRole; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'ADMIN', label: '系统管理员', icon: Shield, desc: '拥有所有模块的完全访问权限' },
    { id: 'MANAGER', label: '业务主管', icon: Users, desc: '管理特定业务场景与数据审批' },
    { id: 'OPERATOR', label: '操作员', icon: User, desc: '负责日常数据录入与基础操作' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Branding */}
        <div className="bg-blue-600 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
              <span className="font-bold text-2xl">A</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">Auxenta</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              统一底座 + 可插拔场景包 + AI 副驾驶的行业智能增效系统。
            </p>
          </div>
          
          <div className="relative z-10 mt-12">
            <p className="text-sm text-blue-200">© 2026 Auxenta Inc. All rights reserved.</p>
          </div>

          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-600 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">欢迎登录</h2>
            <p className="text-gray-500 mt-2">请选择您的角色以进入演示系统</p>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleLogin(role.id)}
                disabled={isLoading}
                className="w-full flex items-start p-4 rounded-xl border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="bg-gray-100 p-3 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all text-gray-600 group-hover:text-blue-600">
                  <role.icon size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">{role.label}</h3>
                  <p className="text-sm text-gray-500 mt-1">{role.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {isLoading && (
            <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              正在进入系统...
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
