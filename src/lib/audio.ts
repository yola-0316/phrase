export class AudioManager {
  private static instance: AudioManager;
  private audio: HTMLAudioElement;
  private audioContext: AudioContext | null = null;
  private currentBufferSource: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private startTime: number = 0;
  private pauseTime: number = 0;
  private currentSrc: string | null = null;
  private _isPlaying: boolean = false;
  private _onStateChange?: (state: {
    isPlaying: boolean;
    currentSrc: string | null;
  }) => void;

  private constructor() {
    this.audio = new Audio();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.audio.addEventListener("ended", () => {
      this._isPlaying = false;
      this.updateState();
    });

    this.audio.addEventListener("pause", () => {
      this._isPlaying = false;
      this.updateState();
    });

    this.audio.addEventListener("play", () => {
      this._isPlaying = true;
      this.updateState();
    });
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    }
  }

  private async playBuffer(
    buffer: AudioBuffer,
    offset: number = 0,
  ): Promise<void> {
    if (!this.audioContext || !this.gainNode)
      throw new Error("Failed to initialize AudioContext");

    // Stop any current playback
    if (this.currentBufferSource) {
      this.currentBufferSource.stop();
      this.currentBufferSource.disconnect();
    }
    this.audio.pause();

    // Create and setup new source
    this.currentBufferSource = this.audioContext.createBufferSource();
    this.currentBufferSource.buffer = buffer;
    this.currentBufferSource.connect(this.gainNode);

    this.currentBufferSource.addEventListener("ended", () => {
      this._isPlaying = false;
      this.updateState();
    });

    this._isPlaying = true;
    this.currentSrc = null;
    this.startTime = this.audioContext.currentTime - offset;
    this.updateState();

    this.currentBufferSource.start(0, offset);
  }

  async play(src: string | AudioBuffer | ArrayBuffer): Promise<void> {
    if (src instanceof ArrayBuffer) {
      this.initAudioContext();
      const arrayBuffer = src;
      const audioBuffer = await this.audioContext?.decodeAudioData(arrayBuffer);
      if (audioBuffer) {
        await this.playBuffer(audioBuffer);
      }
    } else if (src instanceof AudioBuffer) {
      this.initAudioContext();
      await this.playBuffer(src, this.pauseTime);
    } else {
      if (this.currentSrc !== src) {
        // If we're changing sources, pause current playback
        this.audio.pause();
        this.audio.src = src;
        this.currentSrc = src;
      }

      try {
        await this.audio.play();
      } catch (error) {
        console.error("Failed to play audio:", error);
        throw error;
      }
    }
  }

  pause(): void {
    if (this.currentBufferSource && this.audioContext) {
      this.pauseTime = this.audioContext.currentTime - this.startTime;
      this.currentBufferSource.stop();
      this.currentBufferSource.disconnect();
      this.currentBufferSource = null;
    }
    this.audio.pause();
    this._isPlaying = false;
    this.updateState();
  }

  stop(): void {
    if (this.currentBufferSource) {
      this.currentBufferSource.stop();
      this.currentBufferSource.disconnect();
      this.currentBufferSource = null;
    }
    this.audio.pause();
    this.audio.currentTime = 0;
    this.currentSrc = null;
    this.pauseTime = 0;
    this._isPlaying = false;
    this.updateState();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  get isPlaying(): boolean {
    return this._isPlaying;
  }

  get currentSource(): string | null {
    return this.currentSrc;
  }

  onStateChange(
    callback: (state: {
      isPlaying: boolean;
      currentSrc: string | null;
    }) => void,
  ): () => void {
    this._onStateChange = callback;
    return () => {
      this._onStateChange = undefined;
    };
  }

  private updateState(): void {
    if (this._onStateChange) {
      this._onStateChange({
        isPlaying: this._isPlaying,
        currentSrc: this.currentSrc,
      });
    }
  }

  setVolume(volume: number): void {
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = normalizedVolume;
    } else {
      this.audio.volume = normalizedVolume;
    }
  }

  getCurrentTime(): number {
    if (this.currentBufferSource && this.audioContext) {
      return this.audioContext.currentTime - this.startTime;
    } else {
      return this.audio.currentTime;
    }
  }

  getDuration(): number {
    if (this.currentBufferSource) {
      return this.currentBufferSource.buffer?.duration || 0;
    } else {
      return this.audio.duration;
    }
  }

  seek(time: number): void {
    if (this.currentBufferSource && this.audioContext) {
      const buffer = this.currentBufferSource.buffer;
      const normalizedTime = Math.max(0, Math.min(time, buffer?.duration || 0));
      this.pauseTime = normalizedTime;
      if (this._isPlaying && buffer) {
        this.playBuffer(buffer, normalizedTime);
      }
    } else {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
  }
}
