/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem } from '../types';
import {
  Inbox as InboxIcon,
  AlertTriangle,
  Bookmark,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Trash2,
  FileText,
  Lightbulb,
  ArrowRight,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InboxProps {
  userId: string;
  onDecisionComplete: () => void;
  setSelectedItemId: (id: string | null) => void;
  setActiveTab: (tab: any) => void;
}

export default function Inbox({ userId, onDecisionComplete, setSelectedItemId, setActiveTab }: InboxProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [allItems, setAllItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await dbService.getKnowledgeItems(userId);
        setAllItems(list);
        setItems(list.filter(x => x.status === 'Waiting for review'));
      } catch (err) {
        console.error('Failed to load inbox items:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId, successMsg]);

  const handleDecision = async (itemId: string, decision: KnowledgeItem['status']) => {
    try {
      const itemToUpdate = allItems.find(x => x.id === itemId);
      if (!itemToUpdate) return;

      const updatedItem = {
        ...itemToUpdate,
        status: decision,
        recommended_decision: decision as any, // sync recommended
      };

      await dbService.saveKnowledgeItem(updatedItem);
      
      // If decided to Test Now, we should also automatically generate an experiment template!
      if (decision === 'Test now') {
        setSuccessMsg(`Awesome choice! Moved to Test queue. Let's build a micro-experiment.`);
      } else {
        setSuccessMsg(`Decision catalogued: "${decision}"`);
      }

      setTimeout(() => setSuccessMsg(null), 3000);
      onDecisionComplete();
    } catch (err) {
      console.error('Failed to save decision:', err);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this save permanently?')) {
      await dbService.deleteKnowledgeItem(itemId, userId);
      setSuccessMsg('Deleted knowledge item.');
      setTimeout(() => setSuccessMsg(null), 3000);
      onDecisionComplete();
    }
  };

  // Automated duplicate & similarity detection helpers
  const getDuplicateFeedback = (currentItem: KnowledgeItem) => {
    if (!currentItem.tool_name || currentItem.tool_name === 'None') return null;

    const duplicates = allItems.filter(
      x => x.id !== currentItem.id &&
      x.tool_name?.toLowerCase() === currentItem.tool_name?.toLowerCase()
    );

    if (duplicates.length > 0) {
      const prevSaved = duplicates[0];
      return {
        count: duplicates.length,
        title: prevSaved.title,
        id: prevSaved.id,
        isIdenticalTranscript: prevSaved.transcript.length === currentItem.transcript.length,
      };
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Scanning incoming items...</p>
      </div>
    );
  }

  return (
    <div id="inbox-view" className="space-y-6">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <InboxIcon className="w-6 h-6 text-emerald-600" />
            <span>Review Inbox ({items.length})</span>
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Items enter here after AI transcript processing. Select your preferred next action to turn watching into doing!
          </p>
        </div>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3.5 bg-slate-900 text-emerald-400 text-xs font-semibold rounded-2xl flex items-center gap-2 border border-emerald-950/25"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* Decision Quick Explanation Box */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Test now</span>
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Try this idea using one small real task (<strong className="font-bold">Highly recommended!</strong>).</p>
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Learn later</span>
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Keep this because you need to understand something else first.</p>
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>Save as reference</span>
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Keep it for future help, but no active action is required today.</p>
        </div>
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
            <span>Compare</span>
          </h4>
          <p className="text-[10px] text-slate-500 leading-relaxed font-medium">Put next to similar tools and see which one performs better.</p>
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3 shadow-sm"
          >
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Your Inbox is Completely Empty!</h3>
            <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed font-medium">
              Excellent job. You have evaluated and filed every single saved tutorial transcription! Add a new item to get started again.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {items.map((item) => {
              const dupInfo = getDuplicateFeedback(item);
              
              // Relevance badge color
              let scoreColor = 'bg-rose-50 text-rose-700 border-rose-100';
              if (item.relevance_score >= 85) scoreColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
              else if (item.relevance_score >= 65) scoreColor = 'bg-amber-50 text-amber-700 border-amber-100';

              return (
                <motion.div
                  key={item.id}
                  layoutId={item.id}
                  exit={{ opacity: 0, x: -30 }}
                  className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 relative"
                >
                  {/* Top header line */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{item.content_type}</span>
                        <span>•</span>
                        <span>Platform: {item.platform || 'Unknown'}</span>
                        {item.creator_name && (
                          <>
                            <span>•</span>
                            <span>Creator: @{item.creator_name}</span>
                          </>
                        )}
                      </div>
                      <h3
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setActiveTab('library');
                        }}
                        className="text-base font-bold text-slate-900 tracking-tight hover:text-emerald-600 cursor-pointer transition-colors"
                      >
                        {item.title}
                      </h3>
                    </div>

                    {/* Score badge */}
                    <div className={`flex items-center gap-1 border px-3 py-1.5 rounded-xl ${scoreColor}`}>
                      <span className="text-xs font-bold">{item.relevance_score}% Match</span>
                    </div>
                  </div>

                  {/* Duplicate alerts */}
                  {dupInfo && (
                    <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-2 text-[11px] text-amber-800 leading-relaxed font-medium">
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        {dupInfo.isIdenticalTranscript ? (
                          <p>
                            ⚠️ <strong>Exact duplicate detected!</strong> You already saved this identical transcript on: <strong className="underline hover:text-amber-950 cursor-pointer" onClick={() => { setSelectedItemId(dupInfo.id); setActiveTab('library'); }}>{dupInfo.title}</strong>.
                          </p>
                        ) : (
                          <p>
                            ⚠️ <strong>Similar tool saved earlier!</strong> You already saved {dupInfo.count} item(s) about <strong className="font-bold">{item.tool_name}</strong>. This item contains a new use case that was not in your earlier saves.
                          </p>
                        )}
                        <div className="mt-2 flex gap-3 text-[10px] font-bold text-amber-900">
                          <button onClick={() => handleDecision(item.id, 'Compare')} className="hover:underline">Compare them</button>
                          <span>•</span>
                          <button onClick={() => handleDecision(item.id, 'Archived')} className="hover:underline">Archive duplicate</button>
                          <span>•</span>
                          <button onClick={() => handleDelete(item.id)} className="hover:underline text-rose-700">Delete duplicate</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Short Summary & Relevance reason */}
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                      {item.simple_summary}
                    </p>
                    {item.relevance_reason && (
                      <div className="text-[11px] text-emerald-800 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/50 flex items-start gap-1.5 font-medium">
                        <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Match reason:</strong> {item.relevance_reason}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Action Decision Grid */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleDecision(item.id, 'Test now')}
                        className={`px-3 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm ${
                          item.recommended_decision === 'Test now'
                            ? 'bg-slate-900 text-white border border-slate-900 shadow-md shadow-slate-950/10'
                            : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Test Now</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'Learn later')}
                        className={`px-3 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm ${
                          item.recommended_decision === 'Learn later'
                            ? 'bg-slate-900 text-white border border-slate-900'
                            : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        <span>Learn Later</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'Save as reference')}
                        className={`px-3 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm ${
                          item.recommended_decision === 'Save as reference'
                            ? 'bg-slate-900 text-white border border-slate-900'
                            : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Reference</span>
                      </button>

                      <button
                        onClick={() => handleDecision(item.id, 'Compare')}
                        className={`px-3 py-2 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1 shadow-sm ${
                          item.recommended_decision === 'Compare'
                            ? 'bg-slate-900 text-white border border-slate-900'
                            : 'bg-white text-slate-800 border border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-purple-500" />
                        <span>Compare</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setActiveTab('library');
                        }}
                        className="px-3.5 py-2 text-[11px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl flex items-center gap-1 transition-all"
                      >
                        <span>Full Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 border border-slate-200 hover:border-rose-300 hover:text-rose-600 rounded-xl transition-colors"
                        title="Delete Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
