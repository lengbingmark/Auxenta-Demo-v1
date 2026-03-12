import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCopilot } from '../../copilot/core/CopilotContext';
import { useGlobalStore } from '../../store/GlobalStore';
import { pluginManager } from '../../copilot/core/PluginManager';
import { PersonaEngine } from '../../copilot/core/PersonaEngine';
import { CopilotBubble } from '../../copilot/ui/CopilotBubble';
import { CopilotDrawer } from '../../copilot/ui/CopilotDrawer';
import { CopilotDebugPanel } from '../../copilot/ui/CopilotDebugPanel';
import { Bot } from 'lucide-react';

export const CopilotWidget: React.FC = () => {
  const { state, dispatch } = useCopilot();
  const { state: globalState } = useGlobalStore();
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [currentPlugin, setCurrentPlugin] = useState<any>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Cooldown logic (30 seconds)
  const COOLDOWN_MS = 30000;

  useEffect(() => {
    const handleUserAction = (e: any) => {
      const { event, label } = e.detail;
      console.log(`[CopilotWidget] Tracking action: ${label}`);
      
      // Trigger "thinking" state
      setIsTracking(true);
      setBubbleVisible(true);
      
      // Reset tracking state after a short delay
      const timer = setTimeout(() => {
        setIsTracking(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    };

    window.addEventListener('powerops-event', handleUserAction);
    return () => window.removeEventListener('powerops-event', handleUserAction);
  }, []);

  useEffect(() => {
    // Match plugin based on context
    const plugin = pluginManager.match(state.context);
    setCurrentPlugin(plugin);
    dispatch({ type: 'SET_ACTIVE_PLUGIN', payload: plugin?.id || null });

    if ((plugin || state.bubbleModel) && !state.isQuietMode) {
      const now = Date.now();
      if (!state.isDrawerOpen) {
        setBubbleVisible(true);
        dispatch({ type: 'TRIGGER_COPILOT', payload: now });
      }
    } else {
      setBubbleVisible(false);
    }
  }, [state.contextKey, state.isQuietMode, dispatch, globalState.run.stage, !!state.bubbleModel]);

  useEffect(() => {
    if (state.notification) {
      setBubbleVisible(true);
      // Auto-clear notification after 8 seconds
      const timer = setTimeout(() => {
        dispatch({ type: 'SET_NOTIFICATION', payload: null });
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [state.notification, dispatch]);

  // If no plugin matched, we still want to show the debug panel and trigger button
  const bubbleContent = state.notification ? {
    title: state.notification.title,
    content: state.notification.content,
    actions: state.notification.actions || [],
    type: state.notification.type,
    isLarge: state.notification.isLarge,
    isNotification: true
  } : currentPlugin?.renderBubble(state.context);
  
  const drawerContent = currentPlugin?.renderDrawer(state.context);

  return (
    <>
      {((currentPlugin && bubbleContent) || state.bubbleModel) && (
        <CopilotBubble 
          content={bubbleContent}
          model={state.bubbleModel}
          context={state.context}
          visible={bubbleVisible && !state.isDrawerOpen}
          isTracking={isTracking}
          onOpenDrawer={() => dispatch({ type: 'TOGGLE_DRAWER', payload: true })}
          onClose={() => setBubbleVisible(false)}
        />
      )}

      {((currentPlugin && drawerContent) || state.drawerModel) && (
        <CopilotDrawer
          content={drawerContent}
          model={state.drawerModel}
          context={state.context}
          isOpen={state.isDrawerOpen}
          onClose={() => dispatch({ type: 'TOGGLE_DRAWER', payload: false })}
          isQuietMode={state.isQuietMode}
          onToggleQuietMode={() => dispatch({ type: 'TOGGLE_QUIET_MODE' })}
        />
      )}

      {/* Floating Trigger Button (when bubble is closed but we want to open it) */}
      <AnimatePresence>
        {!bubbleVisible && !state.isDrawerOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={() => setBubbleVisible(true)}
            className="fixed bottom-6 right-6 z-30 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-transform hover:scale-110"
          >
            <Bot size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <CopilotDebugPanel />
    </>
  );
};
