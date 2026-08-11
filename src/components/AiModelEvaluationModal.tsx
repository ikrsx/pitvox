import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Activity,
  Mic,
  TrendingUp,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  Volume2,
  RefreshCw,
  FileText,
  Zap,
  BarChart2,
  ShieldAlert,
} from 'lucide-react';
import {
  AudioEvaluationResult,
  VitalsEvaluationResult,
  GraphEvaluationResult,
  MultiModalAIReport,
  ZoneData,
  LapData,
  DriverInfo,
  HuggingFaceModelSpec,
} from '../types';

interface AiModelEvaluationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab?: 'audio' | 'vitals' | 'graph' | 'multimodal';
  currentZone?: ZoneData;
  selectedLap?: LapData;
  driver?: DriverInfo;
  allLaps?: LapData[];
}

export const AiModelEvaluationModal: React.FC<AiModelEvaluationModalProps> = ({
  isOpen,
  onClose,
  activeTab = 'audio',
  currentZone,
  selectedLap,
  driver,
  allLaps = [],
}) => {
  const [currentTab, setCurrentTab] = useState<'audio' | 'vitals' | 'graph' | 'multimodal'>(activeTab);

  useEffect(() => {
    setCurrentTab(activeTab);
  }, [activeTab]);

  // Model selection states
  const [hfAsrModel, setHfAsrModel] = useState<string>('openai/whisper-small');
  const [hfEmotionModel, setHfEmotionModel] = useState<string>(
    'r-f/wav2vec-english-speech-emotion-recognition'
  );

  // Audio Evaluation States
  const [audioTranscript, setAudioTranscript] = useState<string>(
    currentZone?.transcript || 'Rear tyres are completely gone, getting snaps on corner entry!'
  );
  const [audioResult, setAudioResult] = useState<AudioEvaluationResult | null>(null);
  const [isEvaluatingAudio, setIsEvaluatingAudio] = useState(false);

  // Vitals Evaluation States
  const [vitalsResult, setVitalsResult] = useState<VitalsEvaluationResult | null>(null);
  const [isEvaluatingVitals, setIsEvaluatingVitals] = useState(false);
  const [customHr, setCustomHr] = useState<number>(currentZone?.hrBpm || 172);
  const [customHrv, setCustomHrv] = useState<number>(18);
  const [customGsr, setCustomGsr] = useState<number>(8.2);

  // Graph Evaluation States
  const [graphResult, setGraphResult] = useState<GraphEvaluationResult | null>(null);
  const [isEvaluatingGraph, setIsEvaluatingGraph] = useState(false);

  // Multimodal Synthesis States
  const [multimodalReport, setMultimodalReport] = useState<MultiModalAIReport | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Models status from backend
  const [modelsRegistry, setModelsRegistry] = useState<{
    huggingFaceModels: HuggingFaceModelSpec[];
    geminiModel: { id: string; name: string; provider: string; status: string };
  } | null>(null);

  // Fetch model registry on mount
  useEffect(() => {
    fetch('/api/ai/models-status')
      .then((res) => res.json())
      .then((data) => setModelsRegistry(data))
      .catch((err) => console.error('Failed to load models registry:', err));
  }, []);

  if (!isOpen) return null;

  // Run Audio Evaluation via Hugging Face + Gemini API
  const handleEvaluateAudio = async () => {
    setIsEvaluatingAudio(true);
    try {
      const response = await fetch('/api/ai/eval-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: audioTranscript,
          selectedAsrModel: hfAsrModel,
          selectedEmotionModel: hfEmotionModel,
          zoneContext: currentZone,
        }),
      });
      const data = await response.json();
      setAudioResult(data);
    } catch (err) {
      console.error('Audio evaluation failed:', err);
    } finally {
      setIsEvaluatingAudio(false);
    }
  };

  // Run Vitals Evaluation via AI API
  const handleEvaluateVitals = async () => {
    setIsEvaluatingVitals(true);
    try {
      const response = await fetch('/api/ai/eval-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heartRate: customHr,
          hrvRmssd: customHrv,
          respirationRate: currentZone?.brRate || 32,
          gsrMicrosiemens: customGsr,
          coreTempC: 38.5,
          baselineStress: driver?.baselineStress || 120,
        }),
      });
      const data = await response.json();
      setVitalsResult(data);
    } catch (err) {
      console.error('Vitals evaluation failed:', err);
    } finally {
      setIsEvaluatingVitals(false);
    }
  };

  // Run Graph & Trend Evaluation
  const handleEvaluateGraph = async () => {
    setIsEvaluatingGraph(true);
    try {
      const response = await fetch('/api/ai/eval-graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lapData: allLaps,
          currentLap: selectedLap?.lapNumber || 8,
        }),
      });
      const data = await response.json();
      setGraphResult(data);
    } catch (err) {
      console.error('Graph evaluation failed:', err);
    } finally {
      setIsEvaluatingGraph(false);
    }
  };

  // Run MultiModal AI Synthesis
  const handleSynthesizeMultimodal = async () => {
    setIsSynthesizing(true);
    try {
      const response = await fetch('/api/ai/eval-multimodal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          driver,
          currentZone,
          selectedLap,
          transcript: audioTranscript,
        }),
      });
      const data = await response.json();
      setMultimodalReport(data);
    } catch (err) {
      console.error('Multimodal evaluation failed:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-slate-800 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  MULTIMODAL AI EVALUATION ENGINE
                </h2>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 uppercase font-mono">
                  Hugging Face + Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Analyze Driver Radio Audio, Biometric Telemetry Vitals & Graph Trends
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 gap-2 pt-2">
          <button
            onClick={() => setCurrentTab('audio')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              currentTab === 'audio'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Audio & Voice ASR</span>
          </button>

          <button
            onClick={() => setCurrentTab('vitals')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              currentTab === 'vitals'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Vitals Telemetry</span>
          </button>

          <button
            onClick={() => setCurrentTab('graph')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              currentTab === 'graph'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Graph & Trend Analysis</span>
          </button>

          <button
            onClick={() => setCurrentTab('multimodal')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              currentTab === 'multimodal'
                ? 'border-purple-600 text-purple-600 bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>MultiModal AI Briefing</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: AUDIO EVALUATION */}
          {currentTab === 'audio' && (
            <div className="space-y-6">
              {/* Model Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
                    Hugging Face Speech-to-Text Model (ASR)
                  </label>
                  <select
                    value={hfAsrModel}
                    onChange={(e) => setHfAsrModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="openai/whisper-small">Rank 1: openai/whisper-small (Default)</option>
                    <option value="openai/whisper-base">Rank 2: openai/whisper-base (Fast Fallback)</option>
                    <option value="openai/whisper-large-v3">Rank 3: openai/whisper-large-v3 (High Precision)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-1.5">
                    Hugging Face Stress/Emotion Classifier
                  </label>
                  <select
                    value={hfEmotionModel}
                    onChange={(e) => setHfEmotionModel(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
                  >
                    <option value="r-f/wav2vec-english-speech-emotion-recognition">
                      Rank 1: r-f/wav2vec-english-speech-emotion-recognition
                    </option>
                    <option value="Dpngtm/wav2vec2-emotion-recognition">
                      Rank 2: Dpngtm/wav2vec2-emotion-recognition
                    </option>
                    <option value="superb/wav2vec2-base-superb-er">
                      Rank 3: superb/wav2vec2-base-superb-er
                    </option>
                    <option value="speechbrain/emotion-recognition-wav2vec2-IEMOCAP">
                      Rank 4: speechbrain/emotion-recognition-wav2vec2-IEMOCAP
                    </option>
                  </select>
                </div>
              </div>

              {/* Input Transcript & Action */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
                  <span>Radio Audio Transcript Input</span>
                  <span className="text-slate-400 font-normal">Edit or test preset messages</span>
                </label>
                <textarea
                  value={audioTranscript}
                  onChange={(e) => setAudioTranscript(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-sans shadow-2xs"
                  placeholder="Enter driver radio audio transcript..."
                ></textarea>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setAudioTranscript("Rear tyres are completely gone, getting snaps on entry!")}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium transition-colors"
                  >
                    "Rear tyres gone!"
                  </button>
                  <button
                    onClick={() => setAudioTranscript("What is Hamilton doing? He pushed me off the track!")}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium transition-colors"
                  >
                    "He pushed me off!"
                  </button>
                  <button
                    onClick={() => setAudioTranscript("Car feels stable now, balance is neutral in Sector 3.")}
                    className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 font-medium transition-colors"
                  >
                    "Car feels stable"
                  </button>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleEvaluateAudio}
                    disabled={isEvaluatingAudio || !audioTranscript.trim()}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
                  >
                    {isEvaluatingAudio ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <Zap className="w-4 h-4" />
                    )}
                    <span>EVALUATE AUDIO WITH HUGGING FACE & GEMINI</span>
                  </button>
                </div>
              </div>

              {/* Audio Evaluation Output Results */}
              {audioResult && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-900">
                        ACOUSTIC & EMOTION INFERENCE COMPLETE
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                      Confidence: {(audioResult.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  {/* Emotion Probabilities */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Wav2Vec2 Emotion Distribution Output
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Stress</span>
                        <span className="text-lg font-bold text-rose-600">{audioResult.emotionDistribution.stress}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Panic</span>
                        <span className="text-lg font-bold text-amber-600">{audioResult.emotionDistribution.panic}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Frustration</span>
                        <span className="text-lg font-bold text-purple-600">{audioResult.emotionDistribution.frustration}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Urgency</span>
                        <span className="text-lg font-bold text-blue-600">{audioResult.emotionDistribution.urgency}%</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-center">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Calm</span>
                        <span className="text-lg font-bold text-emerald-600">{audioResult.emotionDistribution.calm}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Acoustic Features */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 font-mono text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Pitch Variance</span>
                      <span className="font-bold text-slate-800">{audioResult.acousticMetrics.pitchVarianceHz} Hz</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Vocal Tension</span>
                      <span className="font-bold text-rose-600">{audioResult.acousticMetrics.vocalTensionIndex} / 10</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">Speech Cadence</span>
                      <span className="font-bold text-slate-800">{audioResult.acousticMetrics.speechCadenceWpm} WPM</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">SNR Level</span>
                      <span className="font-bold text-emerald-600">{audioResult.acousticMetrics.snrDb} dB</span>
                    </div>
                  </div>

                  {/* Gemini Diagnostic Synthesis */}
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Gemini 3.6 Race Engineer AI Interpretation</span>
                    </div>
                    <p className="text-xs text-blue-950 leading-relaxed font-medium">
                      {audioResult.aiInsight}
                    </p>
                    <div className="pt-2 border-t border-blue-200/60 text-xs text-blue-900 font-semibold">
                      <span className="text-blue-700 font-bold">Pit Wall Action: </span>
                      {audioResult.recommendedAction}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VITALS TELEMETRY EVALUATION */}
          {currentTab === 'vitals' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="200"
                    value={customHr}
                    onChange={(e) => setCustomHr(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="font-mono text-sm font-bold text-slate-900 block text-right">
                    {customHr} BPM
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
                    HRV RMSSD (ms)
                  </label>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    value={customHrv}
                    onChange={(e) => setCustomHrv(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="font-mono text-sm font-bold text-slate-900 block text-right">
                    {customHrv} ms
                  </span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <label className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
                    GSR Microsiemens (µS)
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="15.0"
                    step="0.5"
                    value={customGsr}
                    onChange={(e) => setCustomGsr(Number(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <span className="font-mono text-sm font-bold text-slate-900 block text-right">
                    {customGsr} µS
                  </span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEvaluateVitals}
                  disabled={isEvaluatingVitals}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
                >
                  {isEvaluatingVitals ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <Activity className="w-4 h-4" />
                  )}
                  <span>RUN BIOMETRIC VITALS AI EVALUATION</span>
                </button>
              </div>

              {vitalsResult && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                      <span className="text-sm font-bold text-slate-900">
                        PHYSIOLOGICAL AUTONOMIC STATUS: {vitalsResult.physiologicalStatus}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                      Stress Index: {vitalsResult.autonomicStressIndex} / 100
                    </span>
                  </div>

                  {/* Anomalies List */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                      Detected Physiological Anomalies
                    </label>
                    <div className="space-y-1.5">
                      {vitalsResult.detectedAnomalies.map((a, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-2 rounded-lg text-xs font-medium"
                        >
                          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gemini Diagnostic */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Gemini 3.6 Human Performance Diagnostic</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {vitalsResult.geminiDiagnostic}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GRAPH & TREND EVALUATION */}
          {currentTab === 'graph' && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">
                    Lap Telemetry Dataset Evaluated
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-600">
                    Laps 1–{allLaps.length || 12}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Cross-evaluates driver stress curve spikes against sector delta times to identify lap time loss causes.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleEvaluateGraph}
                  disabled={isEvaluatingGraph}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
                >
                  {isEvaluatingGraph ? (
                    <Sparkles className="w-4 h-4 animate-spin" />
                  ) : (
                    <TrendingUp className="w-4 h-4" />
                  )}
                  <span>EVALUATE GRAPH & DELTA TIME TRENDS</span>
                </button>
              </div>

              {graphResult && (
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                    <span className="text-sm font-bold text-slate-900">
                      TELEMETRY CORRELATION ENGINE OUTPUT
                    </span>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                      Correlation: +{graphResult.stressVsDeltaCorrelation}
                    </span>
                  </div>

                  {/* Sector Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {graphResult.sectorBreakdown.map((sec, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                          {sec.sector}
                        </span>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-slate-700">
                            Avg Stress: <strong className="text-rose-600">{sec.avgStress}</strong>
                          </span>
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {sec.timeDelta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase block">
                      Trend Insight & Predictive Loss
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {graphResult.trendAnalysis}
                    </p>
                    <p className="text-xs text-rose-600 font-bold font-mono">
                      Predictive Impact: {graphResult.predictiveLapLoss}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MULTIMODAL AI BRIEFING */}
          {currentTab === 'multimodal' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-2xl border border-purple-200 space-y-3">
                <div className="flex items-center gap-2 text-purple-900 font-bold text-sm">
                  <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                  <span>HOLISTIC MULTIMODAL RACE AI SYNTHESIS</span>
                </div>
                <p className="text-xs text-purple-950 font-medium leading-relaxed">
                  Combines driver voice radio emotion (Hugging Face ASR & Speech Classifier) with live biometric telemetry vitals and lap delta graphs into a unified Race Control intelligence briefing.
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleSynthesizeMultimodal}
                    disabled={isSynthesizing}
                    className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold tracking-wide transition-all flex items-center gap-2 shadow-sm shadow-purple-500/20 disabled:opacity-50"
                  >
                    {isSynthesizing ? (
                      <Sparkles className="w-4 h-4 animate-spin" />
                    ) : (
                      <Layers className="w-4 h-4" />
                    )}
                    <span>GENERATE MULTIMODAL AI RACE BRIEFING</span>
                  </button>
                </div>
              </div>

              {multimodalReport && (
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5 animate-fadeIn">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        COMPOSITE DRIVER STATE
                      </span>
                      <span className="text-base font-bold text-slate-900">
                        {multimodalReport.overallDriverState}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        STRESS SCORE
                      </span>
                      <span className="text-2xl font-black text-rose-600">
                        {multimodalReport.compositeStressScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-800 uppercase block mb-1">
                        Pit Wall Strategy Recommendation
                      </span>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {multimodalReport.pitWallRecommendation}
                      </p>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                      <span className="text-xs font-bold text-blue-900 uppercase block mb-1 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4 text-blue-600" />
                        Recommended Radio Coaching Script
                      </span>
                      <p className="text-xs font-mono font-bold text-blue-950">
                        "{multimodalReport.radioCoachingScript}"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-[11px] text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hugging Face Models Ready (`openai/whisper-small`, `r-f/wav2vec-english-speech-emotion-recognition`)</span>
          </div>
          <span>Gemini 3.6 Flash Active</span>
        </div>
      </div>
    </div>
  );
};
