import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    localStorage.removeItem('auxenta_run');
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      const isScriptError = this.state.error?.message === 'Script error.';
      
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">系统遇到一点小问题</h1>
            <p className="text-slate-500 mb-8 leading-relaxed">
              {isScriptError 
                ? '第三方脚本加载失败（如高德地图）。这通常是由于网络波动或 API Key 限制导致的。' 
                : '很抱歉，当前页面加载失败。这可能是由于状态冲突或数据异常导致的。'}
            </p>
            
            <div className="p-4 bg-slate-50 rounded-xl mb-8 text-left">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">错误详情</div>
              <div className="text-xs font-mono text-slate-600 break-all">
                {isScriptError ? 'Script error. (Possible Amap Load Failure)' : (this.state.error?.message || 'Unknown error')}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full gap-2" onClick={() => window.location.reload()}>
                <RefreshCcw size={18} /> 尝试刷新页面
              </Button>
              <Button variant="secondary" className="w-full gap-2" onClick={this.handleReset}>
                <Home size={18} /> 重置应用状态并返回首页
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
