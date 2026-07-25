'use client';

import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  level: string;
  percentage: number;
  contributingFactors: string[];
}

export default function RiskGauge({ level, percentage, contributingFactors }: RiskGaugeProps) {
  const [displayPercent, setDisplayPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayPercent(percentage);
    }, 100);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = () => {
    switch(level.toLowerCase()) {
      case 'low': return '#10b981'; // emerald
      case 'medium': return '#f59e0b'; // amber
      case 'high': return '#ef4444'; // red
      default: return '#10b981';
    }
  };

  const color = getColor();

  return (
    <div className="glass-panel p-6 flex flex-col items-center">
      <h3 className="text-xl font-bold text-white mb-6 w-full text-center border-b border-slate-700/50 pb-4">Risk Assessment</h3>
      
      <div className="relative w-48 h-48 flex items-center justify-center rounded-full mb-6"
           style={{
             background: `conic-gradient(${color} ${displayPercent * 3.6}deg, rgba(30, 41, 59, 0.5) 0deg)`,
             transition: 'background 1s ease-out'
           }}>
        <div className="absolute w-40 h-40 bg-[#0f172a] rounded-full flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white">{displayPercent}%</span>
          <span className="text-sm font-medium mt-1 uppercase tracking-wider" style={{ color }}>{level}</span>
        </div>
      </div>

      <div className="w-full">
        <h4 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Contributing Factors</h4>
        <ul className="space-y-2">
          {contributingFactors.map((factor, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <span className="mt-1 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
              <span>{factor}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
