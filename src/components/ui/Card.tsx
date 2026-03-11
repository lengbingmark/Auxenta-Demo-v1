import React from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  children, 
  className = '',
  actions,
  onClick,
  onMouseEnter,
  onMouseLeave
}) => {
  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm border border-white/20 rounded-xl shadow-sm overflow-hidden ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {(title || subtitle || actions) && (
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
