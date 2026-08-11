import React, { useEffect, useState } from 'react';
import { Timer, Signal, Mic, Radio, Cpu, Sparkles, Wifi } from 'lucide-react';
import { DriverInfo } from '../types';

interface TopAppBarProps {
  driver: DriverInfo;
  onOpenRadioSim: () => void;
  onOpenAiModal: (tab?: 'audio' | 'vitals' | 'graph' | 'multimodal') => void;
  onOpenDeviceConnectivity: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  driver,
  onOpenRadioSim,
  onOpenAiModal,
  onOpenDeviceConnectivity,
}) => {
  const [seconds, setSeconds] = useState(45 * 60 + 12); // 00:45:12 initial session clock

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatClock = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const secs = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white/95 backdrop-blur-md border-b border-slate-200 flex justify-between items-center px-4 md:px-8 z-50 shadow-xs">
      {/* Left Brand & Driver */}
      <div className="flex items-center gap-4 md:gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-md flex items-center justify-center text-white font-black text-lg shadow-sm">
            λ
          </div>
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none">
              PitVox Engine
            </h1>
            <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              Driver State & Voice Intelligence
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

        <div className="hidden md:flex items-center gap-2">
          <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2.5 py-1 rounded-md border border-slate-200 font-data-mono">
            {driver.carNumber}
          </span>
          <span className="font-bold text-sm text-slate-800">
            {driver.driverName}
          </span>
        </div>
      </div>

      {/* Right Controls & Live Status */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {/* Device Connectivity Hub Button */}
        <button
          onClick={onOpenDeviceConnectivity}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs transition-all shadow-sm active:scale-95"
          title="Open Sensor Connectivity & Link Devices Page"
        >
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">Device Link</span>
        </button>

        {/* AI Evaluation Hub Button */}
        <button
          onClick={() => onOpenAiModal('multimodal')}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs transition-all shadow-sm active:scale-95"
          title="Open Multimodal AI Model Evaluation Hub"
        >
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span className="hidden sm:inline">AI Model Hub</span>
        </button>

        {/* Simulate Comms Button */}
        <button
          onClick={onOpenRadioSim}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 active:scale-95"
          title="Open Live Radio Comms Simulator"
        >
          <Mic className="w-3.5 h-3.5 animate-pulse" />
          <span className="hidden sm:inline">Simulate Comms</span>
        </button>

        {/* Session Clock */}
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            SESSION CLOCK
          </span>
          <span className="font-data-mono text-xs md:text-sm font-bold text-slate-900 tracking-tight">
            {formatClock(seconds)}
          </span>
        </div>

        {/* Live Pip Badge */}
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold tracking-wider uppercase">ACTIVE</span>
        </div>

        {/* Icons */}
        <div className="hidden sm:flex items-center gap-3 text-slate-400 border-l border-slate-200 pl-4">
          <Timer className="w-4 h-4 hover:text-slate-700 cursor-pointer transition-colors" title="Session Timing" />
          <Signal className="w-4 h-4 hover:text-slate-700 cursor-pointer transition-colors" title="Telemetry Uplink 100%" />
          <Radio className="w-4 h-4 hover:text-slate-700 cursor-pointer transition-colors" title="Audio Channel 1" />
        </div>
      </div>
    </header>
  );
};
