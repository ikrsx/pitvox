import React, { useState, useEffect } from 'react';
import { TopAppBar } from './components/TopAppBar';
import { LapTabs } from './components/LapTabs';
import { KpiRow } from './components/KpiRow';
import { ZoneRibbon } from './components/ZoneRibbon';
import { TelemetryTable } from './components/TelemetryTable';
import { FocalAnalysis } from './components/FocalAnalysis';
import { BiometricGauge } from './components/BiometricGauge';
import { StressChart } from './components/StressChart';
import { SystemNotices } from './components/SystemNotices';
import { RadioSimModal } from './components/RadioSimModal';
import { AiModelEvaluationModal } from './components/AiModelEvaluationModal';
import { DeviceConnectivityModal } from './components/DeviceConnectivityModal';

import { TELEMETRY_LAPS, DEFAULT_DRIVER, DEFAULT_NOTICES } from './data/telemetryData';
import { LapData, ZoneData, SystemNotice, IngestedTelemetryPayload } from './types';
import { radioAudioEngine } from './utils/audioSynthesizer';

export default function App() {
  const [telemetryLaps, setTelemetryLaps] = useState<Record<number, LapData>>(TELEMETRY_LAPS);
  const [activeLap, setActiveLap] = useState<number>(52);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('Z4');
  const [notices, setNotices] = useState<SystemNotice[]>(DEFAULT_NOTICES);

  // Audio Playback State
  const [playingAudioZoneId, setPlayingAudioZoneId] = useState<string | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);

  // Radio Simulator Modal State
  const [isRadioSimOpen, setIsRadioSimOpen] = useState<boolean>(false);

  // AI Model Evaluation Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [aiModalTab, setAiModalTab] = useState<'audio' | 'vitals' | 'graph' | 'multimodal'>('multimodal');

  // Device Connectivity Modal State
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);

  const currentLap = telemetryLaps[activeLap] || telemetryLaps[52];
  const selectedZone =
    currentLap.zones.find((z) => z.id === selectedZoneId) || currentLap.zones[0];

  const handleOpenAiModal = (tab: 'audio' | 'vitals' | 'graph' | 'multimodal' = 'multimodal') => {
    setAiModalTab(tab);
    setIsAiModalOpen(true);
  };

  // Handle live ingested sensor telemetry packet
  const handleLiveTelemetryIngested = (payload: IngestedTelemetryPayload, aiDiagnostic?: string) => {
    setTelemetryLaps((prev) => {
      const current = prev[activeLap];
      if (!current) return prev;

      const updatedZones = current.zones.map((zone) => {
        if (zone.id === selectedZoneId) {
          const newHr = payload.heartRate || zone.hrBpm;
          const newG = payload.gForce || zone.gForce;
          const newTranscript = payload.transcript || zone.transcript;

          const newStress = Math.min(
            100,
            Math.max(10, Math.round((newHr / 200) * 70 + (newG / 5) * 30))
          );
          const newStatus = newStress >= 80 ? 'CRITICAL' : newStress >= 60 ? 'ELEVATED' : 'CALM';

          return {
            ...zone,
            hrBpm: newHr,
            gForce: newG,
            transcript: newTranscript,
            stressScore: newStress,
            status: newStatus,
          };
        }
        return zone;
      });

      return {
        ...prev,
        [activeLap]: {
          ...current,
          zones: updatedZones,
        },
      };
    });

    if (aiDiagnostic) {
      setNotices((prev) => [
        {
          id: `notice-live-${Date.now()}`,
          type: 'priority',
          title: `LIVE TELEMETRY INGESTION DIAGNOSTIC`,
          message: aiDiagnostic,
        },
        ...prev.slice(0, 4),
      ]);
    }
  };

  // Handle Audio Toggle for a zone
  const handleToggleAudio = (zone: ZoneData) => {
    if (playingAudioZoneId === zone.id) {
      radioAudioEngine.stop();
      setPlayingAudioZoneId(null);
      setAudioCurrentTime(0);
    } else {
      setSelectedZoneId(zone.id);
      setPlayingAudioZoneId(zone.id);
      setAudioCurrentTime(0);

      radioAudioEngine.speakRadioMessage(
        zone.transcript,
        zone.audioDuration || 5,
        (currTime) => setAudioCurrentTime(currTime),
        () => {
          setPlayingAudioZoneId(null);
          setAudioCurrentTime(0);
        }
      );
    }
  };

  // Handle switching lap
  const handleSelectLap = (lapNum: number) => {
    setActiveLap(lapNum);
    const lap = telemetryLaps[lapNum];
    if (lap) {
      // Find highest stress zone in this lap as default active
      const worstZone = [...lap.zones].sort((a, b) => b.stressScore - a.stressScore)[0];
      if (worstZone) {
        setSelectedZoneId(worstZone.id);
      }
    }
    radioAudioEngine.stop();
    setPlayingAudioZoneId(null);
  };

  // Simulate a new lap
  const handleAddLap = () => {
    const existingNums = Object.keys(telemetryLaps).map(Number);
    const nextLapNum = Math.max(...existingNums) + 1;

    // Create realistic next lap
    const newLap: LapData = {
      lapNumber: nextLapNum,
      lapTime: '1:43.050',
      lapDelta: '-0.860s',
      isDeltaPositive: true,
      overallStress: 35,
      priorityZone: 'ZONE 3',
      priorityCorner: 'Eau Rouge',
      vitalsStatus: 'ACTIVE',
      zones: [
        {
          id: 'Z1',
          zoneNumber: 1,
          cornerName: 'La Source',
          timeRange: '00:00–00:12',
          stressScore: 21,
          status: 'CALM',
          hrBpm: 122,
          brRate: 15,
          gForce: 2.1,
          keywords: ['OPTIMAL'],
          transcript: 'Traction out of turn 1 is mega.',
          audioDuration: 3,
        },
        {
          id: 'Z2',
          zoneNumber: 2,
          cornerName: 'Raidillon',
          timeRange: '00:12–00:26',
          stressScore: 22,
          status: 'CALM',
          hrBpm: 125,
          brRate: 15,
          gForce: 3.3,
          keywords: ['PURPLE S1'],
          transcript: 'Sector 1 is purple by 0.14s.',
          audioDuration: 4,
        },
        {
          id: 'Z3',
          zoneNumber: 3,
          cornerName: 'Eau Rouge',
          timeRange: '00:26–00:38',
          stressScore: 38,
          status: 'CALM',
          hrBpm: 131,
          brRate: 16,
          gForce: 4.1,
          keywords: ['CLEAN'],
          transcript: 'Eau Rouge clean, car feels planted.',
          audioDuration: 4,
        },
        {
          id: 'Z4',
          zoneNumber: 4,
          cornerName: 'Kemmel',
          timeRange: '00:38–00:50',
          stressScore: 36,
          status: 'CALM',
          hrBpm: 128,
          brRate: 16,
          gForce: 3.6,
          keywords: ['HIGH SPEED'],
          transcript: 'Speed trap 315 km/h on straight.',
          audioDuration: 4,
        },
        {
          id: 'Z5',
          zoneNumber: 5,
          cornerName: 'Les Combes',
          timeRange: '00:50–01:04',
          stressScore: 32,
          status: 'CALM',
          hrBpm: 126,
          brRate: 15,
          gForce: 2.8,
          keywords: ['NOMINAL'],
          transcript: 'Late braking, no lockups.',
          audioDuration: 3,
        },
        {
          id: 'Z6',
          zoneNumber: 6,
          cornerName: 'Malmedy',
          timeRange: '01:04–01:14',
          stressScore: 30,
          status: 'CALM',
          hrBpm: 124,
          brRate: 15,
          gForce: 2.4,
          keywords: ['STABLE'],
          transcript: 'Rear grip fixed completely.',
          audioDuration: 3,
        },
        {
          id: 'Z7',
          zoneNumber: 7,
          cornerName: 'Bruxelles',
          timeRange: '01:14–01:28',
          stressScore: 28,
          status: 'CALM',
          hrBpm: 123,
          brRate: 15,
          gForce: 2.6,
          keywords: ['BEST LAP'],
          transcript: 'Pace is unreal, box gap is 24 seconds.',
          audioDuration: 4,
        },
      ],
    };

    setTelemetryLaps((prev) => ({ ...prev, [nextLapNum]: newLap }));
    setActiveLap(nextLapNum);
    setSelectedZoneId('Z3');
  };

  // Inject radio transcript from simulator
  const handleInjectComms = (
    zoneId: string,
    transcript: string,
    newStressScore: number,
    keywords: string[]
  ) => {
    setTelemetryLaps((prev) => {
      const current = prev[activeLap];
      if (!current) return prev;

      const updatedZones = current.zones.map((z) => {
        if (z.id === zoneId) {
          return {
            ...z,
            transcript,
            stressScore: newStressScore,
            status:
              newStressScore >= 80 ? 'CRITICAL' : newStressScore >= 50 ? 'ELEVATED' : 'CALM',
            keywords,
            requirementNote: `Driver voice comms update: ${keywords.join(', ')}`,
          };
        }
        return z;
      });

      // Recalculate overall stress
      const avgStress = Math.round(
        updatedZones.reduce((acc, curr) => acc + curr.stressScore, 0) / updatedZones.length
      );

      return {
        ...prev,
        [activeLap]: {
          ...current,
          overallStress: avgStress,
          zones: updatedZones,
        },
      };
    });

    // Update system notices
    setNotices((prevNotices) => [
      {
        id: `notice-${Date.now()}`,
        type: newStressScore >= 75 ? 'priority' : newStressScore >= 50 ? 'watch' : 'stable',
        title: newStressScore >= 75 ? 'PRIORITY UPDATE' : 'COMM UPDATE',
        message: `Radio comms injected for ${zoneId}: "${transcript.slice(0, 70)}..."`,
      },
      ...prevNotices.slice(0, 2),
    ]);
  };

  const availableLapNumbers = Object.keys(telemetryLaps)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="bg-[#f8fafc] text-slate-800 font-sans antialiased min-h-screen flex flex-col overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <TopAppBar
        driver={DEFAULT_DRIVER}
        onOpenRadioSim={() => setIsRadioSimOpen(true)}
        onOpenAiModal={handleOpenAiModal}
        onOpenDeviceConnectivity={() => setIsDeviceModalOpen(true)}
      />

      {/* Main Content */}
      <div className="flex-1 mt-16 flex flex-col pb-16">
        {/* Lap Navigation Bar */}
        <LapTabs
          availableLaps={availableLapNumbers}
          activeLap={activeLap}
          onSelectLap={handleSelectLap}
          onAddLap={handleAddLap}
        />

        {/* Scrollable Container */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full space-y-4 md:space-y-6">
          {/* KPI Row */}
          <KpiRow lap={currentLap} baselineStress={DEFAULT_DRIVER.baselineStress} />

          {/* Stress Topology Map / Ribbon */}
          <ZoneRibbon
            zones={currentLap.zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
            trackName={DEFAULT_DRIVER.trackName}
          />

          {/* Main Data Table */}
          <TelemetryTable
            zones={currentLap.zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={(zoneId) => setSelectedZoneId(zoneId)}
            playingAudioZoneId={playingAudioZoneId}
            onToggleAudio={handleToggleAudio}
            lapNumber={activeLap}
          />

          {/* Focal Analysis + Biometric Gauge & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Left Column: Focal Analysis Selected Zone Detail */}
            <FocalAnalysis
              zone={selectedZone}
              isPlaying={playingAudioZoneId === selectedZone.id}
              onToggleAudio={handleToggleAudio}
              audioCurrentTime={audioCurrentTime}
            />

            {/* Right Column: Biometric Load Gauge & Trend Chart */}
            <div className="flex flex-col gap-4 md:gap-6">
              <div className="h-1/2 min-h-[220px]">
                <BiometricGauge
                  score={selectedZone.stressScore}
                  zoneName={selectedZone.cornerName}
                  onOpenAiModal={handleOpenAiModal}
                />
              </div>

              <div className="h-1/2 min-h-[220px]">
                <StressChart
                  allLaps={telemetryLaps}
                  currentLapNumber={activeLap}
                  onOpenAiModal={handleOpenAiModal}
                />
              </div>
            </div>
          </div>

          {/* System Notices / Attention Panel */}
          <SystemNotices notices={notices} />
        </main>
      </div>

      {/* Footer Bar */}
      <footer className="w-full bg-white/90 backdrop-blur border-t border-slate-200 p-2.5 text-center fixed bottom-0 z-40">
        <p className="font-data-mono text-[10px] md:text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
          INTERNAL USE ONLY. Biometric data stream encrypted. All data is subject to team confidentiality agreements.
        </p>
      </footer>

      {/* Interactive Radio Simulator Modal */}
      <RadioSimModal
        isOpen={isRadioSimOpen}
        onClose={() => setIsRadioSimOpen(false)}
        selectedZone={selectedZone}
        onInjectComms={handleInjectComms}
        onOpenAiModal={handleOpenAiModal}
      />

      {/* Multimodal AI Model Evaluation Modal */}
      <AiModelEvaluationModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        activeTab={aiModalTab}
        currentZone={selectedZone}
        selectedLap={currentLap}
        driver={DEFAULT_DRIVER}
        allLaps={availableLapNumbers.map((num) => telemetryLaps[num])}
      />

      {/* Sensor Connectivity & Data Ingestion Modal */}
      <DeviceConnectivityModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        activeZone={selectedZone}
        onLiveTelemetryIngested={handleLiveTelemetryIngested}
        onOpenAiModal={handleOpenAiModal}
      />
    </div>
  );
}
