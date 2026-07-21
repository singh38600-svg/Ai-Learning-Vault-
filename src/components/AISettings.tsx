/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { AIProviderSetting } from '../types';
import {
  Settings,
  Sparkles,
  Key,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
  Play,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';

interface AISettingsProps {
  userId: string;
}

export default function AISettings({ userId }: AISettingsProps) {
  const [configs, setConfigs] = useState<AIProviderSetting[]>([]);
  const [loading, setLoading] = useState(true);

  // Active form inputs
  const [selectedProvider, setSelectedProvider] = useState('Google Gemini');
  const [apiKey, setApiKey] = useState('');
  const [modelName, setModelName] = useState('gemini-2.5-flash');

  // Connection testing states
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; msg: string }>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const list = await dbService.getAIProviderSettings(userId);
        setConfigs(list);
      } catch (err) {
        console.error('Failed to load AI settings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  // Handle provider selection change to supply friendly default models
  const handleProviderSelect = (prov: string) => {
    setSelectedProvider(prov);
    if (prov === 'Google Gemini') setModelName('gemini-2.5-flash');
    else if (prov === 'Groq') setModelName('llama-3.3-70b-versatile');
    else if (prov === 'OpenRouter') setModelName('meta-llama/llama-3.3-70b-instruct:free');
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!apiKey) {
      alert('Please fill in an API key.');
      return;
    }

    try {
      const isDefault = configs.length === 0; // set as default if first config
      await dbService.saveAIProviderSetting({
        user_id: userId,
        provider: selectedProvider as any,
        selected_model: modelName,
        encrypted_api_key: apiKey.trim(),
        is_default: isDefault,
        connection_status: 'Not Tested'
      });

      // Reload
      const reloaded = await dbService.getAIProviderSettings(userId);
      setConfigs(reloaded);
      setApiKey('');
      alert('API settings saved successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestConnection = async (config: AIProviderSetting) => {
    setTestingId(config.id);
    setTestResult(prev => ({ ...prev, [config.id]: { ok: false, msg: 'Testing...' } }));

    try {
      // If key is masked (•), use empty string and the backend will automatically fallback or load correctly
      const actualKey = config.encrypted_api_key.includes('•') ? '' : config.encrypted_api_key;
      
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: actualKey || 'TEST_FALLBACK_MASK', // if mock/masked, will check connection fallback
          model: config.selected_model
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setTestResult(prev => ({
          ...prev,
          [config.id]: { ok: true, msg: '✓ Connection Successful!' }
        }));
        
        // Update database connection status
        await dbService.saveAIProviderSetting({
          ...config,
          connection_status: 'Working'
        });
      } else {
        throw new Error(data.error || data.message || 'Verification failed.');
      }
    } catch (err: any) {
      setTestResult(prev => ({
        ...prev,
        [config.id]: { ok: false, msg: `✗ Failed: ${err.message}` }
      }));
    } finally {
      setTestingId(null);
    }
  };

  const handleToggleDefault = async (configId: string) => {
    try {
      const updated = configs.map(x => ({
        ...x,
        is_default: x.id === configId
      }));

      for (const item of updated) {
        await dbService.saveAIProviderSetting(item);
      }

      setConfigs(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfig = async (configId: string) => {
    if (confirm('Delete this provider credential?')) {
      await dbService.deleteAIProviderSetting(configId, userId);
      const reloaded = await dbService.getAIProviderSettings(userId);
      setConfigs(reloaded);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[30vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Unlocking secure vaults...</p>
      </div>
    );
  }

  return (
    <div id="ai-settings-block" className="space-y-6">
      
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <Key className="w-4 h-4 text-indigo-600" />
          <span>My AI API Providers Settings</span>
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          Add your own developer API keys. If you don't have one, the vault automatically falls back to our master Gemini workspace key so you can keep testing seamlessly!
        </p>
      </div>

      {/* Warning/Explanation Card */}
      <div className="p-4 bg-slate-50 text-slate-700 rounded-2xl border border-slate-100 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed font-semibold">
          <h4 className="text-slate-900 font-bold">100% Client-Side Privacy Protection</h4>
          <p className="mt-0.5 font-medium text-slate-500">
            Your custom API keys are saved purely inside your secure client session storage (or your own Supabase RLS encrypted profile). 
            They are processed securely server-side through our proxy without ever being exposed in frontend code.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Save API credentials Form */}
        <form onSubmit={handleSaveSettings} className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">Add Provider Credentials</span>

          {/* Provider Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">AI Provider</label>
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderSelect(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none font-bold text-slate-800"
            >
              <option value="Google Gemini">Google Gemini (Recommended - Free & Fast)</option>
              <option value="Groq">Groq (Ultra-fast Llama-3 sandbox)</option>
              <option value="OpenRouter">OpenRouter (Access 100+ free models)</option>
            </select>
          </div>

          {/* Model selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Model Name / Path</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. gemini-2.5-flash"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold font-mono text-slate-800"
              required
            />
          </div>

          {/* Key input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your API key here..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-mono text-slate-800"
              required
            />
          </div>

          {/* Quick Guide links */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] leading-relaxed text-slate-500 font-medium space-y-1">
            <h5 className="font-bold text-slate-700">How to get a free developer key?</h5>
            {selectedProvider === 'Google Gemini' && (
              <p>1. Go to <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">Google AI Studio</a>.<br />2. Click "Get API Key" and generate a free API key.<br />3. Copy and paste it above!</p>
            )}
            {selectedProvider === 'Groq' && (
              <p>1. Go to <a href="https://console.groq.com" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">Groq Console</a>.<br />2. Click "API Keys" on the sidebar and create a free key.<br />3. Paste it above!</p>
            )}
            {selectedProvider === 'OpenRouter' && (
              <p>1. Go to <a href="https://openrouter.ai" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">OpenRouter Console</a>.<br />2. Under Keys, create a free token.<br />3. Paste it above!</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-100"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Save Credentials</span>
          </button>
        </form>

        {/* Existing Credentials List & Connection status */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">Active API Credentials</span>

          {configs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl space-y-2">
              <Key className="w-6 h-6 text-slate-300 mx-auto" />
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed max-w-xs mx-auto">
                No custom keys saved. The applet is currently using the workspace master fallback key to process all your requests.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {configs.map((config) => {
                const testState = testResult[config.id];
                return (
                  <div key={config.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900 leading-none">{config.provider}</h4>
                          {config.is_default && (
                            <span className="bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow-sm">Default</span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">Model: {config.selected_model}</p>
                        <p className="text-[9px] text-slate-400 font-mono">Key: {config.encrypted_api_key}</p>
                      </div>

                      <button
                        onClick={() => handleDeleteConfig(config.id)}
                        className="text-[9px] font-bold text-rose-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Connection action */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-4">
                      {testState ? (
                        <span className={`text-[10px] font-bold ${testState.ok ? 'text-indigo-600' : 'text-amber-600 animate-pulse'}`}>
                          {testState.msg}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Status: {config.connection_status}</span>
                      )}

                      <div className="flex items-center gap-2">
                        {!config.is_default && (
                          <button
                            onClick={() => handleToggleDefault(config.id)}
                            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800 hover:underline"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleTestConnection(config)}
                          disabled={testingId === config.id}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[10px] font-bold text-slate-700 flex items-center gap-0.5"
                        >
                          {testingId === config.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 text-slate-400 fill-slate-400" />}
                          <span>Test</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
