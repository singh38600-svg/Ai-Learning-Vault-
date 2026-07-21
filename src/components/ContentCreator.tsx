/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, Experiment } from '../types';
import {
  FileText,
  Sparkles,
  Award,
  Video,
  Copy,
  CheckCircle,
  HelpCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ContentCreatorProps {
  userId: string;
}

export default function ContentCreator({ userId }: ContentCreatorProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [exps, setExps] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection states
  const [selectedItemId, setSelectedItemId] = useState('');
  const [contentType, setContentType] = useState('Instagram Post');

  // AI states
  const [generating, setGenerating] = useState(false);
  const [resultDraft, setResultDraft] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [list, tests] = await Promise.all([
          dbService.getKnowledgeItems(userId),
          dbService.getExperiments(userId)
        ]);
        setItems(list);
        setExps(tests);
        
        if (list.length > 0) {
          setSelectedItemId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load content creator data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleCompose = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedItemId) return;
    setGenerating(true);
    setResultDraft(null);

    try {
      const parentItem = items.find(x => x.id === selectedItemId);
      const activeTest = exps.find(x => x.knowledge_item_id === selectedItemId);

      const response = await fetch('/api/ai/generate-content-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: parentItem?.title,
          tool_name: parentItem?.tool_name,
          main_claims: parentItem?.main_claims,
          experiment: activeTest ? {
            title: activeTest.title,
            notes: activeTest.notes,
            status: activeTest.status,
            final_decision: activeTest.final_decision
          } : {
            title: 'Theoretical testing only',
            notes: 'No active completed experiment logs found.'
          },
          content_type: contentType
        })
      });

      if (!response.ok) throw new Error('Could not compile content draft.');
      const data = await response.json();
      setResultDraft(data.draft);

      // Save a draft history to db service
      await dbService.saveContentDraft({
        user_id: userId,
        knowledge_item_id: selectedItemId,
        experiment_id: activeTest?.id,
        content_type: 'LinkedIn post',
        title: `Hype-Free Post: ${parentItem?.tool_name || parentItem?.title}`,
        body: data.draft,
        status: 'Draft'
      });
    } catch (err: any) {
      alert(`Content generator error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Assembling honest marketing tools...</p>
      </div>
    );
  }

  const selectedItem = items.find(x => x.id === selectedItemId);
  const selectedExp = exps.find(x => x.knowledge_item_id === selectedItemId);

  return (
    <div id="content-creator-view" className="space-y-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          <span>Hype-Free Content Creator</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Generate educational, completely transparent and honest blog drafts or scripts contrasting original video hype with your actual experimental findings.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl space-y-3">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800">No items available for content draft</h4>
          <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto leading-relaxed">
            Please save and review some knowledge items or conduct experiments first to generate content drafts based on actual learnings!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          <form onSubmit={handleCompose} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">Configure Draft</span>

            {/* Select Tool */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select studied AI item</label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold"
              >
                {items.map(it => <option key={it.id} value={it.id}>{it.tool_name} - {it.title}</option>)}
              </select>
            </div>

            {/* Select Content type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Platform & format style</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold"
              >
                <option value="LinkedIn Post">LinkedIn Post (Professional & objective)</option>
                <option value="Instagram / TikTok Script">Short Reel/TikTok Script (Punchy & visual)</option>
                <option value="Newsletter Segment">Newsletter Segment (Educational deep dive)</option>
                <option value="YouTube Script Draft">Full YouTube Script (Detailed breakdown)</option>
              </select>
            </div>

            {/* Exp Context Card preview */}
            {selectedItem && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-150 text-[11px] leading-relaxed font-semibold text-slate-600 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                  <span className="text-[10px] font-bold text-slate-700">Referencing Sandbox Data:</span>
                  {selectedExp ? (
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-mono">
                      ✓ Real experiment logged
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-1.5 py-0.5 rounded font-mono">
                      ⚠ Theoretical (No test logs found)
                    </span>
                  )}
                </div>
                <div>
                  <strong className="text-slate-800">Original claims:</strong> {selectedItem.main_claims.join(', ') || 'Vague tutorial claims.'}
                </div>
                <div>
                  <strong className="text-slate-800">My logged reality notes:</strong>{' '}
                  <span className="italic">"{selectedExp?.notes || 'No small safe test conducted yet. We advise completing tests before publishing.'}"</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={generating}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <span>{generating ? 'Drafting honest review...' : 'Compose Honest Draft with AI'}</span>
            </button>
          </form>

          {/* Result Area */}
          <AnimatePresence>
            {resultDraft && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 bg-emerald-50/5 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-bold text-emerald-600 font-mono uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Post Draft Ready (Hype-Free)
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(resultDraft);
                      alert('Copied draft to clipboard!');
                    }}
                    className="p-1.5 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1 text-[10px] font-bold"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </button>
                </div>

                <div className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-wrap font-mono p-4 bg-slate-50 rounded-2xl border border-slate-150 max-h-[350px] overflow-y-auto">
                  {resultDraft}
                </div>

                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-start gap-2 text-[10px] text-indigo-800 font-medium leading-relaxed">
                  <Award className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>
                    💡 <strong>Ethical Publishing Tip:</strong> Sharing real failures alongside successes is the fastest way to build authority on LinkedIn and YouTube. Your audiences appreciate transparency over exaggerated clickbait!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
