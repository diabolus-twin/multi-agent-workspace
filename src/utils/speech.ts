import { AgentPersonaId } from '../types';
import { AGENT_PERSONAS } from '../data/defaultDatasets';

class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices();
    }
    return this.voices;
  }

  public speak(
    text: string, 
    speakerId: AgentPersonaId, 
    onStart?: () => void, 
    onEnd?: () => void
  ) {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stop();

    const config = AGENT_PERSONAS[speakerId];
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice pitch and rate
    utterance.pitch = config?.voicePitch || 1.0;
    utterance.rate = config?.voiceRate || 1.0;

    // Pick appropriate system voice if available
    const availableVoices = this.getVoices();
    if (availableVoices.length > 0) {
      if (speakerId === 'technical') {
        // Female / calm / academic
        const voice = availableVoices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Zira') || v.name.includes('Female')) || availableVoices[0];
        if (voice) utterance.voice = voice;
      } else if (speakerId === 'hr') {
        // Warm / empathetic
        const voice = availableVoices.find(v => v.name.includes('Daniel') || v.name.includes('Oliver') || v.name.includes('Guy') || v.name.includes('David')) || availableVoices[1] || availableVoices[0];
        if (voice) utterance.voice = voice;
      } else if (speakerId === 'hiring_manager') {
        // Authoritative / articulate female or crisp male
        const voice = availableVoices.find(v => v.name.includes('Victoria') || v.name.includes('Moira') || v.name.includes('Hazel') || v.name.includes('Siri')) || availableVoices[2] || availableVoices[0];
        if (voice) utterance.voice = voice;
      } else if (speakerId === 'skeptic') {
        // Deeper / intense / skeptical
        const voice = availableVoices.find(v => v.name.includes('George') || v.name.includes('Fred') || v.name.includes('Alex') || v.name.includes('Male')) || availableVoices[3] || availableVoices[0];
        if (voice) utterance.voice = voice;
      }
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public isCurrentlySpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechManager = new SpeechManager();
