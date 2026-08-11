import React from 'react';
import { HeartPulse, AlertTriangle, Timer, Activity } from 'lucide-react';
import { LapData } from '../types';

interface KpiRowProps {
  lap: LapData;
  baselineStress: number;
}

export const KpiRow: React.FC<KpiRowProps> = ({ lap, baselineStress }) => {
  // Determine color based on stress
  const getStressColor = (score: number) => {
    if (score >= 70) return '#e11d48'; // rose-600
    if (score >= 45) return '#d97706'; // amber-600
    return '#059669'; // emerald-600
  };

  const stressColor = getStressColor(lap.overallStress);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* KPI 1: OVERALL STRESS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden group hover:border-slate-300 transition-all">
        <div
          className="absolute left-0 top-0 bottom-0 w-1 transition-colors"
          style={{ backgroundColor: stressColor }}
        ></div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            OVERALL STRESS
          </span>
          <HeartPulse className="w-4 h-4" style={{ color: stressColor }} />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span
            className="text-3xl font-black tracking-tight"
            style={{ color: stressColor }}
          >
            {lap.overallStress}
          </span>
          <span className="font-data-mono text-xs font-semibold text-slate-400">/ 100</span>
        </div>
        <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, lap.overallStress)}%`,
              backgroundColor: stressColor,
            }}
          ></div>
        </div>
        <div className="mt-2 font-data-mono text-[10px] text-slate-500">
          Driver baseline: {baselineStress}
        </div>
      </div>

      {/* KPI 2: PRIORITY ZONE */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden hover:border-slate-300 transition-all">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            PRIORITY ZONE
          </span>
          <AlertTriangle className="w-4 h-4 text-amber-500" />
        </div>
        <div className="flex flex-col mt-2">
          <span className="text-2xl font-black text-slate-900 tracking-tight">
            {lap.priorityZone}
          </span>
          <span className="font-medium text-xs text-amber-600 mt-0.5">
            {lap.priorityCorner}
          </span>
        </div>
      </div>

      {/* KPI 3: LAP TIME DELTA */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden hover:border-slate-300 transition-all">
        <div
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            lap.isDeltaPositive ? 'bg-emerald-500' : 'bg-rose-500'
          }`}
        ></div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            LAP TIME DELTA
          </span>
          <Timer className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex items-baseline gap-2 mt-2">
          <span
            className={`font-data-mono text-2xl font-black tracking-tight ${
              lap.isDeltaPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {lap.lapDelta}
          </span>
        </div>
        <div className="mt-2 font-data-mono text-[10px] text-slate-500 uppercase tracking-wider">
          Lap Time: {lap.lapTime}
        </div>
      </div>

      {/* KPI 4: VITALS FEED */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs relative overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500"></div>
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            VITALS FEED
          </span>
          <Activity className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="flex items-center my-auto pt-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold tracking-wider uppercase">
              {lap.vitalsStatus}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
