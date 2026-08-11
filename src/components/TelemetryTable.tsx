import React, { useState } from 'react';
import { Play, Pause, Filter, Download, Search } from 'lucide-react';
import { ZoneData } from '../types';

interface TelemetryTableProps {
  zones: ZoneData[];
  selectedZoneId: string;
  onSelectZone: (zoneId: string) => void;
  playingAudioZoneId: string | null;
  onToggleAudio: (zone: ZoneData) => void;
  lapNumber: number;
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({
  zones,
  selectedZoneId,
  onSelectZone,
  playingAudioZoneId,
  onToggleAudio,
  lapNumber,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [onlyHighStress, setOnlyHighStress] = useState(false);

  // Filtered zones
  const filteredZones = zones.filter((z) => {
    if (onlyHighStress && z.stressScore < 60) return false;
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return (
      z.id.toLowerCase().includes(q) ||
      z.cornerName.toLowerCase().includes(q) ||
      z.transcript.toLowerCase().includes(q) ||
      z.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });

  const handleExportCSV = () => {
    const csvHeader = 'Zone,Corner,Timestamp,StressScore,Status,BPM,BR,GForce,Keywords,Transcript\n';
    const csvRows = zones
      .map(
        (z) =>
          `"${z.id}","${z.cornerName}","${z.timeRange}",${z.stressScore},"${z.status}",${z.hrBpm},${z.brRate},${z.gForce},"${z.keywords.join(';')}",${JSON.stringify(z.transcript)}`
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PitVox_Lap_${lapNumber}_Telemetry.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score: number) => {
    if (score >= 65) return '#e11d48';
    if (score >= 42) return '#d97706';
    return '#059669';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Bar */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap justify-between items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-800 tracking-wider uppercase">
            TELEMETRY & COMM SCRIPT
          </span>
          <span className="font-data-mono text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full font-bold border border-blue-200">
            LAP {lapNumber}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilterBar(!showFilterBar)}
            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              showFilterBar || onlyHighStress
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'border-slate-200 hover:bg-slate-50 text-slate-700 bg-white'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filter</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-slate-700 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs"
            title="Download CSV Telemetry Export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Filter Bar input drawer */}
      {showFilterBar && (
        <div className="bg-slate-50 p-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search zone, keywords, or transcript..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyHighStress}
              onChange={(e) => setOnlyHighStress(e.target.checked)}
              className="accent-rose-600 rounded"
            />
            <span>High Stress Only (60+)</span>
          </label>
        </div>
      )}

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Zone
              </th>
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Time / Corner
              </th>
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Stress
              </th>
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Vitals
              </th>
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest">
                Keywords
              </th>
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest w-1/3">
                Transcript
              </th>
              <th className="p-3.5 text-[10px] text-slate-400 uppercase font-bold tracking-widest text-center">
                Audio
              </th>
            </tr>
          </thead>
          <tbody className="font-data-mono text-xs divide-y divide-slate-100">
            {filteredZones.map((zone) => {
              const isSelected = zone.id === selectedZoneId;
              const isPlaying = playingAudioZoneId === zone.id;
              const color = getScoreColor(zone.stressScore);

              return (
                <tr
                  key={zone.id}
                  onClick={() => onSelectZone(zone.id)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectZone(zone.id);
                    }
                  }}
                  className={`transition-colors cursor-pointer border-l-4 ${
                    isSelected
                      ? 'bg-blue-50/50 border-blue-600'
                      : 'hover:bg-slate-50/80 border-transparent'
                  }`}
                >
                  {/* Zone ID */}
                  <td className="p-3.5 text-slate-900 font-bold font-display text-base">
                    {zone.id}
                  </td>

                  {/* Time / Corner */}
                  <td className="p-3.5 text-slate-600">
                    <span className="font-data-mono font-semibold text-slate-900">{zone.timeRange}</span>
                    <br />
                    <span className="text-[10px] font-bold tracking-wide" style={{ color }}>
                      {zone.cornerName}
                    </span>
                  </td>

                  {/* Stress Bar + Numeric */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, zone.stressScore)}%`,
                            backgroundColor: color,
                          }}
                        ></div>
                      </div>
                      <span className="font-bold text-sm" style={{ color }}>
                        {zone.stressScore}
                      </span>
                    </div>
                  </td>

                  {/* Vitals */}
                  <td className="p-3.5 text-slate-600">
                    {zone.hrBpm > 0 ? (
                      <>
                        <span className="text-slate-900 font-semibold">{zone.hrBpm} BPM</span>
                        <br />
                        <span className="text-[10px] text-slate-400">{zone.brRate} BR</span>
                      </>
                    ) : (
                      <span className="italic text-slate-400">n/a</span>
                    )}
                  </td>

                  {/* Keywords */}
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1">
                      {zone.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200 text-[10px] font-semibold tracking-wide"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </td>

                  {/* Transcript Quote */}
                  <td className="p-3.5 font-sans text-sm text-slate-800 italic leading-relaxed">
                    "{zone.transcript}"
                  </td>

                  {/* Audio Button */}
                  <td className="p-3.5 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleAudio(zone);
                      }}
                      className={`p-1.5 rounded-full transition-all focus:outline-none ${
                        isPlaying
                          ? 'text-rose-600 bg-rose-50 border border-rose-200 shadow-2xs'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-slate-100'
                      }`}
                      title={isPlaying ? 'Pause Audio' : 'Play Audio Comms'}
                    >
                      {isPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredZones.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500 italic font-sans">
                  No telemetry records found matching filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
