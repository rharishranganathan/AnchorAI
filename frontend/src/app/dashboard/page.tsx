'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

/**
 * Crisis log entry from the backend API (snake_case).
 */
interface CrisisLog {
  id: string;
  voice_transcript: string;
  risk_level: string;
  risk_percentage: number;
  created_at: string;
  notify_family: boolean;
}

/** Backend API base URL */
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/** Default test user ID */
const TEST_USER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

export default function Dashboard() {
  const [history, setHistory] = useState<CrisisLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/history/${TEST_USER_ID}`);
        if (!res.ok) throw new Error('Failed to fetch history');
        const data = await res.json();
        // Backend returns array directly or { history: [...] }
        setHistory(Array.isArray(data) ? data : data.history || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const getRiskColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'LOW': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'MEDIUM': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'HIGH': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center p-6 md:p-24"
      role="main"
      aria-label="Crisis history dashboard"
    >
      <div className="z-10 max-w-4xl w-full flex flex-col mb-12">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
            Crisis History
          </h1>
          <Link
            href="/"
            className="px-6 py-2 rounded-full bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-all border border-slate-600 shadow-lg"
            aria-label="Go back to SOS page"
          >
            ← Back to SOS
          </Link>
        </header>

        {isLoading ? (
          <div className="flex justify-center py-20" aria-label="Loading crisis history">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error || history.length === 0 ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-slate-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-medium text-slate-300">No crisis history yet.</h3>
            <p className="text-slate-500 mt-2">Your SOS interactions will appear here once recorded.</p>
            <Link
              href="/"
              className="mt-6 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 transition-all"
              aria-label="Start your first SOS session"
            >
              Start First SOS Session
            </Link>
          </div>
        ) : (
          <div className="relative border-l-2 border-slate-700/50 pl-6 ml-4 space-y-8">
            {history.map((log, index) => (
              <div
                key={log.id}
                className="relative animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute -left-[35px] top-4 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600"></div>

                <article className="glass-panel p-6 transition-all hover:bg-slate-800/80 hover:shadow-emerald-500/5">
                  <div className="flex justify-between items-start mb-4">
                    <time className="text-slate-400 text-sm font-mono" dateTime={log.created_at}>
                      {new Date(log.created_at).toLocaleString()}
                    </time>
                    <div className="flex items-center gap-2">
                      {log.notify_family && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10">
                          🔔 Notified
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskColor(log.risk_level)}`}>
                        {log.risk_level} — {log.risk_percentage}%
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-200 text-lg line-clamp-3 italic bg-slate-900/50 p-4 rounded-lg border-l-2 border-slate-600">
                    &ldquo;{log.voice_transcript}&rdquo;
                  </p>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
