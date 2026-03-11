import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bot, ChevronRight, Bell, BellOff, Sparkles } from 'lucide-react';
import { DrawerContent, WorkContext } from '../types';
import { actionRegistry } from '../core/ActionRegistry';
import { CopilotChat } from './CopilotChat';
import { CopilotCard } from './CopilotCard';
import { DrawerModel } from '../core/PersonaEngine';

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
  const displayTitle = content?.title || '量仔分析';
  const sections = model ? model.sections : (content?.sections || []);

  const sectionStyles = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    analysis: 'bg-indigo-50 border-indigo-100 text-indigo-700'
  };

  return (
    <AnimatePresence>
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

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 bottom-0 right-0 w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{displayTitle}</h2>
                  <p className="text-xs text-gray-500 font-medium">AI 智能协作 Agent</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
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

            {/* Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
              {/* 1. Real-time Insight Area (Fixed Top Region) */}
              <div className="h-[45%] border-b border-gray-100 bg-white flex flex-col overflow-hidden">
                <div className="px-6 py-3 border-b border-gray-50 bg-gray-50/30 flex items-center justify-between shrink-0">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles size={12} className="text-blue-500" />
                    实时场景洞察
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[9px] rounded-full font-bold animate-pulse">LIVE</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  <div className="space-y-4">
                    {sections.map((section, idx) => (
                      <motion.div 
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-4 rounded-2xl border ${sectionStyles[section.type || 'info']} relative overflow-hidden group shadow-sm`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-bold">{section.title}</h4>
                        </div>
                        <p className="text-xs leading-relaxed opacity-90 font-medium whitespace-pre-wrap">
                          {section.content}
                        </p>
                        
                        {section.action && (
                          <button
                            onClick={() => actionRegistry.execute(section.action!.event, context)}
                            className="mt-3 text-xs font-bold flex items-center gap-1 hover:underline"
                          >
                            {section.action.label} <ChevronRight size={12} />
                          </button>
                        )}
                      </motion.div>
                    ))}
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
