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
    }
  };

  const style = typeStyles[content?.type || 'info'];

  // Use model if available, otherwise fallback to content
  const displayTitle = model ? model.stageTitle : (content?.title || '量仔');
  const displaySummary = model ? model.shortSummary : (content?.content || '');
  const displayHighlight = model ? model.keyHighlight : '';
  const displayActions = model ? model.actions : (content?.actions || []).map(id => {
    const action = actionRegistry.get(id);
    return action ? { label: action.label, event: id } : null;
  }).filter(Boolean) as { label: string; event: string; primary?: boolean }[];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ bottom: position.bottom, right: position.right }}
          className={`fixed z-40 w-[calc(100vw-48px)] ${content?.isLarge ? 'sm:w-[480px]' : 'sm:w-96'} bg-white/90 backdrop-blur-md border ${style.border} rounded-2xl shadow-xl overflow-hidden`}
        >
          {/* Header */}
          <div 
            className={`bg-gradient-to-r ${style.header} px-4 py-3 flex items-center justify-between cursor-pointer`}
            onClick={onOpenDrawer}
          >
            <div className="flex items-center gap-2 text-white">
              {isTracking ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Sparkles size={18} />
                </motion.div>
              ) : (
                <Bot size={18} />
              )}
              <span className="font-medium text-sm">
                {isTracking ? '正在分析...' : displayTitle}
              </span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onClose(); }} 
              className="text-white/80 hover:text-white p-1"
            >
              <X size={14} />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 cursor-pointer" onClick={onOpenDrawer}>
            <div className="flex items-start gap-3 mb-3">
              <div className={`${style.bg} p-2 rounded-lg shrink-0`}>
                <Sparkles size={16} className={style.text} />
              </div>
              <div className="min-w-0 flex-1">
                {displayHighlight && (
                  <div className={`text-[10px] font-bold uppercase tracking-wider ${style.text} mb-1`}>
                    {displayHighlight}
                  </div>
                )}
                <p className="text-xs text-gray-700 font-medium leading-relaxed break-words">
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
                    actionRegistry.execute(action.event, context);
                  }}
                  className={`text-xs ${action.primary ? `bg-blue-600 text-white` : `${style.bg} ${style.text}`} px-2.5 py-1.5 rounded-lg font-medium hover:opacity-80 transition-all active:scale-95`}
                >
                  {action.label}
                </button>
              ))}
              <button 
                onClick={(e) => { e.stopPropagation(); onOpenDrawer(); }}
                className="text-xs text-gray-400 flex items-center ml-auto hover:text-blue-600 font-medium"
              >
                详情 <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
