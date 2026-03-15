import React from 'react';

export const CityMapBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#f1f5f9] overflow-hidden">
      <svg
        viewBox="0 0 1000 600"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* --- Water / River --- */}
        <path
          d="M-50,150 Q200,100 400,250 T800,200 T1050,300 L1050,650 L-50,650 Z"
          fill="#bae6fd"
          opacity="0.6"
        />
        <path
          d="M400,250 Q500,400 350,550 T200,700"
          stroke="#bae6fd"
          strokeWidth="40"
          fill="none"
          opacity="0.4"
        />

        {/* --- Greenery / Parks --- */}
        <path d="M50,50 L200,30 L250,150 L100,180 Z" fill="#dcfce7" />
        <path d="M700,400 L900,350 L950,550 L750,580 Z" fill="#dcfce7" />
        <path d="M400,50 L550,20 L600,100 L450,120 Z" fill="#dcfce7" />
        <circle cx="850" cy="100" r="60" fill="#dcfce7" />

        {/* --- City Blocks / Buildings --- */}
        {/* Block 1 */}
        <rect x="100" y="250" width="60" height="80" fill="#e2e8f0" rx="2" />
        <rect x="170" y="250" width="40" height="40" fill="#e2e8f0" rx="2" />
        <rect x="170" y="300" width="40" height="30" fill="#e2e8f0" rx="2" />
        
        {/* Block 2 */}
        <rect x="300" y="50" width="80" height="120" fill="#e2e8f0" rx="2" />
        <rect x="300" y="180" width="80" height="40" fill="#e2e8f0" rx="2" />

        {/* Block 3 */}
        <rect x="500" y="200" width="100" height="150" fill="#e2e8f0" rx="2" />
        <rect x="610" y="200" width="50" height="70" fill="#e2e8f0" rx="2" />
        <rect x="610" y="280" width="50" height="70" fill="#e2e8f0" rx="2" />

        {/* Block 4 */}
        <rect x="100" y="400" width="150" height="100" fill="#e2e8f0" rx="2" />
        <rect x="260" y="400" width="40" height="100" fill="#e2e8f0" rx="2" />

        {/* Block 5 */}
        <rect x="700" y="50" width="120" height="150" fill="#e2e8f0" rx="2" />
        <rect x="830" y="180" width="100" height="60" fill="#e2e8f0" rx="2" />

        {/* --- Road Network --- */}
        {/* Main Roads (Horizontal) */}
        <line x1="0" y1="240" x2="1000" y2="240" stroke="white" strokeWidth="12" />
        <line x1="0" y1="390" x2="1000" y2="390" stroke="white" strokeWidth="10" />
        <line x1="0" y1="80" x2="1000" y2="80" stroke="white" strokeWidth="8" />

        {/* Main Roads (Vertical) */}
        <line x1="280" y1="0" x2="280" y2="600" stroke="white" strokeWidth="12" />
        <line x1="480" y1="0" x2="480" y2="600" stroke="white" strokeWidth="10" />
        <line x1="680" y1="0" x2="680" y2="600" stroke="white" strokeWidth="10" />
        <line x1="80" y1="0" x2="80" y2="600" stroke="white" strokeWidth="8" />

        {/* Secondary Roads */}
        <line x1="0" y1="180" x2="280" y2="180" stroke="white" strokeWidth="4" opacity="0.6" />
        <line x1="280" y1="320" x2="480" y2="320" stroke="white" strokeWidth="4" opacity="0.6" />
        <line x1="480" y1="150" x2="680" y2="150" stroke="white" strokeWidth="4" opacity="0.6" />
        <line x1="680" y1="450" x2="1000" y2="450" stroke="white" strokeWidth="4" opacity="0.6" />
        
        <line x1="180" y1="240" x2="180" y2="390" stroke="white" strokeWidth="4" opacity="0.6" />
        <line x1="380" y1="0" x2="380" y2="240" stroke="white" strokeWidth="4" opacity="0.6" />
        <line x1="580" y1="390" x2="580" y2="600" stroke="white" strokeWidth="4" opacity="0.6" />
        <line x1="880" y1="80" x2="880" y2="390" stroke="white" strokeWidth="4" opacity="0.6" />

        {/* --- Building Details (Windows/Grid) --- */}
        <g opacity="0.3">
          <rect x="510" y="210" width="10" height="10" fill="white" />
          <rect x="530" y="210" width="10" height="10" fill="white" />
          <rect x="550" y="210" width="10" height="10" fill="white" />
          <rect x="510" y="230" width="10" height="10" fill="white" />
          <rect x="530" y="230" width="10" height="10" fill="white" />
          <rect x="550" y="230" width="10" height="10" fill="white" />
        </g>
      </svg>
      
      {/* Subtle Overlay for tech feel */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/10 to-transparent" />
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.05)]" />
    </div>
  );
};
