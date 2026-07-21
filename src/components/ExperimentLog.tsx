/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, ChangeEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { Experiment, KnowledgeItem } from '../types';
import {
  FlaskConical,
  Sparkles,
  Flame,
  CheckCircle,
  AlertTriangle,
  Play,
  Check,
  X,
  FileText,
  Paperclip,
  Award,
  ChevronDown,
  ChevronUp,
  Inbox
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExperimentLogProps {
  userId: string;
  setActiveTab: (tab: any) => void;
}

export default function ExperimentLog({ userId, setActiveTab }: ExperimentLogProps) {
  const [exps, setExps] = useState<Experiment[]>([]);
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabSub, setActiveTabSub] = useState<'queue' | 'history'>('queue');

  // Expanded card tracking
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Focus limit error state
  const [focusError, setFocusError] = useState<string | null>(null);

  // Active logging states for selected items
  const [findingNotes, setFindingNotes] = useState('');
  const [mockAttachment, setMockAttachment] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [tests, list] = await Promise.all([
          dbService.getExperiments(userId),
          dbService.getKnowledgeItems(userId)
        ]);
        setExps(tests);
        setItems(list);
      } catch (err) {
        console.error('Failed to load experiments:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId, focusError]);

  const activeExperiments = exps.filter(x => x.status === 'Active');
  const plannedExperiments = exps.filter(x => x.status === 'Planned');

  // Launch a planned experiment to Active status
  const handleLaunchExperiment = async (expId: string) => {
    setFocusError(null);
    
    // Check strict 3-item focus limit
    if (activeExperiments.length >= 3) {
      setFocusError('⛔ Focus Check! You have 3 active experiments running already. To keep you focused, we restrict active tests to 3. Please complete or drop an existing experiment first!');
      return;
    }

    try {
      const exp = exps.find(x => x.id === expId);
      if (!exp) return;

      const updated = {
        ...exp,
        status: 'Active' as const
      };
      await dbService.saveExperiment(updated);
      
      // Update local states
      setExps(prev => prev.map(x => x.id === expId ? updated : x));
      setExpandedId(expId);
      setFindingNotes('');
    } catch (err) {
      console.error(err);
    }
  };

  // Log findings & complete experiment with Adopt/Reject decision
  const handleCompleteExperiment = async (expId: string, decision: 'Adopted' | 'Rejected' | 'Dropped') => {
    try {
      const exp = exps.find(x => x.id === expId);
      if (!exp) return;

      const updated: Experiment = {
        ...exp,
        status: decision === 'Dropped' ? 'Dropped' : 'Completed',
        notes: findingNotes.trim() || 'Completed no-code sandbox test.',
        final_decision: decision,
        media_proof: mockAttachment || exp.media_proof
      };

      await dbService.saveExperiment(updated);

      // Also update the parent knowledge item status to reflect completion
      if (exp.knowledge_item_id) {
        const item = items.find(x => x.id === exp.knowledge_item_id);
        if (item) {
          const updatedItem = {
            ...item,
            status: decision === 'Adopted' ? 'Test now' : 'Save as reference' // sync decision states
          };
          await dbService.saveKnowledgeItem(updatedItem);
        }
      }

      setExps(prev => prev.map(x => x.id === expId ? updated : x));
      setExpandedId(null);
      setFindingNotes('');
      setMockAttachment(null);
      alert(`Test finalized successfully! Catalogued as: "${decision}"`);
    } catch (err) {
      console.error(err);
    }
  };

  // Mock file attachment selector
  const handleMockAttachmentUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate physical file path save
      setMockAttachment(`/uploads/${file.name}`);
    }
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setFindingNotes('');
      setMockAttachment(null);
    } else {
      setExpandedId(id);
      const exp = exps.find(x => x.id === id);
      setFindingNotes(exp?.notes || '');
      setMockAttachment(exp?.media_proof || null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Accessing your sandbox environments...</p>
      </div>
    );
  }

  return (
    <div id="experiments-view" className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-emerald-600" />
          <span>Experiment Log & Action Queue</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Perform safe, 10-minute sandbox testing instead of just compiling theoretical bookmarks. Remember to keep your active trials short!
        </p>
      </div>

      {/* Focus Warning Alert */}
      {focusError && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Strict Focus Protection Active</h4>
            <p className="mt-0.5 leading-relaxed font-medium">{focusError}</p>
            <button
              onClick={() => setFocusError(null)}
              className="mt-2 text-rose-900 font-bold hover:underline"
            >
              Acknowledge and dismiss
            </button>
          </div>
        </div>
      )}

      {/* Dual subtabs */}
      <div className="border-b border-slate-200 flex gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => { setActiveTabSub('queue'); setFocusError(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTabSub === 'queue' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-orange-500" />
          <span>Active Focus Queue ({activeExperiments.length}/3)</span>
        </button>
        <button
          onClick={() => { setActiveTabSub('history'); setFocusError(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeTabSub === 'history' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-500" />
          <span>Sandbox History Archive ({exps.length})</span>
        </button>
      </div>

      {/* Panel 1: Action Focus Queue */}
      {activeTabSub === 'queue' && (
        <div className="space-y-6">
          
          {/* Active Running Experiments */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1">
                <span>Currently testing ({activeExperiments.length} running)</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Strict Limit: 3 Tests Max</span>
            </div>

            {activeExperiments.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3 shadow-sm">
                <FlaskConical className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No active tests running!</h4>
                <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto leading-relaxed">
                  Start an experiment from your planned list below, or go to your Library and tap "Build No-Code Experiment" to begin!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeExperiments.map((exp) => {
                  const isExpanded = expandedId === exp.id;
                  return (
                    <div
                      key={exp.id}
                      className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm"
                    >
                      {/* Card Header clickable to expand */}
                      <div
                        onClick={() => toggleExpand(exp.id)}
                        className="p-5 flex justify-between items-start gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-md font-mono uppercase tracking-wider">
                            ⚡ Active Trial
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">{exp.title}</h4>
                          <p className="text-[11px] text-slate-500 font-semibold font-mono">Question: "{exp.test_question}"</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-bold font-mono">{exp.estimated_time} test</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded logging section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-5 pb-5 border-t border-slate-100 pt-4 bg-slate-50/30 space-y-4 overflow-hidden"
                          >
                            {/* Steps lists */}
                            <div className="space-y-2">
                              <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Sandbox Instructions</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
                                <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1.5 font-medium">
                                  <strong className="text-slate-800 font-bold">Execution Steps:</strong>
                                  <ul className="list-decimal list-inside space-y-1 text-slate-600">
                                    {exp.steps.map((st, i) => <li key={i}>{st}</li>)}
                                  </ul>
                                </div>

                                <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2">
                                  <div>
                                    <strong className="text-slate-800 text-xs font-bold">Expected Behavior:</strong>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{exp.expected_result}</p>
                                  </div>
                                  <div>
                                    <strong className="text-emerald-800 text-xs font-bold">Success Criteria:</strong>
                                    <p className="text-[11px] text-emerald-600 font-semibold leading-relaxed mt-0.5">{exp.success_criteria}</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Prompt helper if exists */}
                            {exp.prompt_used && exp.prompt_used !== 'None' && (
                              <div className="space-y-1.5">
                                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Copypaste Testing Prompt</h5>
                                <div className="p-3 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl border border-slate-800 flex justify-between items-start">
                                  <span className="break-all pr-4">{exp.prompt_used}</span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(exp.prompt_used!);
                                      alert('Copied testing prompt to clipboard!');
                                    }}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white rounded transition-colors shrink-0"
                                  >
                                    Copy
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Logger findings input */}
                            <div className="space-y-3 pt-2 border-t border-slate-150">
                              <h5 className="text-xs font-bold text-slate-800">Log My Sandbox Findings</h5>
                              
                              <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">What actually happened? (Write simple notes)</label>
                                <textarea
                                  value={findingNotes}
                                  onChange={(e) => setFindingNotes(e.target.value)}
                                  placeholder="e.g. Tried connecting Twilio, chatbot responds in 1.2 seconds. Real voice sounds incredibly human, but Twilio setup cost $1 to test."
                                  rows={3}
                                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 transition-all font-medium leading-relaxed resize-none"
                                />
                              </div>

                              {/* Simple Attachment Uploader */}
                              <div className="space-y-2">
                                <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase">Upload Evidence / Screenshot (Optional)</label>
                                <div className="flex items-center gap-3">
                                  <label className="px-3 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm">
                                    <Paperclip className="w-3.5 h-3.5" />
                                    <span>Select file</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleMockAttachmentUpload}
                                      className="hidden"
                                    />
                                  </label>
                                  {mockAttachment && (
                                    <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs bg-slate-100 px-2 py-1 rounded-md">
                                      Saved path: {mockAttachment}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Complete actions row */}
                              <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleCompleteExperiment(exp.id, 'Adopted')}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>✓ Adopt Tool</span>
                                  </button>
                                  <button
                                    onClick={() => handleCompleteExperiment(exp.id, 'Rejected')}
                                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/10"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>✗ Reject Tool</span>
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleCompleteExperiment(exp.id, 'Dropped')}
                                  className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-[11px] font-semibold transition-colors"
                                >
                                  Drop Test
                                </button>
                              </div>
                            </div>

                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Planned Experiments list */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Planned Pipeline ({plannedExperiments.length})</h3>
            
            {plannedExperiments.length === 0 ? (
              <p className="text-[11px] text-slate-400 font-semibold font-mono">No pending scheduled tests in pipeline.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plannedExperiments.map((exp) => (
                  <div key={exp.id} className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 shadow-sm">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{exp.title}</h4>
                      <p className="text-[10px] text-slate-500 font-medium font-mono">Est: {exp.estimated_time} • Question: {exp.test_question}</p>
                    </div>

                    <button
                      onClick={() => handleLaunchExperiment(exp.id)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                      <span>Start Test</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Panel 2: Sandbox History Archive */}
      {activeTabSub === 'history' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Complete History Archive ({exps.length})</h3>
            <span className="text-[10px] font-mono text-slate-400">Chronological learning outcomes</span>
          </div>

          {exps.length === 0 ? (
            <div className="p-8 text-center bg-white border border-slate-200/80 rounded-3xl space-y-2">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto" />
              <h4 className="text-xs font-bold text-slate-800">No experiments generated yet!</h4>
              <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto">Build experiments from your Study Library to catalog learning records.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {exps.map((exp) => {
                let statusBadge = 'bg-slate-100 text-slate-600';
                if (exp.status === 'Active') statusBadge = 'bg-orange-50 text-orange-600 border border-orange-100 animate-pulse';
                else if (exp.final_decision === 'Adopted') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                else if (exp.final_decision === 'Rejected') statusBadge = 'bg-rose-50 text-rose-700 border border-rose-100';
                else if (exp.status === 'Dropped' || exp.final_decision === 'Dropped') statusBadge = 'bg-slate-100 text-slate-500 border border-slate-200';

                return (
                  <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${statusBadge}`}>
                          {exp.final_decision || exp.status}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">Est: {exp.estimated_time}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                      {exp.notes && (
                        <p className="text-[11px] text-slate-500 font-semibold pr-4">
                          📝 <strong>Findings:</strong> "{exp.notes}"
                        </p>
                      )}
                    </div>

                    {exp.media_proof && (
                      <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded font-mono font-bold self-start sm:self-auto">
                        📎 Evidence attachment saved
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
