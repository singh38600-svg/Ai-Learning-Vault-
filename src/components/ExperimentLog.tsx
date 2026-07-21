import { useEffect, useState, ChangeEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { Experiment, KnowledgeItem } from '../types';
import {
  FlaskConical,
  Play,
  Check,
  X,
  Paperclip,
  ChevronDown,
  ChevronUp,
  Inbox,
  AlertTriangle
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
  const finishedExperiments = exps.filter(x => x.status === 'Completed' || x.status === 'Dropped');

  // Launch a planned experiment to Active status
  const handleLaunchExperiment = async (expId: string) => {
    setFocusError(null);
    
    // Check strict 3-item focus limit
    if (activeExperiments.length >= 3) {
      setFocusError('⛔ Focus Check! You already have 3 tests running. Complete or drop one first to stay focused!');
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

      // Update parent knowledge item status if exists
      if (exp.knowledge_item_id) {
        const item = items.find(x => x.id === exp.knowledge_item_id);
        if (item) {
          const updatedItem = {
            ...item,
            status: decision === 'Adopted' ? 'Test now' as const : 'Save as reference' as const
          };
          await dbService.saveKnowledgeItem(updatedItem);
        }
      }

      setExps(prev => prev.map(x => x.id === expId ? updated : x));
      setExpandedId(null);
      setFindingNotes('');
      setMockAttachment(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMockAttachmentUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading experiments...</p>
      </div>
    );
  }

  if (exps.length === 0) {
    if (items.length === 0) {
      return (
        <div id="experiments-view" className="space-y-6 max-w-md mx-auto py-12 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-sans">Try Next is Empty</h2>
          <p className="text-slate-500 text-sm leading-relaxed font-semibold">
            There are no sandbox tests or action plans setup yet. Save a lesson first to formulate a small test experiment!
          </p>
          <button
            onClick={() => setActiveTab('add')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]"
          >
            Paste Transcript Now
          </button>
        </div>
      );
    } else {
      return (
        <div id="experiments-view" className="space-y-6 max-w-md mx-auto py-12 text-center">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <FlaskConical className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 font-sans">No Tests Started Yet</h2>
          <p className="text-slate-500 text-sm leading-relaxed font-semibold">
            You have saved lessons but haven't planned any sandbox tests yet. Go to Saved Lessons, select a lesson, and plan a simple test!
          </p>
          <button
            onClick={() => setActiveTab('library')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md min-h-[44px]"
          >
            Browse Saved Lessons
          </button>
        </div>
      );
    }
  }

  return (
    <div id="experiments-view" className="space-y-6 max-w-2xl mx-auto">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2 font-sans">
          <FlaskConical className="w-6 h-6 text-indigo-600" />
          <span>Try Next</span>
        </h2>
        <p className="text-slate-500 text-sm mt-1 leading-relaxed">
          Test tools in a safe, free no-code sandbox instead of just collecting bookmarks. Keep tests under 15 minutes!
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

      {/* SECTION 1: TRYING NOW (ACTIVE) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Trying Now ({activeExperiments.length} running)
        </h3>

        {activeExperiments.length === 0 ? (
          <div className="p-6 text-center bg-white rounded-2xl border border-slate-100 space-y-2 shadow-sm">
            <FlaskConical className="w-6 h-6 text-slate-300 mx-auto" />
            <h4 className="text-xs font-bold text-slate-700">No active tests running</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-semibold">
              Tap "Start Test" on a planned action below to begin!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeExperiments.map((exp) => {
              const isExpanded = expandedId === exp.id;
              return (
                <div
                  key={exp.id}
                  className="bg-white rounded-2xl border border-slate-250 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => toggleExpand(exp.id)}
                    className="p-4 flex justify-between items-start gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-orange-600 bg-orange-50 border border-orange-100 px-1.5 py-0.5 rounded-md font-mono uppercase tracking-wider">
                        Active
                      </span>
                      {exp.is_demo && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold font-mono border border-amber-100 ml-1">
                          Demo
                        </span>
                      )}
                      <h4 className="text-sm font-bold text-slate-950 mt-1">{exp.title}</h4>
                      <p className="text-xs text-slate-500 font-semibold leading-relaxed">Question: "{exp.test_question}"</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono font-bold">{exp.estimated_time}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4 border-t border-slate-100 pt-3 bg-slate-50/30 space-y-4 overflow-hidden"
                      >
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Sandbox Guide</h5>
                          <div className="grid grid-cols-1 gap-3 text-xs leading-relaxed">
                            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-1.5 font-medium">
                              <strong className="text-slate-800 font-bold">Steps to follow:</strong>
                              <ul className="list-decimal list-inside space-y-1 text-slate-600">
                                {exp.steps.map((st, i) => <li key={i}>{st}</li>)}
                              </ul>
                            </div>

                            <div className="p-3 bg-white border border-slate-200/80 rounded-xl space-y-2">
                              <div>
                                <strong className="text-slate-800 text-xs font-bold">Expected Outcome:</strong>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5">{exp.expected_result}</p>
                              </div>
                              <div>
                                <strong className="text-emerald-800 text-xs font-bold">Success Criteria:</strong>
                                <p className="text-[11px] text-emerald-600 font-semibold leading-relaxed mt-0.5">{exp.success_criteria}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {exp.prompt_used && exp.prompt_used !== 'None' && (
                          <div className="space-y-1">
                            <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Copy-Paste Prompt</h5>
                            <div className="p-3 bg-slate-900 text-slate-200 text-xs font-mono rounded-xl border border-slate-800 flex justify-between items-start">
                              <span className="break-all pr-4">{exp.prompt_used}</span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(exp.prompt_used!);
                                  alert('Copied prompt!');
                                }}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white rounded transition-colors shrink-0"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="space-y-3 pt-2 border-t border-slate-150">
                          <h5 className="text-xs font-bold text-slate-800">Record What Happened</h5>
                          
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase">Notes (What actually happened?)</label>
                            <textarea
                              value={findingNotes}
                              onChange={(e) => setFindingNotes(e.target.value)}
                              placeholder="e.g. Chatbot responded in 1 second. Voice sounds super realistic, but Twilio number setup cost $1."
                              rows={3}
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 transition-all font-medium leading-relaxed resize-none"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-slate-400 font-mono uppercase">Evidence Screenshot (Optional)</label>
                            <div className="flex items-center gap-2">
                              <label className="px-3 py-2 border border-slate-200 hover:border-slate-300 bg-white text-slate-600 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1 shadow-sm">
                                <Paperclip className="w-3.5 h-3.5" />
                                <span>Attach File</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleMockAttachmentUpload}
                                  className="hidden"
                                />
                              </label>
                              {mockAttachment && (
                                <span className="text-[10px] text-slate-400 font-mono truncate max-w-xs bg-slate-100 px-2 py-1 rounded-md">
                                  Saved: {mockAttachment}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 flex items-center justify-between gap-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleCompleteExperiment(exp.id, 'Adopted')}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/10 min-h-[44px]"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Useful Tool</span>
                              </button>
                              <button
                                onClick={() => handleCompleteExperiment(exp.id, 'Rejected')}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/10 min-h-[44px]"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Not Useful</span>
                              </button>
                            </div>

                            <button
                              onClick={() => handleCompleteExperiment(exp.id, 'Dropped')}
                              className="px-3 py-2 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-xl text-xs font-semibold transition-colors min-h-[44px]"
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

      {/* SECTION 2: TRY NEXT (PLANNED) */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Try Next ({plannedExperiments.length})
        </h3>
        
        {plannedExperiments.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold font-mono">No planned tests. Go to Saved Lessons to create one!</p>
        ) : (
          <div className="space-y-2">
            {plannedExperiments.map((exp) => (
              <div key={exp.id} className="p-4 bg-white rounded-2xl border border-slate-150 flex items-center justify-between gap-4 shadow-sm">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{exp.title}</h4>
                    {exp.is_demo && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold font-mono border border-amber-100">
                        Demo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold">Test: "{exp.test_question}" • Est: {exp.estimated_time}</p>
                </div>

                <button
                  onClick={() => handleLaunchExperiment(exp.id)}
                  className="px-4 py-2 bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 shadow-sm min-h-[44px]"
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>Start Test</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: THINGS TRIED */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Things Tried ({finishedExperiments.length})
        </h3>

        {finishedExperiments.length === 0 ? (
          <p className="text-xs text-slate-400 font-semibold font-mono">No completed tests yet.</p>
        ) : (
          <div className="space-y-2">
            {finishedExperiments.map((exp) => {
              let badgeStyle = 'bg-slate-100 text-slate-600';
              let badgeLabel = 'Finished';

              if (exp.final_decision === 'Adopted') {
                badgeStyle = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                badgeLabel = 'Useful';
              } else if (exp.final_decision === 'Rejected') {
                badgeStyle = 'bg-rose-50 text-rose-700 border border-rose-100';
                badgeLabel = 'Not Useful';
              } else if (exp.final_decision === 'Dropped' || exp.status === 'Dropped') {
                badgeStyle = 'bg-slate-100 text-slate-500 border border-slate-200';
                badgeLabel = 'Dropped';
              }

              return (
                <div key={exp.id} className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider ${badgeStyle}`}>
                        {badgeLabel}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-bold">Est: {exp.estimated_time}</span>
                      {exp.is_demo && (
                        <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold font-mono border border-amber-100">
                          Demo
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{exp.title}</h4>
                    {exp.notes && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        📝 <strong>Findings:</strong> "{exp.notes}"
                      </p>
                    )}
                  </div>

                  {exp.media_proof && (
                    <span className="text-[9px] text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-mono font-bold self-start sm:self-auto">
                      📎 Screenshot saved
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
