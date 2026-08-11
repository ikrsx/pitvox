export type StressLevel = 'CALM' | 'ELEVATED' | 'CRITICAL';

export interface ZoneData {
  id: string;
  zoneNumber: number;
  cornerName: string;
  timeRange: string;
  stressScore: number;
  status: StressLevel;
  hrBpm: number;
  brRate: number;
  gForce: number;
  keywords: string[];
  requirementNote?: string;
  transcript: string;
  audioDuration: number; // in seconds
}

export interface LapData {
  lapNumber: number;
  lapTime: string;
  lapDelta: string;
  isDeltaPositive: boolean; // green vs red
  overallStress: number;
  priorityZone: string;
  priorityCorner: string;
  vitalsStatus: 'ACTIVE' | 'PARTIAL' | 'OFFLINE';
  zones: ZoneData[];
}

export interface SystemNotice {
  id: string;
  type: 'priority' | 'watch' | 'stable';
  title: string;
  message: string;
}

export interface DriverInfo {
  carNumber: string;
  driverName: string;
  baselineStress: number;
  trackName: string;
}

export interface HuggingFaceModelSpec {
  id: string;
  name: string;
  type: 'speech-to-text' | 'speech-emotion' | 'telemetry-anomaly';
  rank: number;
  bestFor: string;
  provider: 'Hugging Face';
  endpoint: string;
}

export interface AudioEvaluationResult {
  modelUsed: string;
  hfEmotionModel: string;
  transcript: string;
  confidenceScore: number;
  emotionDistribution: {
    stress: number;
    panic: number;
    calm: number;
    frustration: number;
    urgency: number;
  };
  acousticMetrics: {
    pitchVarianceHz: number;
    vocalTensionIndex: number;
    speechCadenceWpm: number;
    snrDb: number;
  };
  aiInsight: string;
  recommendedAction: string;
  timestamp: string;
}

export interface VitalsEvaluationResult {
  heartRate: number;
  hrvRmssd: number;
  respirationRate: number;
  gsrMicrosiemens: number;
  coreTempC: number;
  autonomicStressIndex: number;
  physiologicalStatus: 'NOMINAL' | 'ELEVATED STRAIN' | 'CRITICAL OVERLOAD';
  detectedAnomalies: string[];
  geminiDiagnostic: string;
  hydrationAlert: boolean;
  fatigueIndex: number;
  timestamp: string;
}

export interface GraphEvaluationResult {
  lapRange: string;
  stressVsDeltaCorrelation: number; // e.g. +0.82
  peakStressCorner: string;
  paceDegradationSecPerLap: number;
  sectorBreakdown: {
    sector: string;
    avgStress: number;
    timeDelta: string;
  }[];
  trendAnalysis: string;
  predictiveLapLoss: string;
  timestamp: string;
}

export interface MultiModalAIReport {
  overallDriverState: 'FOCUSED & CALM' | 'MODERATE HYPERAROUSAL' | 'CRITICAL COGNITIVE OVERLOAD';
  compositeStressScore: number; // 0-100
  audioEvaluation: AudioEvaluationResult;
  vitalsEvaluation: VitalsEvaluationResult;
  graphEvaluation: GraphEvaluationResult;
  pitWallRecommendation: string;
  radioCoachingScript: string;
  timestamp: string;
}

export type ConnectionType = 'WIRE_SERIAL' | 'BLUETOOTH' | 'RADIO_SIM' | 'WEBSOCKET_API';
export type DeviceCategory = 'VITAL_SENSORS' | 'MICROPHONE_RADIO' | 'LOCATION_GPS_TRACK';

export interface SensorDevice {
  id: string;
  name: string;
  category: DeviceCategory;
  connectionType: ConnectionType;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'STREAMING_LIVE';
  signalQualityPercent: number;
  batteryPercent?: number;
  lastReadingTimestamp?: string;
  portOrAddress?: string;
}

export interface IngestedTelemetryPayload {
  sourceDeviceId?: string;
  heartRate?: number;
  hrvRmssd?: number;
  respirationRate?: number;
  gsrMicrosiemens?: number;
  cornerName?: string;
  zoneId?: string;
  transcript?: string;
  gForce?: number;
  timestamp: string;
}

