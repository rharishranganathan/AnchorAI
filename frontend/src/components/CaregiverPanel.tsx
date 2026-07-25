'use client';

interface CaregiverPanelProps {
  summary: string;
  dos: string[];
  donts: string[];
  conversationStarters: string[];
  notifyFamily: boolean;
  notifyReason: string;
}

export default function CaregiverPanel({ summary, dos, donts, conversationStarters, notifyFamily, notifyReason }: CaregiverPanelProps) {
  return (
    <div className="glass-panel p-6 flex flex-col">
      <div className="flex justify-between items-center border-b border-slate-700/50 pb-4 mb-6">
        <h3 className="text-xl font-bold text-white">Caregiver Support Guide</h3>
      </div>
      
      {notifyFamily && (
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-4">
          <div className="p-2 bg-amber-500/20 rounded-full text-amber-400 shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-amber-400">Family has been notified</h4>
            <p className="text-sm text-amber-200/80 mt-1">{notifyReason}</p>
          </div>
        </div>
      )}

      <p className="text-slate-300 mb-6 italic border-l-4 border-slate-600 pl-4 py-1">{summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-emerald-900/10 rounded-xl p-5 border border-emerald-500/20">
          <h4 className="flex items-center gap-2 font-bold text-emerald-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            DO'S
          </h4>
          <ul className="space-y-3">
            {dos.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="bg-red-900/10 rounded-xl p-5 border border-red-500/20">
          <h4 className="flex items-center gap-2 font-bold text-red-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            DON'TS
          </h4>
          <ul className="space-y-3">
            {donts.map((item, idx) => (
              <li key={idx} className="flex gap-3 text-sm text-slate-300">
                <span className="text-red-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-slate-300 mb-4 uppercase text-sm tracking-wider">Conversation Starters</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {conversationStarters.map((starter, idx) => (
            <div key={idx} className="relative bg-slate-800/50 p-4 rounded-2xl rounded-tl-sm border border-slate-700/50">
              <p className="text-sm text-slate-200">"{starter}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
