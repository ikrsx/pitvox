import React from 'react';
import { ZoneData } from '../types';

interface ZoneRibbonProps {
  zones: ZoneData[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  trackName?: string;
}

export const ZoneRibbon: React.FC<ZoneRibbonProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  trackName = 'SPA FRANCORCHAMPS',
}) => {
  const getRibbonClass = (score: number) => {
    if (score >= 65) return 'ribbon-red';
    if (score >= 42) return 'ribbon-amber';
    return 'ribbon-green';
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          STRESS TOPOLOGY MAP — {trackName}
        </span>
        <span className="text-[10px] font-medium text-slate-400">
          Click zone for focal detail
        </span>
      </div>

      {/* Ribbon Bar */}
      <div className="w-full flex h-12 rounded-lg overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const ribbonStyle = getRibbonClass(zone.stressScore);
          const flexRatio = zone.stressScore >= 80 ? 'flex-[2]' : zone.cornerName.length > 8 ? 'flex-[1.5]' : 'flex-1';

          return (
            <div
              key={zone.id}
              onClick={() => onSelectZone(zone.id)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  onSelectZone(zone.id);
                }
              }}
              title={`${zone.id} - ${zone.cornerName}: Stress ${zone.stressScore}`}
              className={`${ribbonStyle} ${flexRatio} relative cursor-pointer border-r border-white/40 transition-all duration-150 hover:brightness-105 focus:outline-none flex items-center justify-center`}
            >
              <span className="font-data-mono text-xs font-bold text-white drop-shadow-xs">
                {zone.id} · {zone.stressScore}
              </span>

              {/* Active Selection Frame */}
              {isSelected && (
                <div className="absolute -top-0.5 -bottom-0.5 left-0 right-0 border-2 border-slate-900 rounded-md z-10 pointer-events-none shadow-sm"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels below ribbon */}
      <div className="w-full flex mt-2.5 font-data-mono text-[11px] text-slate-500 uppercase text-center tracking-wider">
        {zones.map((zone) => {
          const isSelected = zone.id === selectedZoneId;
          const flexRatio = zone.stressScore >= 80 ? 'flex-[2]' : zone.cornerName.length > 8 ? 'flex-[1.5]' : 'flex-1';

          return (
            <div
              key={`label-${zone.id}`}
              onClick={() => onSelectZone(zone.id)}
              className={`${flexRatio} truncate px-1 cursor-pointer transition-colors ${
                isSelected ? 'text-slate-900 font-bold underline decoration-blue-600 underline-offset-4' : 'hover:text-slate-800'
              }`}
            >
              {zone.cornerName}
            </div>
          );
        })}
      </div>
    </div>
  );
};
