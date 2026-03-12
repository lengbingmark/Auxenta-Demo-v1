import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, ChevronRight, Bell, BellOff, Sparkles, Maximize2, Minimize2, Plus, History, Trash2 } from 'lucide-react';
import { DrawerContent, WorkContext } from '../types';
import { actionRegistry } from '../core/ActionRegistry';
import { CopilotChat } from './CopilotChat';
import { CopilotCard } from './CopilotCard';
import { DrawerModel } from '../core/PersonaEngine';
import { useCopilot } from '../core/CopilotContext';

interface CopilotDrawerProps {
  content?: DrawerContent;
  model?: DrawerModel | null;
  context: WorkContext;
  isOpen: boolean;
  onClose: () => void;
  isQuietMode: boolean;
  onToggleQuietMode: () => void;
}

export const CopilotDrawer: React.FC<CopilotDrawerProps> = ({
  content,
  model,
  context,
  isOpen,
  onClose,
  isQuietMode,
  onToggleQuietMode
}) => {
  const { state: copilotState, dispatch: copilotDispatch } = useCopilot();
  const { isExpanded, sessions, currentSessionId } = copilotState;
  const [showHistory, setShowHistory] = React.useState(false);

  const displayTitle = content?.title || '量仔分析';
  const sections = model ? model.sections : (content?.sections || []);

  const sectionStyles = {
    info: {
      container: 'bg-blue-50 border-blue-100 text-blue-700',
      icon: <Bell size={14} className="text-blue-500" />,
      accent: 'bg-blue-500'
    },
    warning: {
      container: 'bg-amber-50 border-amber-100 text-amber-700',
      icon: <BellOff size={14} className="text-amber-500" />,
      accent: 'bg-amber-500'
    },
    success: {
      container: 'bg-emerald-50 border-emerald-100 text-emerald-700',
      icon: <Sparkles size={14} className="text-emerald-500" />,
      accent: 'bg-emerald-500'
    },
    analysis: {
      container: 'bg-indigo-50 border-indigo-100 text-indigo-700',
      icon: <Bot size={14} className="text-indigo-500" />,
      accent: 'bg-indigo-500'
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
          />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className={`fixed top-0 bottom-0 right-0 ${isExpanded ? 'w-[800px]' : 'w-[420px]'} bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200 transition-all duration-300`}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200"
                  >
                    <Bot size={20} className="text-white" />
                  </motion.div>
                  <div>
                    <h2 className="font-bold text-gray-900 text-lg">{displayTitle}</h2>
                    <p className="text-xs text-gray-500 font-medium">AI 智能协作 Agent</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copilotDispatch({ type: 'TOGGLE_EXPAND' })}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-blue-600 transition-all"
                    title={isExpanded ? "收起对话" : "扩展对话"}
                  >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  </button>
                  <button
                    onClick={onToggleQuietMode}
                    className={`p-2 rounded-xl transition-all ${
                      isQuietMode 
                        ? 'bg-amber-100 text-amber-600' 
                        : 'bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                    title={isQuietMode ? "静音模式" : "主动模式"}
                  >
                    {isQuietMode ? <BellOff size={18} /> : <Bell size={18} />}
                  </button>
                  <button 
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Session Controls */}
              <div className="px-6 py-2 border-b border-gray-50 flex items-center gap-4 bg-gray-50/30">
                <button 
                  onClick={() => copilotDispatch({ type: 'NEW_CHAT' })}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  新对话
                </button>
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${showHistory ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  <History size={14} />
                  历史记录
                </button>
                <button 
                  onClick={() => copilotDispatch({ type: 'CLEAR_CHAT' })}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-gray-400 hover:text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors ml-auto"
                >
                  <Trash2 size={14} />
                  清空当前
                </button>
              </div>

              {/* History Panel */}
              <AnimatePresence>
                {showHistory && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gray-50 border-b border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">最近会话</span>
                        <button 
                          onClick={() => copilotDispatch({ type: 'CLEAR_HISTORY' })}
                          className="text-[10px] font-bold text-red-400 hover:text-red-600"
                        >
                          清除全部历史
                        </button>
                      </div>
                      {sessions.length === 0 ? (
                        <p className="text-center py-4 text-xs text-gray-400">暂无历史记录</p>
                      ) : (
                        sessions.map((session) => (
                          <button
                            key={session.id}
                            onClick={() => {
                              copilotDispatch({ type: 'LOAD_SESSION', payload: session.id });
                              setShowHistory(false);
                            }}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${session.id === currentSessionId ? 'bg-white border-blue-200 shadow-sm' : 'bg-transparent border-transparent hover:bg-white/50'}`}
                          >
                            <div className="overflow-hidden">
                              <p className={`text-xs font-bold truncate ${session.id === currentSessionId ? 'text-blue-600' : 'text-gray-700'}`}>
                                {session.title || '无标题会话'}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                {new Date(session.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <ChevronRight size={14} className={`transition-transform group-hover:translate-x-1 ${session.id === currentSessionId ? 'text-blue-500' : 'text-gray-300'}`} />
                          </button>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content Area */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* 1. Real-time Insight Area (Fixed Top Region) */}
                <div className={`${isExpanded ? 'h-[30%]' : 'h-[45%]'} border-b border-gray-100 bg-white flex flex-col overflow-hidden transition-all duration-300`}>
                <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between shrink-0">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-500" />
                    实时场景洞察
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] rounded-full font-bold animate-pulse">LIVE</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  <div className="space-y-4">
                    {sections.map((section, idx) => {
                      const style = sectionStyles[section.type || 'info'];
                      return (
                        <motion.div 
                          key={`${idx}-${section.title}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className={`p-4 rounded-2xl border ${style.container} relative overflow-hidden group shadow-sm hover:shadow-md transition-all`}
                        >
                          {/* Accent line */}
                          <div className={`absolute top-0 left-0 w-1 h-full ${style.accent} opacity-40`} />
                          
                          <div className="flex items-center gap-2 mb-2">
                            <div className="p-1 rounded-md bg-white/50">
                              {style.icon}
                            </div>
                            <h4 className="text-sm font-bold">{section.title}</h4>
                          </div>
                          <p className="text-xs leading-relaxed opacity-90 font-medium whitespace-pre-wrap pl-1">
                            {section.content}
                          </p>
                          
                          {section.action && (
                            <button
                              onClick={() => actionRegistry.execute(section.action!.event, context, section.action!.payload)}
                              className="mt-3 text-xs font-bold flex items-center gap-1 hover:underline group-hover:translate-x-1 transition-transform"
                            >
                              {section.action.label} <ChevronRight size={12} />
                            </button>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Cards (Legacy support) */}
                  {content?.cards && content.cards.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {content.cards.map((card, idx) => (
                        <CopilotCard key={idx} card={card} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Chat Interaction Area (Fixed Bottom Region) */}
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50/20">
                <div className="px-6 py-3 border-b border-gray-100 bg-white/50 flex items-center justify-between shrink-0">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Bot size={12} className="text-indigo-500" />
                    对话交互
                  </h3>
                </div>
                
                <div className="flex-1 overflow-hidden flex flex-col">
                  <CopilotChat />
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
