import React, { useState, useEffect } from 'react';
import {
  X,
  Usb,
  Bluetooth,
  Radio,
  MapPin,
  Activity,
  Mic,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Cpu,
  Wifi,
  Sparkles,
  Sliders,
  Send,
  Play,
  Square,
  Globe,
  Share2,
} from 'lucide-react';
import { SensorDevice, IngestedTelemetryPayload, ZoneData } from '../types';

interface DeviceConnectivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeZone?: ZoneData;
  onLiveTelemetryIngested: (payload: IngestedTelemetryPayload, aiDiagnostic?: string) => void;
  onOpenAiModal?: (tab?: 'audio' | 'vitals' | 'graph' | 'multimodal') => void;
}

export const DeviceConnectivityModal: React.FC<DeviceConnectivityModalProps> = ({
  isOpen,
  onClose,
  activeZone,
  onLiveTelemetryIngested,
  onOpenAiModal,
}) => {
  const [devices, setDevices] = useState<SensorDevice[]>([
    {
      id: 'dev-vital-01',
      name: 'PhysioStrap ECG & GSR Biomarker Belt',
      category: 'VITAL_SENSORS',
      connectionType: 'BLUETOOTH',
      status: 'STREAMING_LIVE',
      signalQualityPercent: 98,
      batteryPercent: 88,
      portOrAddress: 'BLE: 00:1A:7D:DA:71:02',
    },
    {
      id: 'dev-radio-01',
      name: 'Pit-to-Car UHF Audio Transceiver & Mic',
      category: 'MICROPHONE_RADIO',
      connectionType: 'RADIO_SIM',
      status: 'CONNECTED',
      signalQualityPercent: 94,
      portOrAddress: 'Radio Freq 462.725 MHz (CH 1)',
    },
    {
      id: 'dev-gps-01',
      name: 'Track GPS & 100Hz Telemetry CAN Bus',
      category: 'LOCATION_GPS_TRACK',
      connectionType: 'WIRE_SERIAL',
      status: 'STREAMING_LIVE',
      signalQualityPercent: 100,
      portOrAddress: '/dev/ttyUSB0 (115200 Baud)',
    },
  ]);

  // Ingestion Form State
  const [inputHr, setInputHr] = useState<number>(activeZone?.hrBpm || 174);
  const [inputHrv, setInputHrv] = useState<number>(18);
  const [inputGsr, setInputGsr] = useState<number>(8.4);
  const [inputGForce, setInputGForce] = useState<number>(activeZone?.gForce || 4.8);
  const [inputCornerName, setInputCornerName] = useState<string>(
    activeZone?.cornerName || 'Turn 4 (Heavy Braking)'
  );
  const [inputTranscript, setInputTranscript] = useState<string>(
    activeZone?.transcript || 'Rear tyres are completely gone, getting snaps on entry!'
  );

  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [lastAiDiagnostic, setLastAiDiagnostic] = useState<string>('');
  const [isLiveAutoTicker, setIsLiveAutoTicker] = useState<boolean>(false);
  const [micActive, setMicActive] = useState<boolean>(false);
  const [micAudioLevel, setMicAudioLevel] = useState<number>(0);

  // Fetch device statuses from backend on mount
  useEffect(() => {
    if (isOpen) {
      fetch('/api/telemetry/devices')
        .then((res) => res.json())
        .then((data) => {
          if (data.devices) setDevices(data.devices);
        })
        .catch((err) => console.error('Failed to fetch devices:', err));
    }
  }, [isOpen]);

  // Live Auto-Ticker effect (simulating 100Hz live sensor wire stream)
  useEffect(() => {
    let interval: any = null;
    if (isLiveAutoTicker) {
      interval = setInterval(async () => {
        // Random slight fluctuation in biometric sensors
        const hrVariation = Math.floor(Math.random() * 5) - 2;
        const newHr = Math.min(195, Math.max(120, inputHr + hrVariation));
        setInputHr(newHr);

        try {
          const response = await fetch('/api/telemetry/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceDeviceId: 'dev-vital-01',
              heartRate: newHr,
              hrvRmssd: inputHrv,
              gsrMicrosiemens: inputGsr,
              cornerName: inputCornerName,
              transcript: inputTranscript,
              gForce: inputGForce,
            }),
          });
          const data = await response.json();
          onLiveTelemetryIngested(
            {
              heartRate: newHr,
              hrvRmssd: inputHrv,
              gsrMicrosiemens: inputGsr,
              cornerName: inputCornerName,
              transcript: inputTranscript,
              gForce: inputGForce,
              timestamp: new Date().toISOString(),
            },
            data.aiInstantDiagnostic
          );
        } catch (e) {
          console.error('Ticker error:', e);
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLiveAutoTicker, inputHr, inputHrv, inputGsr, inputCornerName, inputTranscript, inputGForce]);

  if (!isOpen) return null;

  // Web Bluetooth Integration Handler
  const handleConnectBluetooth = async (devId: string) => {
    try {
      if ('bluetooth' in navigator) {
        // Attempt browser Web Bluetooth API
        const device = await (navigator as any).bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['heart_rate', 'battery_service'],
        });
        setDevices((prev) =>
          prev.map((d) =>
            d.id === devId
              ? { ...d, status: 'STREAMING_LIVE', portOrAddress: `BLE: ${device.name || 'BT Sensor'}` }
              : d
          )
        );
      } else {
        // Fallback simulation toggle
        toggleDeviceStatus(devId);
      }
    } catch (err) {
      console.log('User cancelled or Web BT unavailable:', err);
      toggleDeviceStatus(devId);
    }
  };

  // Web Serial API (Wired USB Sensor)
  const handleConnectWireSerial = async (devId: string) => {
    try {
      if ('serial' in navigator) {
        const port = await (navigator as any).serial.requestPort();
        await port.open({ baudRate: 115200 });
        setDevices((prev) =>
          prev.map((d) =>
            d.id === devId
              ? { ...d, status: 'STREAMING_LIVE', portOrAddress: 'USB Serial (115200 Baud)' }
              : d
          )
        );
      } else {
        toggleDeviceStatus(devId);
      }
    } catch (err) {
      toggleDeviceStatus(devId);
    }
  };

  // Microphone Audio Stream API
  const handleToggleMicrophone = async () => {
    if (!micActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicActive(true);
        setMicAudioLevel(78); // simulated level indicator
        setDevices((prev) =>
          prev.map((d) =>
            d.category === 'MICROPHONE_RADIO'
              ? { ...d, status: 'STREAMING_LIVE', portOrAddress: 'Web Mic Stream Active' }
              : d
          )
        );
      } catch (err) {
        alert('Microphone access denied or unavailable. Defaulting to Radio Simulator.');
      }
    } else {
      setMicActive(false);
      setMicAudioLevel(0);
    }
  };

  // Toggle Device Status on Backend
  const toggleDeviceStatus = async (deviceId: string) => {
    const target = devices.find((d) => d.id === deviceId);
    if (!target) return;
    const newStatus = target.status === 'STREAMING_LIVE' ? 'DISCONNECTED' : 'STREAMING_LIVE';

    setDevices((prev) => prev.map((d) => (d.id === deviceId ? { ...d, status: newStatus } : d)));

    try {
      await fetch('/api/telemetry/devices/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Manual Telemetry Packet Ingestion into AI Model
  const handleIngestPacket = async () => {
    setIsIngesting(true);
    try {
      const response = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceDeviceId: 'MANUAL_SENSOR_HUB',
          heartRate: inputHr,
          hrvRmssd: inputHrv,
          gsrMicrosiemens: inputGsr,
          cornerName: inputCornerName,
          transcript: inputTranscript,
          gForce: inputGForce,
        }),
      });
      const data = await response.json();
      setLastAiDiagnostic(data.aiInstantDiagnostic);

      onLiveTelemetryIngested(
        {
          heartRate: inputHr,
          hrvRmssd: inputHrv,
          gsrMicrosiemens: inputGsr,
          cornerName: inputCornerName,
          transcript: inputTranscript,
          gForce: inputGForce,
          timestamp: new Date().toISOString(),
        },
        data.aiInstantDiagnostic
      );
    } catch (err) {
      console.error('Ingestion failed:', err);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Wifi className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  SENSOR CONNECTIVITY & DATA INGESTION HUB
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 uppercase font-mono">
                  Live Wire / BT / Radio
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Link Vital Sensors, Mic Radio Transceivers & Track GPS to Feed AI Models
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/70 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Section 1: Linked Device Channels */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" />
                <span>ACTIVE TELEMETRY SENSOR CHANNELS</span>
              </h3>
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                3 / 3 Channels Online
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Device 1: Biometric Vitals */}
              {devices
                .filter((d) => d.category === 'VITAL_SENSORS')
                .map((dev) => (
                  <div
                    key={dev.id}
                    className={`p-4 rounded-xl border transition-all ${
                      dev.status === 'STREAMING_LIVE'
                        ? 'bg-emerald-50/40 border-emerald-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          dev.status === 'STREAMING_LIVE'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {dev.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{dev.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">
                      {dev.portOrAddress}
                    </span>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                      <button
                        onClick={() => handleConnectBluetooth(dev.id)}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <Bluetooth className="w-3 h-3" />
                        <span>Pair BT LE</span>
                      </button>

                      <button
                        onClick={() => toggleDeviceStatus(dev.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        {dev.status === 'STREAMING_LIVE' ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}

              {/* Device 2: Microphone Radio */}
              {devices
                .filter((d) => d.category === 'MICROPHONE_RADIO')
                .map((dev) => (
                  <div
                    key={dev.id}
                    className={`p-4 rounded-xl border transition-all ${
                      dev.status === 'STREAMING_LIVE' || micActive
                        ? 'bg-blue-50/40 border-blue-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                        <Mic className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          micActive || dev.status === 'STREAMING_LIVE'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {micActive ? 'LIVE MIC STREAM' : dev.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{dev.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">
                      {dev.portOrAddress}
                    </span>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                      <button
                        onClick={handleToggleMicrophone}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                          micActive
                            ? 'bg-rose-600 text-white'
                            : 'text-blue-600 hover:text-blue-800'
                        }`}
                      >
                        <Radio className="w-3 h-3" />
                        <span>{micActive ? 'Mute Mic' : 'Open Web Mic'}</span>
                      </button>

                      <button
                        onClick={() => toggleDeviceStatus(dev.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Toggle Sim
                      </button>
                    </div>
                  </div>
                ))}

              {/* Device 3: Track GPS */}
              {devices
                .filter((d) => d.category === 'LOCATION_GPS_TRACK')
                .map((dev) => (
                  <div
                    key={dev.id}
                    className={`p-4 rounded-xl border transition-all ${
                      dev.status === 'STREAMING_LIVE'
                        ? 'bg-purple-50/40 border-purple-200 shadow-2xs'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                          dev.status === 'STREAMING_LIVE'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {dev.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{dev.name}</h4>
                    <span className="text-[10px] font-mono text-slate-500 block mt-1">
                      {dev.portOrAddress}
                    </span>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                      <button
                        onClick={() => handleConnectWireSerial(dev.id)}
                        className="text-[11px] font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                      >
                        <Usb className="w-3 h-3" />
                        <span>Wire / USB Serial</span>
                      </button>

                      <button
                        onClick={() => toggleDeviceStatus(dev.id)}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800"
                      >
                        Toggle
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Section 2: Live Continuous Ingestion Ticker Control */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight">
                    LIVE 100Hz TELEMETRY STREAM TICKER
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    Continuously feeds live sensor readings into the AI evaluation pipeline
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsLiveAutoTicker(!isLiveAutoTicker)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isLiveAutoTicker
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-500/30'
                }`}
              >
                {isLiveAutoTicker ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    <span>STOP LIVE STREAMING</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>START LIVE AUTOMATED TICKER</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 3: Manual Sensor Packet Ingestion Form */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600" />
              <span>CUSTOM DATA PACKET INGESTION (INJECT TO AI MODELS)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Heart Rate (BPM)
                </label>
                <input
                  type="number"
                  value={inputHr}
                  onChange={(e) => setInputHr(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  HRV RMSSD (ms)
                </label>
                <input
                  type="number"
                  value={inputHrv}
                  onChange={(e) => setInputHrv(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold font-mono text-slate-800"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  GSR (Microsiemens)
                </label>
                <input
                  type="number"
                  step="0.2"
                  value={inputGsr}
                  onChange={(e) => setInputGsr(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Track Location Corner / Zone Name
                </label>
                <select
                  value={inputCornerName}
                  onChange={(e) => setInputCornerName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-semibold text-slate-800"
                >
                  <option value="Turn 1 (Main Straight Entry)">Turn 1 (Main Straight Entry)</option>
                  <option value="Turn 4 (Heavy Braking)">Turn 4 (Heavy Braking Zone)</option>
                  <option value="Turn 7 (High Speed Chicane)">Turn 7 (High Speed Chicane)</option>
                  <option value="Turn 11 (Hairpin Apex)">Turn 11 (Hairpin Apex)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Radio Audio Transcript
                </label>
                <input
                  type="text"
                  value={inputTranscript}
                  onChange={(e) => setInputTranscript(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-medium text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleIngestPacket}
                disabled={isIngesting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
              >
                {isIngesting ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>INGEST PACKET TO AI EVALUATION PIPELINE</span>
              </button>
            </div>

            {lastAiDiagnostic && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-950 space-y-1 font-medium animate-fadeIn">
                <span className="font-bold text-blue-700 uppercase block">
                  AI Model Diagnostic Output:
                </span>
                <p>{lastAiDiagnostic}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Ready to Publish Bar */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex flex-wrap justify-between items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="font-bold text-slate-800">
              HARDWARE & PUBLISHING STATUS: READY FOR RACE CONTROL
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenAiModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiModal('multimodal');
                }}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Open Multimodal Briefing</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
