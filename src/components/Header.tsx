import React from 'react';
import { 
  Users, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Layers, 
  GitCompare, 
  FileText, 
  Award, 
  HelpCircle,
  MessageSquare,
  Bot,
  Settings,
  UploadCloud
} from 'lucide-react';
import { CandidateDossier } from '../types';

interface HeaderProps {
  candidates: CandidateDossier[];
  selectedCandidateId: string;
  onSelectCandidate: (id: string) => void;
  activeView: 'pipeline' | 'debate_studio' | 'head_to_head' | 'dossiers';
  onSelectView: (view: 'pipeline' | 'debate_studio' | 'head_to_head' | 'dossiers') => void;
  isAudioEnabled: boolean;
  onToggleAudio: () => void;
  onOpenRubricModal: () => void;
  onOpenDossierModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenUploadModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  activeView,
  onSelectView,
  isAudioEnabled,
  onToggleAudio,
  onOpenRubricModal,
  onOpenDossierModal,
  onOpenSettingsModal,
  onOpenUploadModal
}) => {
  const currentCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-rose-500 flex items-center justify-center shadow-md shadow-indigo-500/20 ring-1 ring-white/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-bold text-base sm:text-lg text-white tracking-tight">
                  Multi-Agent AI Interview Panel
                </h1>
                <span className="hidden sm:inline-flex text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  4 Autonomous Agents
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Independent Persona Deliberation • Multi-turn Debate • Evidence Verification
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              id="nav-pipeline-tab"
              onClick={() => onSelectView('pipeline')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'pipeline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Deliberation Pipeline</span>
            </button>

            <button
              id="nav-debate-studio-tab"
              onClick={() => onSelectView('debate_studio')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'debate_studio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Debate Studio</span>
            </button>

            <button
              id="nav-head-to-head-tab"
              onClick={() => onSelectView('head_to_head')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'head_to_head'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Head-to-Head</span>
            </button>

            <button
              id="nav-dossiers-tab"
              onClick={() => onSelectView('dossiers')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeView === 'dossiers'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>JD & Dossiers</span>
            </button>
          </nav>

          {/* Right Controls: Candidate Selector, Audio Toggle, Rubric */}
          <div className="flex items-center space-x-3">
            
            {/* Candidate Switcher Dropdown / Pills */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <span className="text-[11px] text-slate-400 font-medium px-2 hidden lg:inline">
                Candidate:
              </span>
              {candidates.map(candidate => {
                const isSelected = candidate.id === selectedCandidateId;
                return (
                  <button
                    key={candidate.id}
                    id={`select-candidate-${candidate.id}`}
                    onClick={() => onSelectCandidate(candidate.id)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs ring-1 ring-indigo-500/50'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {candidate.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>

            {/* Audio Toggle */}
            <button
              id="toggle-audio-btn"
              onClick={onToggleAudio}
              title={isAudioEnabled ? 'Panel Voice Audio Enabled' : 'Panel Voice Audio Muted'}
              className={`p-2 rounded-lg border text-xs font-medium transition flex items-center space-x-1.5 ${
                isAudioEnabled
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isAudioEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
              <span className="hidden sm:inline">{isAudioEnabled ? 'Voice On' : 'Voice Off'}</span>
            </button>

            {/* Ingest / Upload Dossier Button */}
            <button
              id="open-upload-modal-btn"
              onClick={onOpenUploadModal}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs text-xs font-semibold transition flex items-center space-x-1.5"
              title="Upload and Parse Resume, Transcript & Job Spec (PDF/TXT)"
            >
              <UploadCloud className="w-4 h-4" />
              <span className="hidden sm:inline">Upload Dossier</span>
            </button>

            {/* Rubric / Scoring Spec Modal */}
            <button
              id="view-rubric-modal-btn"
              onClick={onOpenRubricModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center space-x-1"
              title="View Challenge Judging Rubric (100 pts)"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Judging Rubric</span>
            </button>

            {/* API Settings Button */}
            <button
              id="open-settings-modal-btn"
              onClick={onOpenSettingsModal}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center space-x-1"
              title="Configure LLM API Keys & Models"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">API Settings</span>
            </button>
          </div>

        </div>

        {/* Mobile View Switcher */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800 text-xs">
          <button
            onClick={() => onSelectView('pipeline')}
            className={`px-2 py-1 rounded font-semibold ${
              activeView === 'pipeline' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Pipeline
          </button>
          <button
            onClick={() => onSelectView('debate_studio')}
            className={`px-2 py-1 rounded font-semibold ${
              activeView === 'debate_studio' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Debate
          </button>
          <button
            onClick={() => onSelectView('head_to_head')}
            className={`px-2 py-1 rounded font-semibold ${
              activeView === 'head_to_head' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => onSelectView('dossiers')}
            className={`px-2 py-1 rounded font-semibold ${
              activeView === 'dossiers' ? 'text-indigo-400 bg-slate-800' : 'text-slate-400'
            }`}
          >
            Dossiers
          </button>
        </div>
      </div>
    </header>
  );
};
