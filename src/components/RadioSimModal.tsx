import React, { useState } from 'react';
import { X, Mic, Send, Radio, Sparkles, Cpu } from 'lucide-react';
import { ZoneData } from '../types';
import { radioAudioEngine } from '../utils/audioSynthesizer';

interface RadioSimModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZone: ZoneData;
  onInjectComms: (zoneId: string, transcript: string, newStressScore: number, keywords: string[]) => void;
  onOpenAiModal?: (tab: 'audio') => void;
}

export const RadioSimModal: React.FC<RadioSimModalProps> = ({
  isOpen,
  onClose,
  selectedZone,
  onInjectComms,
  onOpenAiModal,
}) => {
  const [transcriptInput, setTranscriptInput] = useState(
    'Losing the rear on corner entry, need +2 front wing adjustment on next stop.'
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!isOpen) return null;

  const presetMessages = [
    'Rear is sliding, I need more grip. Same spot every lap.',
    'Understeer through Kemmel transition, front wing setting is too low.',
    'Brake pedal feels long into turn 7, check fluid line.',
    'A lot of bottoming out through Eau Rouge compressions.',
    'Front-left tire temperatures nominal, balance feels balanced.',
  ];

  const handleSimulateAnalysis = async () => {
    setIsAnalyzing(true);
    radioAudioEngine.playRadioChirp('open');

    // Simple rule-based sentiment & keyword extractor
    setTimeout(() => {
      const lower = transcriptInput.toLowerCase();
      let stressScore = 45;
      const extractedKeywords: string[] = [];

      if (lower.includes('sliding') || lower.includes('loose') || lower.includes('rear')) {
        stressScore += 25;
        extractedKeywords.push('REAR', 'SLIDING');
      }
      if (lower.includes('understeer') || lower.includes('front wing') || lower.includes('grip')) {
        stressScore += 20;
        extractedKeywords.push('UNDERSTEER', 'FRONT WING');
      }
      if (lower.includes('brake') || lower.includes('pedal') || lower.includes('fluid')) {
        stressScore += 15;
        extractedKeywords.push('BRAKES');
      }
      if (lower.includes('bottoming') || lower.includes('heavy')) {
        stressScore += 15;
        extractedKeywords.push('BOTTOMING');
      }
      if (lower.includes('good') || lower.includes('nominal') || lower.includes('balanced')) {
        stressScore = Math.max(25, stressScore - 20);
        extractedKeywords.push('NOMINAL');
      }

      const finalScore = Math.min(95, Math.max(20, stressScore));

      onInjectComms(
        selectedZone.id,
        transcriptInput,
        finalScore,
        extractedKeywords.length > 0 ? extractedKeywords : ['RADIO COMM']
      );

      // Playback audio preview
      radioAudioEngine.speakRadioMessage(
        transcriptInput,
        5,
        () => {},
        () => {}
      );

      setIsAnalyzing(false);
      onClose();
    }, 600);
  };

  const handleToggleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser window. Please type your message.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      setIsRecording(true);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setTranscriptInput(text);
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative text-slate-800">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              RADIO INTELLIGENCE SIMULATOR
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Zone Context */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-4 flex items-center justify-between text-xs font-data-mono">
          <div>
            <span className="text-slate-400">Target Zone:</span>{' '}
            <span className="text-slate-900 font-bold">{selectedZone.id} ({selectedZone.cornerName})</span>
          </div>
          <div>
            <span className="text-slate-400">Current Stress:</span>{' '}
            <span className="text-rose-600 font-bold">{selectedZone.stressScore} / 100</span>
          </div>
        </div>

        {/* Preset Radio Messages */}
        <div className="mb-4">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 block">
            PRESET DRIVER RADIO MESSAGES
          </label>
          <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto scrollbar-hide">
            {presetMessages.map((msg, i) => (
              <button
                key={i}
                onClick={() => setTranscriptInput(msg)}
                className="text-left px-3 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 transition-colors truncate font-sans font-medium"
              >
                "{msg}"
              </button>
            ))}
          </div>
        </div>

        {/* Custom Input */}
        <div className="mb-6">
          <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-2 flex justify-between items-center">
            <span>DRIVER TRANSCRIPT INPUT</span>
            {isRecording && <span className="text-rose-600 animate-pulse font-mono">● Recording Voice...</span>}
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={transcriptInput}
              onChange={(e) => setTranscriptInput(e.target.value)}
              placeholder="Type driver radio message or speak..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 font-sans shadow-2xs"
            ></textarea>

            <button
              onClick={handleToggleMic}
              className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
                isRecording
                  ? 'bg-rose-600 text-white animate-bounce'
                  : 'bg-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Speak via Microphone"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
          <div>
            {onOpenAiModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAiModal('audio');
                }}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                title="Evaluate audio with Hugging Face models"
              >
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
                <span>Hugging Face Audio AI</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSimulateAnalysis}
              disabled={isAnalyzing || !transcriptInput.trim()}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center gap-2 shadow-sm shadow-blue-500/20 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>Inject & Analyze Voice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
