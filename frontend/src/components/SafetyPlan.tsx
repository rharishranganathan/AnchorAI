'use client';

interface SafetyPlanProps {
  planTitle: string;
  immediateActions: string[];
  copingStrategies: string[];
  warningSigns: string[];
}

export default function SafetyPlan({ planTitle, immediateActions, copingStrategies, warningSigns }: SafetyPlanProps) {
  return (
    <div className="glass-panel p-6 flex flex-col">
      <h3 className="text-xl font-bold text-white mb-6 border-b border-slate-700/50 pb-4">{planTitle}</h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs font-bold uppercase tracking-wider border border-red-500/30">Immediate</span>
            <h4 className="text-sm font-semibold text-slate-300">Actions to Take Now</h4>
          </div>
          <ul className="space-y-2">
            {immediateActions.map((action, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-200 bg-slate-800/30 p-2.5 rounded-lg border-l-2 border-red-500">
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded text-xs font-bold uppercase tracking-wider border border-amber-500/30">Short Term</span>
            <h4 className="text-sm font-semibold text-slate-300">Coping Strategies</h4>
          </div>
          <ul className="space-y-2">
            {copingStrategies.map((strategy, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-200 bg-slate-800/30 p-2.5 rounded-lg border-l-2 border-amber-500">
                <span>{strategy}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-3">
            <h4 className="text-sm font-semibold text-slate-300">⚠️ Warning Signs to Watch</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {warningSigns.map((sign, idx) => (
              <span key={idx} className="px-3 py-1.5 bg-slate-800/80 text-slate-300 text-xs rounded-lg border border-slate-700">
                {sign}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
