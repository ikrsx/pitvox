import React from 'react';
import { Activity } from 'lucide-react';

interface BiometricGaugeProps {
  score: number;
  zoneName: string;
  onOpenAiModal?: (tab: 'vitals') => void;
}

export const BiometricGauge: React.FC<BiometricGaugeProps> = ({ score, zoneName, onOpenAiModal }) => {
  // Map score (0..100) to needle rotation (-90deg .. +90deg)
  const needleRotation = (score / 100) * 180 - 90;

  const getStateInfo = (val: number) => {
    if (val >= 80) return { label: 'High Stress State', color: '#e11d48' };
    if (val >= 50) return { label: 'Elevated Stress', color: '#d97706' };
    return { label: 'Nominal State', color: '#059669' };
  };

  const stateInfo = getStateInfo(score);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between items-center relative overflow-hidden h-full min-h-[220px]">
      <div className="w-full flex justify-between items-center pb-3 border-b border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          BIOMETRIC LOAD — {zoneName}
        </span>

        {onOpenAiModal && (
          <button
            onClick={() => onOpenAiModal('vitals')}
            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
            title="Evaluate Vitals with AI Model"
          >
            <Activity className="w-3 h-3" />
            <span>AI Vitals</span>
          </button>
        )}
      </div>

      {/* Analog Gauge SVG */}
      <div className="relative w-52 h-26 mt-6 flex justify-center items-end">
        {/* Background Arc */}
        <svg viewBox="0 0 200 100" className="w-full h-full overflow-visible">
          {/* Outer Track Arc */}
          <path
            d="M 10 100 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Green Segment (0 - 40%) */}
          <path
            d="M 10 100 A 90 90 0 0 1 65 25"
            fill="none"
            stroke="#10b981"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Amber Segment (40 - 70%) */}
          <path
            d="M 65 25 A 90 90 0 0 1 135 25"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="16"
          />

          {/* Red Segment (70 - 100%) */}
          <path
            d="M 135 25 A 90 90 0 0 1 190 100"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </svg>

        {/* Tick labels */}
        <div className="absolute w-full bottom-0 px-1 flex justify-between font-data-mono text-[10px] text-slate-400 font-semibold">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>

        {/* Rotating Needle */}
        <div
          className="absolute bottom-0 w-1.5 h-24 bg-slate-900 origin-bottom transition-transform duration-500 ease-out z-10 rounded-t-full shadow-xs"
          style={{
            transform: `rotate(${needleRotation}deg)`,
            backgroundColor: stateInfo.color,
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-4 bg-white rounded-t-full"></div>
        </div>

        {/* Center Hub */}
        <div className="absolute -bottom-3 w-6 h-6 bg-white border-2 border-slate-900 rounded-full z-20 shadow-xs flex items-center justify-center">
          <div
            className="w-2 h-2 rounded-full transition-colors"
            style={{ backgroundColor: stateInfo.color }}
          ></div>
        </div>
      </div>

      {/* Readout Text */}
      <div className="mt-5 text-center">
        <span className="text-4xl md:text-5xl text-slate-900 font-black tracking-tight">
          {score}
        </span>
        <span
          className="font-bold block uppercase mt-1 tracking-widest text-xs"
          style={{ color: stateInfo.color }}
        >
          {stateInfo.label}
        </span>
      </div>
    </div>
  );
};
