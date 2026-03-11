import React from 'react';
import { CopilotCard as CopilotCardType } from '../types';

interface CopilotCardProps {
  card: CopilotCardType;
}

export const CopilotCard: React.FC<CopilotCardProps> = ({ card }) => {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-2 last:mb-0">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2 tracking-wider">{card.title}</h4>
      <ul className="space-y-1">
        {card.items.map((item, idx) => (
          <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
            <span className="text-blue-500 mt-1">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
