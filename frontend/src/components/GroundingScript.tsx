'use client';

import { useState } from 'react';

interface GroundingScriptProps {
  title: string;
  durationMinutes: number;
  steps: string[];
}

export default function GroundingScript({ title, durationMinutes, steps }: GroundingScriptProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="glass-panel p-6 flex flex-col">
      <div className="flex justify-between items-start border-b border-slate-700/50 pb-4 mb-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold whitespace-nowrap">
          ~{durationMinutes} min exercise
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`flex items-start gap-4 p-3 rounded-xl transition-all duration-300 animate-fade-in ${
                completedSteps[idx] ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-slate-800/40 hover:bg-slate-800/60'
              }`}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <button 
                onClick={() => toggleStep(idx)}
                className={`mt-0.5 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                  completedSteps[idx] ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-emerald-400'
                }`}
                aria-label={completedSteps[idx] ? `Mark step ${idx + 1} as incomplete` : `Mark step ${idx + 1} as complete`}
              >
                {completedSteps[idx] && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
              <p className={`text-sm leading-relaxed transition-colors ${completedSteps[idx] ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
