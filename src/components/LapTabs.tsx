import React from 'react';
import { Plus } from 'lucide-react';

interface LapTabsProps {
  availableLaps: number[];
  activeLap: number;
  onSelectLap: (lap: number) => void;
  onAddLap?: () => void;
}

export const LapTabs: React.FC<LapTabsProps> = ({
  availableLaps,
  activeLap,
  onSelectLap,
  onAddLap,
}) => {
  return (
    <nav className="sticky top-16 w-full h-12 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center gap-2 md:gap-3 px-4 md:px-8 overflow-x-auto scrollbar-hide z-40 shadow-2xs">
      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest shrink-0 mr-2">
        LAP DATA
      </span>

      {availableLaps.map((lapNum) => {
        const isActive = lapNum === activeLap;
        return (
          <button
            key={lapNum}
            onClick={() => onSelectLap(lapNum)}
            className={`whitespace-nowrap px-3.5 py-1 rounded-md font-data-mono text-xs transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-slate-400 ${
              isActive
                ? 'bg-slate-900 text-white font-semibold shadow-xs border border-slate-900'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
            }`}
          >
            {isActive && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
            LAP {lapNum}
          </button>
        );
      })}

      {onAddLap && (
        <button
          onClick={onAddLap}
          className="whitespace-nowrap px-3 py-1 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1 shrink-0 ml-2"
          title="Simulate Next Lap Telemetry"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Lap</span>
        </button>
      )}
    </nav>
  );
};
