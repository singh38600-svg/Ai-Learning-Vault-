/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, Experiment, Profile } from '../types';
import {
  Award,
  Sparkles,
  Calendar,
  CheckCircle,
  TrendingUp,
  Watch,
  Activity,
  HeartHandshake,
  Check,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WeeklyReviewProps {
  userId: string;
  profile: Profile;
}

export default function WeeklyReview({ userId, profile }: WeeklyReviewProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [exps, setExps] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);

  // AI review states
  const [compiling, setCompiling] = useState(false);
  const [report, setReport] = useState<any | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [ki, ex] = await Promise.all([
          dbService.getKnowledgeItems(userId),
          dbService.getExperiments(userId)
        ]);
        setItems(ki);
        setExps(ex);
      } catch (err) {
        console.error('Failed to load stats for weekly review:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  // Compute stats
  const itemsAddedCount = items.length;
  const expsStartedCount = exps.filter(x => x.status === 'Active').length;
  const expsCompletedCount = exps.filter(x => x.status === 'Completed' || x.status === 'Adopted' || x.status === 'Rejected').length;
  const adoptedCount = exps.filter(x => x.status === 'Adopted' || x.final_decision === 'Adopted').length;
  const rejectedCount = exps.filter(x => x.status === 'Rejected' || x.final_decision === 'Rejected').length;
  
  const commonTopics = Array.from(new Set(items.map(x => x.category || 'AI tools'))).slice(0, 3);

  const handleCompile = async () => {
    setCompiling(true);
    setReport(null);
    try {
      const response = await fetch('/api/ai/generate-weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats: {
            items_added: itemsAddedCount,
            items_reviewed: items.filter(x => x.status !== 'Waiting for review').length,
            duplicate_items: 1, // simulated
            experiments_started: expsStartedCount,
            experiments_completed: expsCompletedCount,
            tools_adopted: adoptedCount,
            tools_rejected: rejectedCount,
            common_topics: commonTopics
          },
          onboarding: {
            experience_level: profile.experience_level,
            learning_goals: profile.learning_goals,
            interests: profile.interests
          }
        })
      });

      if (!response.ok) throw new Error('Weekly compile failed.');
      const data = await response.json();
      setReport(data);
    } catch (err: any) {
      alert(`Review compiler error: ${err.message}`);
    } finally {
      setCompiling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Compiling metrics chart...</p>
      </div>
    );
  }

  return (
    <div id="weekly-review-view" className="space-y-6 max-w-2xl mx-auto">
      
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calendar className="w-6 h-6 text-emerald-600" />
          <span>My Weekly Coach Review</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Review your empirical accomplishments, adopted techniques, and receive custom coaching insights for your upcoming week.
        </p>
      </div>

      {/* Quantitative Stats Row */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
        <div className="p-3 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 space-y-1">
          <span className="text-[9px] font-bold text-indigo-600 font-mono uppercase tracking-widest block">Saves Added</span>
          <span className="text-xl font-bold text-slate-900 block">{itemsAddedCount}</span>
        </div>
        <div className="p-3 bg-orange-50/40 rounded-2xl border border-orange-100/50 space-y-1">
          <span className="text-[9px] font-bold text-orange-600 font-mono uppercase tracking-widest block">Trials Active</span>
          <span className="text-xl font-bold text-slate-900 block">{expsStartedCount}</span>
        </div>
        <div className="p-3 bg-teal-50/40 rounded-2xl border border-teal-100/50 space-y-1">
          <span className="text-[9px] font-bold text-teal-600 font-mono uppercase tracking-widest block">Completed</span>
          <span className="text-xl font-bold text-slate-900 block">{expsCompletedCount}</span>
        </div>
        <div className="p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 space-y-1">
          <span className="text-[9px] font-bold text-emerald-600 font-mono uppercase tracking-widest block">Adopted</span>
          <span className="text-xl font-bold text-slate-900 block">{adoptedCount}</span>
        </div>
        <div className="p-3 bg-rose-50/40 rounded-2xl border border-rose-100/50 space-y-1">
          <span className="text-[9px] font-bold text-rose-600 font-mono uppercase tracking-widest block">Rejected</span>
          <span className="text-xl font-bold text-slate-900 block">{rejectedCount}</span>
        </div>
      </div>

      {/* Compiler Action Button */}
      {!report && (
        <button
          onClick={handleCompile}
          disabled={compiling}
          className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-slate-950/10 disabled:opacity-50"
        >
          {compiling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-emerald-400" />
          )}
          <span>{compiling ? 'Analyzing your learning logs...' : 'Compile My Weekly Report & Coach Insights'}</span>
        </button>
      )}

      {/* Synthesized Report Display */}
      <AnimatePresence>
        {report && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Coach Voice Banner */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 space-y-2.5">
                <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-widest flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-400" /> Supportive learning coach
                </span>
                <h3 className="text-base font-bold text-white leading-snug">Personal Recommendation</h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-semibold">
                  "{report.recommended_focus}"
                </p>
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/15 rounded-xl text-[11px] text-emerald-300 font-bold">
                  💡 Remember: In the journey of mastering AI, a single failed experiment yields 10x more genuine skills than filing 100 bookmark lists!
                </div>
              </div>
            </div>

            {/* Coach Detailed Findings Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Skills Developed */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <span className="text-[9px] font-bold text-indigo-600 font-mono uppercase tracking-widest block">Skills Developed This Week</span>
                <div className="space-y-2">
                  {(report.report_data?.skills_developed || ['Applying small safe test criteria', 'Separating marketing hype']).map((skill: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[11px] leading-relaxed font-semibold text-slate-600">
                      <Check className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Knowledge Gaps & Unfinished actions */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-3">
                <span className="text-[9px] font-bold text-rose-600 font-mono uppercase tracking-widest block">Knowledge Gaps / Next Goals</span>
                <div className="space-y-2">
                  {(report.report_data?.knowledge_gaps || ['Comparing alternative automated lists', 'Evaluating Twilio latency limits']).map((gap: string, idx: number) => (
                    <div key={idx} className="flex gap-2.5 items-start text-[11px] leading-relaxed font-semibold text-slate-600">
                      <TrendingUp className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <span>{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <button
              onClick={() => setReport(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl text-xs transition-colors"
            >
              Close and re-compile later
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
