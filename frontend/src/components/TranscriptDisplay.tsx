'use client';

interface TranscriptDisplayProps {
  transcript: string;
  isListening: boolean;
}

export default function TranscriptDisplay({ transcript, isListening }: TranscriptDisplayProps) {
  if (!transcript && !isListening) return null;

  return (
    <div className="glass-panel p-6 w-full min-h-[120px] max-h-48 overflow-y-auto custom-scrollbar relative">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {isListening && (
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </div>
      
      {!transcript && isListening ? (
        <p className="text-slate-400 italic flex items-center gap-2 mt-2">
          Waiting for your voice...
          <span className="flex space-x-1">
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </p>
      ) : (
        <p className="text-lg text-slate-200 leading-relaxed font-medium">
          {transcript}
          {isListening && <span className="inline-block w-2 h-5 ml-1 bg-emerald-400 animate-pulse align-middle"></span>}
        </p>
      )}
    </div>
  );
}
