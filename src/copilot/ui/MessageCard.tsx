import React, { useState } from 'react';
import { ChatMessage } from '../core/PersonaEngine';
import { CheckCircle, AlertTriangle, Info, ArrowRight, ChevronDown, ChevronUp, BrainCircuit, User } from 'lucide-react';
import { actionRegistry } from '../core/ActionRegistry';
import { useCopilot } from '../core/CopilotContext';

interface MessageCardProps {
  message: ChatMessage;
}

export const MessageCard: React.FC<MessageCardProps> = ({ message }) => {
  const { state } = useCopilot();
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="flex flex-col items-end gap-1 max-w-[85%]">
          <div className="bg-blue-600 text-white px-4 py-2.5 rounded-2xl rounded-tr-none text-sm shadow-sm">
            {message.content}
          </div>
          <span className="text-[10px] text-gray-400 mr-1">您</span>
        </div>
        <div className="ml-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
            <User size={16} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex mb-8 group">
      <div className="mr-3 mt-1 shrink-0">
        <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100 ring-2 ring-white">
          <BrainCircuit size={20} />
        </div>
      </div>
      
      <div className="flex flex-col items-start max-w-[85%] gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-900">量仔 (AI 助理)</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold uppercase tracking-wider">Trainee</span>
        </div>

        {/* Thinking Process (Collapsible) */}
        {message.thinking && (
          <div className="w-full bg-slate-50 border border-slate-100 rounded-xl overflow-hidden mb-1">
            <button 
              onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
              className="w-full px-3 py-2 flex items-center justify-between text-[10px] font-bold text-slate-400 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <BrainCircuit size={12} className="text-blue-400" />
                <span>分析思考过程</span>
              </div>
              {isThinkingExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {isThinkingExpanded && (
              <div className="px-3 pb-3 pt-1 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 italic bg-white/50">
                {message.thinking}
              </div>
            )}
          </div>
        )}

        {/* Main Text Content */}
        <div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm text-sm whitespace-pre-wrap leading-relaxed relative">
          {message.content}
        </div>

        {/* Receipt Card (if exists) */}
        {message.receipt && (
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-sm">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
              {message.receipt.status === 'success' ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : message.receipt.status === 'warning' ? (
                <AlertTriangle size={16} className="text-amber-500" />
              ) : (
                <Info size={16} className="text-blue-500" />
              )}
              <span className="font-semibold text-xs text-gray-900">{message.receipt.title}</span>
            </div>
            <div className="text-xs text-gray-600 mb-2">
              {message.receipt.details}
            </div>
            {message.receipt.nextStep && (
              <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                <ArrowRight size={12} />
                下一步：{message.receipt.nextStep}
              </div>
            )}
          </div>
        )}

        {/* Suggested Actions (Chips) */}
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {message.suggestions.map(actionId => {
              const action = actionRegistry.get(actionId);
              if (!action) return null;
              return (
                <button
                  key={actionId}
                  onClick={() => {
                    action.handler(state.context);
                  }}
                  className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full text-xs hover:bg-blue-100 transition-colors font-medium shadow-sm"
                >
                  {action.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Bound Actions (Buttons) */}
        {message.actions && message.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 w-full">
            {message.actions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  actionRegistry.execute(action.event, state.context, action.payload);
                }}
                className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  action.primary 
                    ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100' 
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
