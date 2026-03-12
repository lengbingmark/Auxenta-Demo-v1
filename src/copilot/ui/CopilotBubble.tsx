import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, X, ChevronRight, Sparkles } from 'lucide-react';
import { CopilotContent, WorkContext } from '../types';
import { actionRegistry } from '../core/ActionRegistry';
import { CopilotCard } from './CopilotCard';
import { BubbleModel } from '../core/PersonaEngine';

interface CopilotBubbleProps {
  content?: CopilotContent & { isLarge?: boolean };
  model?: BubbleModel | null;
  context: WorkContext;
  onOpenDrawer: () => void;
  onClose: () => void;
  visible: boolean;
  isTracking?: boolean;
}

export const CopilotBubble: React.FC<CopilotBubbleProps> = ({
  content,
  model,
  context,
  onOpenDrawer,
  onClose,
  visible,
  isTracking
}) => {
  // Collision detection logic
  const [position, setPosition] = React.useState({ bottom: 24, right: 24 });
  
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setPosition({ bottom: 80, right: 24 });
      } else {
        setPosition({ bottom: 24, right: 24 });
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const typeStyles = {
    info: {
      header: 'from-blue-600 to-indigo-600',
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-100'
    },
    warning: {
      header: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100'
    },
    success: {
      header: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100'
    },
    analysis: {
      header: 'from-indigo-600 to-violet-700',
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100'
    }
  };

  const style = typeStyles[model?.type || content?.type || 'info'];

  // Use model if available, otherwise fallback to content, but prioritize notification content
  const displayTitle = (content as any)?.isNotification ? (content?.title || '量仔') : (model ? model.stageTitle : (content?.title || '量仔'));
  const displaySummary = (content as any)?.isNotification ? (content?.content || '') : (model ? model.shortSummary : (content?.content || ''));
  const displayHighlight = (content as any)?.isNotification ? '' : (model ? model.keyHighlight : '');
  const displayActions = (content as any)?.isNotification ? (content?.actions || []) : (model ? model.actions : (content?.actions || []).map(id => {
    const action = actionRegistry.get(id);
    return action ? { label: action.label, event: id, payload: undefined } : null;
  }).filter(Boolean) as { label: string; event: string; primary?: boolean; payload?: any }[]);

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={displayTitle + displaySummary}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ 
            duration: 0.5, 
            ease: [0.16, 1, 0.3, 1],
            opacity: { duration: 0.3 }
          }}
          style={{ bottom: position.bottom, right: position.right }}
          className={`fixed z-40 w-[calc(100vw-48px)] ${content?.isLarge ? 'sm:w-[480px]' : 'sm:w-96'} bg-white/95 backdrop-blur-md border ${style.border} rounded-2xl shadow-2xl overflow-hidden`}
        >
          {/* Header */}
          <div 
            className={`bg-gradient-to-r ${style.header} px-4 py-3 flex items-center justify-between cursor-pointer relative overflow-hidden`}
            onClick={onOpenDrawer}
          >
            {/* Animated background effect */}
            <motion.div 
              animate={{ 
                x: ['-100%', '100%'],
                opacity: [0, 0.1, 0]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-white skew-x-12"
            />

            <div className="flex items-center gap-2 text-white relative z-10">
              {isTracking ? (
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  >
                    <Sparkles size={18} />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-white rounded-full blur-md"
                  />
                </div>
              ) : (
                <motion.div
                  initial={{ rotate: -10 }}
                  animate={{ rotate: 0 }}
                >
                  <Bot size={18} />
                </motion.div>
              )}
              <span className="font-bold text-sm tracking-tight">
                {isTracking ? '量仔正在深度分析...' : displayTitle}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="text-white/80 hover:text-white p-1 relative z-10"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 cursor-pointer group" onClick={onOpenDrawer}>
            <div className="flex items-start gap-3 mb-3">
              <motion.div 
                animate={isTracking ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
                className={`${style.bg} p-2 rounded-xl shrink-0 shadow-inner`}
              >
                <Sparkles size={16} className={style.text} />
              </motion.div>
              <div className="min-w-0 flex-1">
                {displayHighlight && (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-[10px] font-black uppercase tracking-widest ${style.text} mb-1 flex items-center gap-1`}
                  >
                    <div className={`w-1 h-1 rounded-full ${style.text.replace('text-', 'bg-')} animate-pulse`} />
                    {displayHighlight}
                  </motion.div>
                )}
                <p className="text-xs text-gray-700 font-bold leading-relaxed break-words">
                  {displaySummary}
                </p>
              </div>
            </div>

            {/* Cards (Legacy support) */}
            {content?.cards && content.cards.length > 0 && (
              <div className="space-y-2 mb-3">
                {content.cards.map((card, idx) => (
                  <CopilotCard key={idx} card={card} />
                ))}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
              {displayActions.slice(0, 3).map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    actionRegistry.execute(action.event, context, action.payload);
                  }}
                  className={`text-xs ${action.primary ? `bg-blue-600 text-white shadow-lg shadow-blue-200` : `${style.bg} ${style.text} border ${style.border}`} px-3 py-2 rounded-xl font-bold hover:scale-105 transition-all active:scale-95`}
                >
                  {action.label}
                </button>
              ))}
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
                className="text-xs text-gray-400 flex items-center ml-auto hover:text-blue-600 font-bold group-hover:translate-x-1 transition-transform"
              >
                查看详情 <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
