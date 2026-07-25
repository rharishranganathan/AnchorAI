'use client';

interface SOSButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  onClick: () => void;
}

export default function SOSButton({ isListening, isProcessing, onClick }: SOSButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <button
        onClick={onClick}
        disabled={isProcessing}
        className={`relative flex items-center justify-center rounded-full transition-all duration-300
          ${isListening ? 'w-64 h-64 animate-pulse-sos' : 'w-56 h-56 animate-breathe'}
          ${isProcessing ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        `}
        style={{
          background: isListening 
            ? 'radial-gradient(circle, #f97316 0%, #ef4444 100%)' 
            : 'radial-gradient(circle, #ef4444 0%, #b91c1c 100%)',
          boxShadow: isListening ? '0 0 40px 10px rgba(239, 68, 68, 0.5)' : '0 10px 25px -5px rgba(239, 68, 68, 0.4)',
        }}
        aria-label={isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Press to speak for help'}
      >
        <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
        {isProcessing ? (
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="w-24 h-24 text-white"
            aria-hidden="true"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
      <div className="text-xl font-bold tracking-widest text-slate-300">
        {isProcessing ? 'ANALYZING...' : isListening ? 'LISTENING...' : 'TAP TO SPEAK'}
      </div>
    </div>
  );
}
