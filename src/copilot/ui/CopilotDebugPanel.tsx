import React from 'react';
import { useCopilot } from '../core/CopilotContext';

export const CopilotDebugPanel: React.FC = () => {
  const { state } = useCopilot();

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-0 left-0 bg-black/80 text-green-400 p-2 text-[10px] font-mono z-50 max-w-md pointer-events-none">
      <div>Key: {state.contextKey}</div>
      <div>Plugin: {state.activePluginId || 'None'}</div>
      <div>LastTrigger: {state.lastTriggerTime}</div>
      <div>Quiet: {state.isQuietMode ? 'ON' : 'OFF'}</div>
    </div>
  );
};
