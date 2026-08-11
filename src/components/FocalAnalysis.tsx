import React from 'react';
import { Heart, Wind, Gauge, Play, Pause, Quote } from 'lucide-react';
import { ZoneData } from '../types';

interface FocalAnalysisProps {
  zone: ZoneData;
  isPlaying: boolean;
  onToggleAudio: (zone: ZoneData) => void;
  audioCurrentTime: number;
}

export const FocalAnalysis: React.FC<FocalAnalysisProps> = ({
  zone,
  isPlaying,
  onToggleAudio,
  audioCurrentTime,
}) => {
  const getStatusStyle = (score: number) => {
    if (score >= 80)
      return {
        label: 'CRITICAL',
        color: '#e11d48',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
      };
    if (score >= 60)
      return {
        label: 'HIGH STRESS',
        color: '#e11d48',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        text: 'text-rose-700',
      };
    if (score >= 42)
      return {
        label: 'ELEVATED',
        color: '#d97706',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        text: 'text-amber-700',
      };
    return {
      label: 'NOMINAL',
      color: '#059669',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
    };
  };

  const statusInfo = getStatusStyle(zone.stressScore);

  const formatTime = (sec: number) => {
    const s = Math.floor(sec);
    const ms = Math.floor((sec % 1) * 10);
    return `00:${s.toString().padStart(2, '0')}.${ms}`;
  };

  const progressPercent = Math.min(100, (audioCurrentTime / (zone.audioDuration || 1)) * 100);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col h-full border-t-4 transition-all duration-300"
      style={{ borderTopColor: statusInfo.color }}
    >
      {/* Panel Header */}
      <div className="flex justify-between items-center pb-3 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          FOCAL ANALYSIS — {zone.id}
        </span>
        <span
          className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Main Title & Stress Score */}
      <div className="flex justify-between items-start my-4">
        <div>
          <h3 className="font-display text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            {zone.cornerName}
          </h3>
          <p className="font-data-mono text-xs text-slate-400 mt-1">
            TIMESTAMP: {zone.timeRange}
          </p>
        </div>

        <div className="text-right">
          <div
            className="text-4xl md:text-5xl font-black tracking-tight"
            style={{ color: statusInfo.color }}
          >
            {zone.stressScore}
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            Stress Index
          </div>
        </div>
      </div>

      {/* Biometric Load Cards (BPM, BR, G) */}
      <div className="grid grid-cols-3 gap-3 my-3">
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <Heart className="w-5 h-5 text-emerald-600 mb-1" />
          <span className="font-data-mono text-lg font-bold text-slate-900">
            {zone.hrBpm > 0 ? zone.hrBpm : '—'}{' '}
            <span className="text-xs font-normal text-slate-400">BPM</span>
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <Wind className="w-5 h-5 text-blue-600 mb-1" />
          <span className="font-data-mono text-lg font-bold text-slate-900">
            {zone.brRate > 0 ? zone.brRate : '—'}{' '}
            <span className="text-xs font-normal text-slate-400">BR</span>
          </span>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col items-center justify-center">
          <Gauge className="w-5 h-5 text-amber-500 mb-1" />
          <span className="font-data-mono text-lg font-bold text-slate-900">
            {zone.gForce}{' '}
            <span className="text-xs font-normal text-slate-400">G</span>
          </span>
        </div>
      </div>

      {/* Identified Entities */}
      <div className="mb-4">
        <div className="text-[10px] text-slate-400 uppercase tracking-widest mb-2 font-bold">
          IDENTIFIED KEYWORDS
        </div>
        <div className="flex flex-wrap gap-2">
          {zone.keywords.map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs text-slate-800 font-data-mono font-semibold"
            >
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* Extracted requirement if available */}
      {zone.requirementNote && (
        <div className="mb-4 p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg text-xs text-amber-900 font-data-mono">
          <span className="font-bold uppercase mr-1">ACTION ITEM:</span>
          {zone.requirementNote}
        </div>
      )}

      {/* Quote Box */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 relative mb-4 flex-1 flex items-center">
        <Quote className="absolute top-3 right-3 text-slate-300 w-8 h-8 opacity-40 pointer-events-none" />
        <p className="font-sans text-base text-slate-800 italic relative z-10 leading-relaxed font-medium">
          "{zone.transcript}"
        </p>
      </div>

      {/* Audio Player Widget (Dark Contrast Block) */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex items-center gap-4 text-white shadow-xs mt-auto">
        <button
          onClick={() => onToggleAudio(zone)}
          className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shrink-0 shadow-sm shadow-blue-500/30 focus:outline-none"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex justify-between font-data-mono text-[10px] text-slate-400 font-semibold">
            <span>{formatTime(audioCurrentTime)}</span>
            <span>00:0{zone.audioDuration}.0</span>
          </div>

          {/* Animated Waveform */}
          <div className="h-6 flex items-center gap-[3px] w-full relative">
            {Array.from({ length: 24 }).map((_, i) => {
              const heightPct = Math.sin(i * 0.5 + (isPlaying ? audioCurrentTime * 8 : 0)) * 40 + 50;
              const isPast = (i / 24) * 100 <= progressPercent;

              return (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-100 ${
                    isPast ? 'bg-blue-400' : 'bg-slate-800'
                  }`}
                  style={{ height: `${Math.max(20, heightPct)}%` }}
                ></div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
