import React, { useState, useEffect } from 'react';
import { 
  MessageSquareCode, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Quote, 
  ExternalLink,
  Bot,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AgentPersonaId, 
  DebateRound, 
  DebateMessage, 
  DebateMessageType,
  CandidateDossier
} from '../types';
import { AGENT_PERSONAS } from '../data/defaultDatasets';
import { speechManager } from '../utils/speech';

interface DebateStudioViewProps {
  debateRounds?: DebateRound[];
  candidate: CandidateDossier;
  onGenerateDebateRound: (roundNumber: number) => void;
  onInspectQuote: (quote: string, source: 'resume' | 'transcript') => void;
  isLoading: boolean;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
}

export const DebateStudioView: React.FC<DebateStudioViewProps> = ({
  debateRounds = [],
  candidate,
  onGenerateDebateRound,
  onInspectQuote,
  isLoading,
  isAudioEnabled,
  onToggleAudio
}) => {
  const [activeRoundIdx, setActiveRoundIdx] = useState<number>(0);
  const [activeMessageIdx, setActiveMessageIdx] = useState<number>(-1);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const currentRound = debateRounds[activeRoundIdx];
  const messages = currentRound?.messages || [];

  // Stop speech when unmounting or switching candidate
  useEffect(() => {
    return () => {
      speechManager.stop();
    };
  }, [candidate.id]);

  // Audio playback loop for turn-by-turn debate
  const playMessageAudio = (msgIdx: number) => {
    if (!messages || msgIdx >= messages.length || msgIdx < 0) {
      setIsPlayingAudio(false);
      return;
    }

    const msg = messages[msgIdx];
    setActiveMessageIdx(msgIdx);

    if (!isAudioEnabled) {
      // If muted, advance with a timer
      const timeout = setTimeout(() => {
        if (msgIdx + 1 < messages.length) {
          playMessageAudio(msgIdx + 1);
        } else {
          setIsPlayingAudio(false);
        }
      }, 4000);
      return () => clearTimeout(timeout);
    }

    setIsPlayingAudio(true);
    // Speak using Web Speech API
    speechManager.speak(
      `${msg.speakerName}: ${msg.content}`,
      msg.speakerId,
      () => {},
      () => {
        if (msgIdx + 1 < messages.length) {
          setTimeout(() => playMessageAudio(msgIdx + 1), 600);
        } else {
          setIsPlayingAudio(false);
        }
      }
    );
  };

  const handleStartPlayback = () => {
    const startIndex = activeMessageIdx >= 0 && activeMessageIdx < messages.length - 1 ? activeMessageIdx + 1 : 0;
    playMessageAudio(startIndex);
  };

  const handlePausePlayback = () => {
    speechManager.stop();
    setIsPlayingAudio(false);
  };

  const handleResetPlayback = () => {
    speechManager.stop();
    setIsPlayingAudio(false);
    setActiveMessageIdx(-1);
  };

  const getMessageTypeBadge = (type: DebateMessageType) => {
    switch (type) {
      case 'CHALLENGE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">CHALLENGE</span>;
      case 'DEFENSE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">DEFENSE</span>;
      case 'POSITION_SHIFT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600 text-white shadow-xs animate-pulse">POSITION SHIFT</span>;
      case 'CONCESSION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">CONCESSION</span>;
      case 'CROSS_EXAMINATION':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">CROSS-EXAM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">SYNTHESIS</span>;
    }
  };

  return (
    <div className="space-y-6" id="debate-studio-view">
      
      {/* Studio Header & Controls Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>Multi-Agent Live Arena</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Cross-Persona Deliberation & Debate Studio
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Agents directly challenge contradictions, interrogate metric claims, cross-examine evidence, and dynamically shift their stances based on peer arguments.
            </p>
          </div>

          {/* Studio Audio & Playback Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              id="debate-audio-toggle-btn"
              onClick={onToggleAudio}
              className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center space-x-2 transition ${
                isAudioEnabled
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-xs'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{isAudioEnabled ? 'Voice TTS Active' : 'Muted'}</span>
            </button>

            {/* Play/Pause Button */}
            {isPlayingAudio ? (
              <button
                id="pause-debate-btn"
                onClick={handlePausePlayback}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Debate</span>
              </button>
            ) : (
              <button
                id="play-debate-btn"
                onClick={handleStartPlayback}
                disabled={messages.length === 0}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                <span>Play Live Turn-by-Turn</span>
              </button>
            )}

            {/* Reset */}
            <button
              id="reset-debate-playback-btn"
              onClick={handleResetPlayback}
              title="Reset Turn Index"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Trigger Next Round Button */}
            <button
              id="trigger-next-round-btn"
              onClick={() => onGenerateDebateRound(debateRounds.length + 1)}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{isLoading ? 'Agents Debating...' : `Trigger Round ${debateRounds.length + 1}`}</span>
            </button>
          </div>
        </div>

        {/* 4 Agent Live Arena Pods (Table Layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          {(['technical', 'hr', 'hiring_manager', 'skeptic'] as AgentPersonaId[]).map((personaId) => {
            const config = AGENT_PERSONAS[personaId];
            const isCurrentlySpeaking = isPlayingAudio && activeMessageIdx >= 0 && messages[activeMessageIdx]?.speakerId === personaId;

            return (
              <div
                key={personaId}
                className={`p-3 rounded-xl border transition-all duration-300 ${
                  isCurrentlySpeaking
                    ? 'bg-slate-800 border-indigo-400 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.avatarColor} text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs relative`}>
                    {config.name.split(' ')[0][0]}
                    {isCurrentlySpeaking && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-900 animate-ping" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-white truncate">{config.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{config.badge}</div>
                  </div>
                </div>
                {isCurrentlySpeaking && (
                  <div className="mt-2 text-[10px] font-bold text-indigo-400 flex items-center space-x-1 animate-pulse">
                    <Volume2 className="w-3 h-3" />
                    <span>Speaking in debate...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rounds Selector Tabs */}
      {debateRounds.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
            {debateRounds.map((round, idx) => (
              <button
                key={round.roundNumber}
                onClick={() => {
                  setActiveRoundIdx(idx);
                  setActiveMessageIdx(-1);
                  speechManager.stop();
                  setIsPlayingAudio(false);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  activeRoundIdx === idx
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <MessageSquareCode className="w-3.5 h-3.5" />
                <span>{round.roundTitle}</span>
              </button>
            ))}
          </div>

          {/* Active Round Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* Round Banner */}
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {currentRound.roundTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Focus Theme: <span className="font-semibold text-slate-800">{currentRound.focusTheme}</span>
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-200 text-slate-700 rounded-full">
                {messages.length} Dialogue Turns
              </span>
            </div>

            {/* Turn-by-Turn Dialogue Thread */}
            <div className="p-6 space-y-5 divide-y divide-slate-100">
              {messages.map((msg, idx) => {
                const config = AGENT_PERSONAS[msg.speakerId];
                const isActive = activeMessageIdx === idx;

                return (
                  <div
                    key={msg.id}
                    id={`debate-message-${msg.id}`}
                    className={`pt-5 first:pt-0 transition-all rounded-2xl p-4 ${
                      isActive
                        ? 'bg-indigo-50/70 border border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'hover:bg-slate-50/60'
                    }`}
                  >
                    {/* Speaker Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${config?.avatarColor || 'from-slate-700 to-slate-900'} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0`}>
                          {msg.speakerName.split(' ')[0][0]}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{msg.speakerName}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config?.bgLight || 'bg-slate-100'}`}>
                              {config?.badge || 'Agent'}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {msg.targetPersonaId === 'ALL' 
                              ? 'Addressing the whole panel' 
                              : `Directed to: ${AGENT_PERSONAS[msg.targetPersonaId || 'technical']?.name || msg.targetPersonaId}`}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {getMessageTypeBadge(msg.messageType)}
                        <button
                          onClick={() => {
                            setActiveMessageIdx(idx);
                            if (isAudioEnabled) {
                              speechManager.speak(`${msg.speakerName}: ${msg.content}`, msg.speakerId);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                          title="Listen to this line"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Cited Quote if any */}
                    {msg.citedQuote && (
                      <div className="mt-3 bg-amber-50/80 rounded-xl p-3 border border-amber-200 flex items-start justify-between gap-3 text-xs">
                        <div className="flex items-start space-x-2">
                          <Quote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-amber-900 text-[10px] uppercase">Cross-Examined Evidence:</span>
                            <p className="font-mono text-amber-950 italic mt-0.5">
                              "{msg.citedQuote}"
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => onInspectQuote(msg.citedQuote!, 'transcript')}
                          className="shrink-0 text-amber-800 hover:text-amber-950 font-bold flex items-center space-x-1"
                        >
                          <span>Trace</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* Dialogue Content */}
                    <div className="mt-3 text-sm text-slate-800 leading-relaxed pl-2 border-l-2 border-slate-300">
                      {msg.content}
                    </div>

                    {/* CRITICAL POSITION SHIFT CALLOUT (proves multi-agent dynamic updates) */}
                    {msg.didChangeMind && msg.positionShift && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-purple-900 to-indigo-950 text-white shadow-md border border-purple-700">
                        <div className="flex items-center space-x-2 text-xs font-bold text-purple-300 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Deliberation Breakthrough: Verified Position Shift</span>
                        </div>
                        
                        {/* Position Shift Delta */}
                        <div className="mt-2.5 flex items-center space-x-3 bg-black/30 p-2.5 rounded-lg border border-purple-500/30 text-xs">
                          <div className="text-rose-300 font-bold line-through">
                            {msg.positionShift.fromRecommendation.replace('_', ' ')} ({msg.positionShift.fromConfidence}% Conf)
                          </div>
                          <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                          <div className="text-emerald-300 font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                            {msg.positionShift.toRecommendation.replace('_', ' ')} ({msg.positionShift.toConfidence}% Conf)
                          </div>
                        </div>

                        {/* Trigger Rationale */}
                        <div className="mt-2 text-xs text-purple-200">
                          <span className="font-bold text-white">Convinced by:</span> {AGENT_PERSONAS[msg.positionShift.triggerPersonaId]?.name || msg.positionShift.triggerPersonaId}
                        </div>
                        <div className="mt-1 text-xs text-slate-300 italic">
                          "{msg.positionShift.reason}"
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Round Takeaway */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong className="text-slate-800">Round Consensus Progression:</strong> {currentRound.roundTakeaway}</span>
            </div>

          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100">
            <MessageSquareCode className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Debate Step (Step 3)</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
            All 4 agents have formed their independent opinions. Now they will engage in a multi-turn structured debate to cross-examine evidence, resolve metric discrepancies, and dynamically converge on a reasoned decision.
          </p>
          <button
            id="start-debate-btn"
            onClick={() => onGenerateDebateRound(1)}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition disabled:opacity-50 inline-flex items-center space-x-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{isLoading ? 'Generating Agent Debate...' : 'Start Cross-Agent Debate'}</span>
          </button>
        </div>
      )}

    </div>
  );
};
