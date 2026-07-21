/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, ProductIdea } from '../types';
import {
  Lightbulb,
  Sparkles,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Zap,
  HelpCircle,
  Copy,
  DollarSign,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductIdeaGeneratorProps {
  userId: string;
}

export default function ProductIdeaGenerator({ userId }: ProductIdeaGeneratorProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // AI states
  const [generating, setGenerating] = useState(false);
  const [resultIdea, setResultIdea] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await dbService.getKnowledgeItems(userId);
        setItems(list);
      } catch (err) {
        console.error('Failed to load items for idea generator:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const handleCheckboxToggle = (id: string) => {
    if (selectedItemIds.includes(id)) {
      setSelectedItemIds(selectedItemIds.filter(x => x !== id));
    } else {
      if (selectedItemIds.length >= 3) {
        alert('Please select a maximum of 3 tools to synthesize into one product concept.');
        return;
      }
      setSelectedItemIds([...selectedItemIds, id]);
    }
  };

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedItemIds.length === 0) return;
    setGenerating(true);
    setResultIdea(null);

    try {
      const selectedObjects = items.filter(x => selectedItemIds.includes(x.id));

      const response = await fetch('/api/ai/generate-product-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: selectedObjects })
      });

      if (!response.ok) throw new Error('Failed to generate product idea blueprint.');
      const data = await response.json();
      setResultIdea(data);

      // Save to databases history
      await dbService.saveProductIdea({
        user_id: userId,
        source_knowledge_item_ids: selectedItemIds,
        problem: data.problem || 'Identified workflow friction.',
        evidence: 'Synthesized from saved knowledge items.',
        target_user: data.target_user || 'Target customer.',
        existing_solutions: data.existing_solutions || 'Alternative workarounds.',
        market_gap: 'Identified gap in automated workflows.',
        proposed_solution: data.proposed_solution || 'No-code AI assistant.',
        why_now: data.why_now || 'Immediate capability shift.',
        core_features: data.core_features || [],
        mvp_scope: data.mvp_scope || 'Rapid 1-day testing scope.',
        validation_test: data.validation_test || 'Initial validation test pitch.',
        difficulty: (data.difficulty as any) || 'Medium',
        estimated_cost: 'Low',
        monetization: data.monetization || [],
        risks: data.risks || [],
        next_action: data.next_action || 'Pitch the booking agent solution.',
        status: 'Exploring'
      });
    } catch (err: any) {
      alert(`Product concept error: ${err.message}`);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Unlocking business matrices...</p>
      </div>
    );
  }

  return (
    <div id="product-generator-view" className="space-y-6 max-w-3xl mx-auto font-sans">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-emerald-600" />
          <span>No-Code SaaS Product Idea Builder</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Select 1 to 3 verified tools from your library to synthesize them into a realistic, non-technical micro-SaaS or agency startup concept.
        </p>
      </div>

      {/* Educational info card */}
      <div className="p-4 bg-slate-100 border border-slate-200/80 rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-semibold text-slate-600">
        <TrendingUp className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-slate-800 font-bold">💡 Hype Checklist: Problem vs. Cool Idea</h4>
          <p className="mt-0.5 font-medium">
            An <strong className="text-slate-800">idea</strong> is just "I want to build a cool chat tool." 
            A <strong className="text-emerald-800 font-bold">real commercial problem</strong> is "Dentists lose $500 every week on missed booking phone calls because they are busy in cleanings." 
            People pay to eliminate painful local business frustrations — not for cool technology.
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/80 rounded-3xl space-y-2 shadow-sm">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
          <h4 className="text-xs font-bold text-slate-800">Your Study Vault is empty</h4>
          <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto">Please save and review some tools in your inbox before building product ideations.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          <form onSubmit={handleGenerate} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest">Select up to 3 saved tools</span>
              <span className="text-[10px] font-mono font-bold text-emerald-600">{selectedItemIds.length}/3 selected</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[180px] overflow-y-auto pr-1">
              {items.map((item) => {
                const isSelected = selectedItemIds.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className={`p-3 border rounded-xl text-xs font-semibold transition-all flex items-center justify-between cursor-pointer select-none ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <p className="truncate leading-none">{item.tool_name}</p>
                      <span className="text-[9px] text-slate-400 font-mono mt-1 block truncate max-w-[180px]">{item.title}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCheckboxToggle(item.id)}
                      className="rounded border-slate-300 accent-emerald-500 w-3.5 h-3.5"
                    />
                  </label>
                );
              })}
            </div>

            <button
              type="submit"
              disabled={generating || selectedItemIds.length === 0}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-emerald-400" />
              )}
              <span>{generating ? 'Formulating business concept...' : 'Build 1-Day Micro-SaaS MVP Blueprint'}</span>
            </button>
          </form>

          {/* Business blueprint results bento grid */}
          <AnimatePresence>
            {resultIdea && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase font-mono tracking-wider">MVP Launch Blueprint</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Painful problem card */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-2">
                      <span className="text-[9px] font-bold text-rose-600 font-mono uppercase tracking-widest block">The Local Pain Point</span>
                      <h4 className="text-xs font-bold text-slate-900">{resultIdea.problem}</h4>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        <strong className="text-slate-700">Target User:</strong> {resultIdea.target_user} <br />
                        <strong className="text-slate-700">Frustrating Alternative:</strong> {resultIdea.existing_solutions}
                      </p>
                    </div>

                    {/* Non-technical proposed solution */}
                    <div className="bg-slate-900 text-slate-200 p-5 rounded-3xl border border-slate-800 space-y-2 shadow-md">
                      <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-widest block">Proposed No-Code AI solution</span>
                      <h4 className="text-xs font-bold text-white leading-relaxed">{resultIdea.proposed_solution}</h4>
                      <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1 text-slate-400 font-medium">
                        <p><strong>MVP Scope:</strong> {resultIdea.mvp_scope}</p>
                        <p className="text-emerald-300"><strong>First action:</strong> {resultIdea.next_action}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* MVP features bento block */}
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
                      <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">1-Day MVP Feature Scope</span>
                      <div className="space-y-2">
                        {(resultIdea.core_features || []).map((feat: string, idx: number) => (
                          <div key={idx} className="flex gap-2.5 items-start text-[11px] leading-relaxed font-semibold text-slate-600">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Monetization & validation */}
                    <div className="bg-emerald-500/5 border border-emerald-500/10 p-5 rounded-3xl space-y-3 font-medium">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-emerald-700 font-mono uppercase tracking-widest block">Monetization & Validation</span>
                        <p className="text-emerald-950 text-xs font-bold">{resultIdea.validation_test}</p>
                      </div>
                      
                      <div className="pt-2 border-t border-emerald-500/10 grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <span className="text-emerald-800 font-bold font-mono">Suggested Price</span>
                          <p className="text-slate-700 font-semibold mt-0.5">{(resultIdea.monetization || []).join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-emerald-800 font-bold font-mono">Hurdles</span>
                          <p className="text-slate-700 font-semibold mt-0.5">{(resultIdea.risks || []).join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}

    </div>
  );
}
