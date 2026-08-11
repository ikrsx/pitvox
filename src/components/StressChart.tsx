import React, { useState } from 'react';
import { LapData } from '../types';
import { TrendingUp } from 'lucide-react';

interface StressChartProps {
  allLaps: Record<number, LapData>;
  currentLapNumber: number;
  onOpenAiModal?: (tab: 'graph') => void;
}

export const StressChart: React.FC<StressChartProps> = ({
  allLaps,
  currentLapNumber,
  onOpenAiModal,
}) => {
  const [hoverLap, setHoverLap] = useState<number | null>(null);

  const lapKeys = Object.keys(allLaps)
    .map(Number)
    .sort((a, b) => a - b);

  if (lapKeys.length === 0) return null;

  const width = 380;
  const height = 140;
  const padding = 24;

  const stepX = (width - padding * 2) / Math.max(1, lapKeys.length - 1);

  // Points calculations
  const points = lapKeys.map((num, i) => {
    const lap = allLaps[num];
    const x = padding + i * stepX;
    // Map stress (20..100) to y (height-padding .. padding)
    const stressY = height - padding - ((lap.overallStress - 20) / 80) * (height - padding * 2);
    // Parse delta (e.g., "-0.142s" -> -0.142, "+0.9s" -> 0.9)
    const deltaVal = parseFloat(lap.lapDelta) || 0;
    // Map delta (-1.0s .. +1.0s) to y
    const deltaY = height / 2 - deltaVal * 40;

    return { num, lap, x, stressY, deltaY };
  });

  const stressPathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.stressY}` : `${acc} L ${p.x},${p.stressY}`;
  }, '');

  const deltaPathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x},${p.deltaY}` : `${acc} L ${p.x},${p.deltaY}`;
  }, '');

  const activePoint = points.find((p) => p.num === (hoverLap || currentLapNumber)) || points[0];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col relative h-full min-h-[220px]">
      <div className="w-full flex justify-between items-center border-b border-slate-100 pb-2 mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          STRESS VS LAP TIME TREND
        </span>

        <div className="flex items-center gap-2">
          {onOpenAiModal && (
            <button
              onClick={() => onOpenAiModal('graph')}
              className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded transition-colors"
              title="Evaluate Graph & Lap Delta Trends with AI Model"
            >
              <TrendingUp className="w-3 h-3" />
              <span>AI Graph</span>
            </button>
          )}

          <span className="font-data-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            LAPS {lapKeys[0]}–{lapKeys[lapKeys.length - 1]}
          </span>
        </div>
      </div>

      {/* Chart SVG Canvas */}
      <div className="flex-1 relative w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-hidden flex items-center justify-center">
        {/* Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none opacity-40">
          <div className="w-full h-px bg-slate-200"></div>
          <div className="w-full h-px bg-slate-200"></div>
          <div className="w-full h-px bg-slate-200"></div>
          <div className="w-full h-px bg-slate-200"></div>
        </div>

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {/* Delta Time Line (Blue Solid) */}
          <path
            d={deltaPathD}
            fill="none"
            stroke="#2563eb"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Stress Index Line (Rose Dashed) */}
          <path
            d={stressPathD}
            fill="none"
            stroke="#e11d48"
            strokeWidth="2"
            strokeDasharray="5,4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Data Markers */}
          {points.map((p) => (
            <g key={p.num} onMouseEnter={() => setHoverLap(p.num)} className="cursor-pointer">
              {/* Stress Marker */}
              <circle
                cx={p.x}
                cy={p.stressY}
                r={p.num === currentLapNumber ? 5 : 3.5}
                fill="#e11d48"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              {/* Delta Marker */}
              <circle
                cx={p.x}
                cy={p.deltaY}
                r={p.num === currentLapNumber ? 5 : 3.5}
                fill="#2563eb"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </g>
          ))}

          {/* Active Lap Vertical Cursor */}
          {activePoint && (
            <line
              x1={activePoint.x}
              y1={10}
              x2={activePoint.x}
              y2={height - 10}
              stroke="#0f172a"
              strokeWidth="1"
              strokeDasharray="2,2"
              opacity="0.3"
            />
          )}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 font-data-mono text-[10px] bg-white/95 backdrop-blur p-2 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-blue-600 rounded-full"></span>
            <span className="text-slate-800 font-semibold">Delta Time</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-rose-600 border-t border-dashed border-rose-600"></span>
            <span className="text-slate-800 font-semibold">Stress Score</span>
          </div>
        </div>

        {/* Active Lap Tooltip */}
        {activePoint && (
          <div className="absolute bottom-2 left-2 font-data-mono text-[10px] bg-white/95 border border-slate-200 px-2.5 py-1 rounded-md text-slate-700 shadow-2xs">
            LAP {activePoint.num}: Stress <span className="text-rose-600 font-bold">{activePoint.lap.overallStress}</span> | Delta <span className="text-blue-600 font-bold">{activePoint.lap.lapDelta}</span>
          </div>
        )}
      </div>
    </div>
  );
};
