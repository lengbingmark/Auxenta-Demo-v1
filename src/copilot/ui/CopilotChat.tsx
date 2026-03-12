import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useCopilot } from '../core/CopilotContext';
import { AgentOrchestrator } from '../core/AgentOrchestrator';
import { useGlobalStore } from '../../store/GlobalStore';
import { MessageCard } from './MessageCard';

export const CopilotChat: React.FC = () => {
  const { state: copilotState, dispatch: copilotDispatch } = useCopilot();
  const { state: globalState, dispatch: globalDispatch } = useGlobalStore();
  const { isExpanded } = copilotState;
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [copilotState.chatHistory, copilotState.isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Listen for external input triggers
  useEffect(() => {
    const handleExternalInput = (e: any) => {
      setInput(e.detail);
      // Auto-send after a short delay to feel natural
      setTimeout(() => {
        handleSend(e.detail);
      }, 100);
    };
    window.addEventListener('copilot-input', handleExternalInput);
    return () => window.removeEventListener('copilot-input', handleExternalInput);
  }, [copilotState.context]);

  const handleSend = async (overrideInput?: string) => {
    const userMsg = overrideInput || input;
    if (!userMsg.trim()) return;

    if (!overrideInput) setInput('');

    // 1. Add User Message
    copilotDispatch({
      type: 'ADD_MESSAGE',
      payload: {
        id: Date.now().toString(),
        role: 'user',
        content: userMsg,
        timestamp: Date.now(),
        type: 'text'
      }
    });

    // 2. Set Thinking
    copilotDispatch({ type: 'SET_THINKING', payload: true });

    // 3. Simulate Network Delay (800-1500ms)
    setTimeout(async () => {
      // 4. Process via Orchestrator (Pass globalState for memory)
      const result = await AgentOrchestrator.process(userMsg, copilotState.context, globalDispatch, globalState);

      // 5. Add Assistant Message
      copilotDispatch({
        type: 'ADD_MESSAGE',
        payload: {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result.message,
          thinking: result.thinking,
          timestamp: Date.now(),
          type: 'text',
          receipt: result.receipt,
          suggestions: result.suggestions,
          actions: result.actions
        }
      });

      copilotDispatch({ type: 'SET_THINKING', payload: false });
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/30">
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4" ref={scrollRef}>
        {copilotState.chatHistory.map((msg) => (
          <MessageCard key={msg.id} message={msg} />
        ))}
        
        {copilotState.isThinking && (
          <div className="flex items-center gap-2 text-gray-400 text-xs ml-4 mb-4">
            <Loader2 size={14} className="animate-spin" />
            <span>量仔正在思考...</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className={`p-4 bg-white border-t border-gray-100 transition-all ${isExpanded ? 'px-8 py-6' : 'p-4'}`}>
        <div className="relative">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入指令，如“催办任务”..."
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none custom-scrollbar min-h-[46px]"
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || copilotState.isThinking}
            className="absolute right-2 bottom-2.5 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-gray-400">
          <Sparkles size={10} />
          <span>AI 生成内容仅供参考 · Shift + Enter 换行</span>
        </div>
      </div>
    </div>
  );
};
