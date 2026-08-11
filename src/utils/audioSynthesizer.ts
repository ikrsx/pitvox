/**
 * PitVox Radio Comms Synthesizer
 * Uses Web Audio API for radio static/beeps and SpeechSynthesis for radio voice playback
 */

class PitVoxAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying: boolean = false;
  private intervalId: number | null = null;

  private initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Play pit-radio chirp / bleep tone
   */
  public playRadioChirp(type: 'open' | 'close' = 'open') {
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'open' ? 1200 : 800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'open' ? 1800 : 400, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch {
      // Ignore audio context errors gracefully
    }
  }

  /**
   * Play radio message with progress tracking
   */
  public speakRadioMessage(
    text: string,
    durationSeconds: number,
    onProgress: (currentTime: number) => void,
    onEnded: () => void
  ) {
    this.stop();
    this.playRadioChirp('open');

    let startTime = Date.now();
    this.isPlaying = true;

    // Simulate progress timer
    this.intervalId = window.setInterval(() => {
      if (!this.isPlaying) return;
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= durationSeconds) {
        this.stop();
        onProgress(durationSeconds);
        onEnded();
      } else {
        onProgress(elapsed);
      }
    }, 100);

    // If SpeechSynthesis is available, speak the transcript
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Clean up quote marks for clear speech
      const cleanText = text.replace(/^"|"$/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      // Pitch/rate tuned for radio comms
      utterance.pitch = 0.95;
      utterance.rate = 1.05;

      utterance.onend = () => {
        // Speech finished
      };

      utterance.onerror = () => {
        // Fallback silently handles timer
      };

      this.currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.playRadioChirp('close');
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const radioAudioEngine = new PitVoxAudioEngine();
