import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, CheckCircle2, AlertCircle, Shield, ExternalLink } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-3.7-flash');
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      const savedKey = localStorage.getItem('gemini_custom_api_key') || '';
      const savedModel = localStorage.getItem('gemini_selected_model') || 'gemini-3.7-flash';
      setApiKey(savedKey);
      setSelectedModel(savedModel);
      setTestStatus('idle');
      setTestMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('gemini_custom_api_key', apiKey.trim());
    localStorage.setItem('gemini_selected_model', selectedModel);
    setTestStatus('success');
    setTestMessage('Settings saved and applied successfully!');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleClear = () => {
    localStorage.removeItem('gemini_custom_api_key');
    localStorage.setItem('gemini_selected_model', 'gemini-3.7-flash');
    setApiKey('');
    setSelectedModel('gemini-3.7-flash');
    setTestStatus('success');
    setTestMessage('Settings reset to default environment configuration.');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">LLM API Key & Model Settings</h2>
              <p className="text-xs text-slate-400">Configure your Gemini API key and model preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* API Key Input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Gemini API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (leave blank to use default server key)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-indigo-400 hover:text-indigo-300"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5 text-indigo-400 inline" />
              <span>Your key is stored securely in your browser's local storage and used only for proxying AI agent deliberations.</span>
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Select Gemini Model</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="gemini-3.7-flash">Gemini 3.7 Flash (Recommended - Best speed & reasoning)</option>
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fast & lightweight)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep complex analysis)</option>
              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite (Ultra-fast response)</option>
            </select>
            <p className="text-[11px] text-slate-400">
              Choose the Gemini model variant used across all multi-agent evaluation pipelines and live debate turns.
            </p>
          </div>

          {testMessage && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              testStatus === 'success' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
            }`}>
              {testStatus === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testMessage}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              Reset to Default
            </button>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
              >
                Save & Apply
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
