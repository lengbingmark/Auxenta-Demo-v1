import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import mapImage from '../../assets/hangzhou-map.png';

interface MapContainerProps {
  imageUrl?: string;
  children?: React.ReactNode;
  className?: string;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  imageUrl = mapImage, 
  children,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);

  // 使用 motion value 处理平滑拖拽
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 滚轮缩放处理
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY;
    const zoomStep = 0.1;
    const newScale = delta > 0 ? Math.max(0.5, scale - zoomStep) : Math.min(3, scale + zoomStep);
    setScale(newScale);
  };

  // 限制拖拽范围（简单处理）
  useEffect(() => {
    // 这里可以根据容器大小和缩放比例计算边界限制
  }, [scale]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-slate-100 cursor-grab active:cursor-grabbing ${className}`}
      onWheel={handleWheel}
    >
      <motion.div
        style={{ 
          x, 
          y, 
          scale,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transformOrigin: 'center center'
        }}
        drag
        dragConstraints={containerRef} // 简单约束，实际可能需要更复杂的计算
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        className="absolute inset-0"
      >
        {/* 这里可以叠加后续图层 */}
        <div className="absolute inset-0 pointer-events-none">
          {children}
        </div>
      </motion.div>

      {/* 缩放控制按钮 */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
        <button 
          onClick={() => setScale(prev => Math.min(3, prev + 0.2))}
          className="w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-xl flex items-center justify-center text-slate-600 hover:bg-white transition-colors font-bold text-xl"
        >
          +
        </button>
        <button 
          onClick={() => setScale(prev => Math.max(0.5, prev - 0.2))}
          className="w-10 h-10 bg-white/90 backdrop-blur shadow-lg rounded-xl flex items-center justify-center text-slate-600 hover:bg-white transition-colors font-bold text-xl"
        >
          -
        </button>
      </div>

      {/* 坐标提示或状态 (可选) */}
      <div className="absolute bottom-6 left-6 px-3 py-1.5 bg-black/50 backdrop-blur rounded-full text-[10px] text-white/70 font-mono z-20">
        SCALE: {scale.toFixed(2)}x | PAN: {Math.round(x.get())}, {Math.round(y.get())}
      </div>
    </div>
  );
};
