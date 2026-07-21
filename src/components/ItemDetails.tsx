/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem } from '../types';
import {
  ChevronLeft,
  Sparkles,
  Award,
  Video,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  FileText,
  Clock,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ItemDetailsProps {
  userId: string;
  item: KnowledgeItem;
  onBack: () => void;
  setActiveTab: (tab: any) => void;
}

export default function ItemDetails({ userId, item, onBack, setActiveTab }: ItemDetailsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'lesson' | 'steps' | 'cases'>('lesson');
  const [simplifyLoading, setSimplifyLoading] = useState<string | null>(null);
  const [simplifiedTexts, setSimplifiedTexts] = useState<Record<string, string>>({});
  const [experimentLoading, setExperimentLoading] = useState(false);

  // Calls the server to rewrite a section into simplified ELI5 language
  const handleSimplifySection = async (sectionId: string, title: string, content: string) => {
    setSimplifyLoading(sectionId);
    try {
      const response = await fetch('/api/ai/explain-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section_title: title,
          section_content: content,
          explanation_style: 'Explain like I am five'
        })
      });

      if (!response.ok) throw new Error('Failed to fetch simplified translation');
      const data = await response.json();
      setSimplifiedTexts(prev => ({
        ...prev,
        [sectionId]: data.explanation
      }));
    } catch (err) {
      console.error(err);
      alert('Could not simplify this section right now. Please try again later.');
    } finally {
      setSimplifyLoading(null);
    }
  };

  // Calls the server to auto-generate a custom micro-experiment template based on this item
  const handleGenerateExperiment = async () => {
    setExperimentLoading(true);
    try {
      const response = await fetch('/api/ai/generate-experiment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });

      if (!response.ok) throw new Error('Failed to generate experiment template.');
      const data = await response.json();

      // Create & save the new experiment
      const newExp = {
        user_id: userId,
        knowledge_item_id: item.id,
        title: data.title || `Test: ${item.tool_name || item.title}`,
        status: 'Planned' as const,
        test_question: data.test_question || 'Does this work as advertised?',
        objective: data.objective || 'Verify claim under 10 minutes.',
        why_it_matters: data.why_it_matters || 'Validating tool reliability before integration.',
        steps: data.steps || ['Sign up', 'Paste prompt', 'Review result'],
        estimated_time: data.estimated_time || '15 mins',
        tools_required: data.tools_required || [item.tool_name],
        prompt_used: data.prompt_used || '',
        expected_result: data.expected_result || '',
        success_criteria: data.success_criteria || '',
        evidence_required: data.evidence_required || 'Output screenshots and logs.',
        possible_problems: data.possible_problems || [],
      };

      await dbService.saveExperiment(newExp);
      
      // Update item status to reflect action
      const updatedItem = {
        ...item,
        status: 'Test now' as const
      };
      await dbService.saveKnowledgeItem(updatedItem);

      alert(`Micro-Experiment "${data.title}" successfully created and saved in your queue!`);
      setActiveTab('experiments');
    } catch (err: any) {
      alert(`Experiment generation error: ${err.message}`);
    } finally {
      setExperimentLoading(false);
    }
  };

  // Helper dictionary of beginner friendly tooltips for glossary/ELI5
  const getGlossaryDefinition = (word: string) => {
    const dict: Record<string, string> = {
      'api': 'A digital plug that lets two different software applications talk to each other and trade data.',
      'autonomous agents': 'AI bots that are given a general goal, and then formulate their own step-by-step tasks to complete it without constant human instructions.',
      'automation': 'Setting up automated triggers (like an email arrival) to do recurring computer tasks automatically.',
      'workflow': 'A series of tasks or steps designed to complete a recurring job from start to finish.',
      'freemium': 'A pricing structure where the basic features are 100% free, but advanced features require payment.',
      'mvp': 'Minimum Viable Product: The absolute simplest version of your product that you can build and test immediately.',
    };
    return dict[word.toLowerCase()] || 'A technical term mentioned in this lesson.';
  };

  return (
    <div id="item-detail-view" className="space-y-6 max-w-3xl mx-auto">
      
      {/* Back button header */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Library</span>
      </button>

      {/* Main title banner */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono text-slate-400">
            <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase font-mono">{item.category}</span>
            <span>•</span>
            <span>Platform: {item.platform || 'Unknown'}</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug">
            {item.title}
          </h2>
          <p className="text-xs text-slate-400 font-semibold font-mono">
            Focus Tool: <span className="text-slate-600">{item.tool_name || 'General Concept'}</span>
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold">
          <Award className="w-4 h-4 shrink-0" />
          <span>{item.relevance_score}% Match</span>
        </div>
      </div>

      {/* Quick Tabs */}
      <div className="border-b border-slate-200 flex gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('lesson')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'lesson' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Lesson Overview
        </button>
        <button
          onClick={() => setActiveSubTab('steps')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'steps' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Steps & Sandbox
        </button>
        <button
          onClick={() => setActiveSubTab('cases')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeSubTab === 'cases' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Use Cases & Hype Check
        </button>
      </div>

      {/* Active Tab Panel */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-6">
        
        {activeSubTab === 'lesson' && (
          <div className="space-y-6">
            {/* The ELI5 Primary Card */}
            <div className="bg-slate-900 text-slate-200 p-5 sm:p-6 rounded-2xl border border-slate-800 space-y-4">
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Simple Explanation (ELI5)</span>
              
              <div className="grid grid-cols-1 gap-4 text-xs font-medium leading-relaxed">
                <div className="space-y-1">
                  <h4 className="text-white font-bold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>What is it?</span>
                  </h4>
                  <p>{item.simple_explanation.what_is_it}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-white font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    <span>Why does it matter?</span>
                  </h4>
                  <p>{item.simple_explanation.why_it_matters}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-white font-bold flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-pink-400" />
                    <span>How does it work?</span>
                  </h4>
                  <p>{item.simple_explanation.how_it_works}</p>
                </div>

                <div className="space-y-1">
                  <h4 className="text-white font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>What is my next action?</span>
                  </h4>
                  <p className="text-emerald-300 font-bold">{item.simple_explanation.what_to_do_next}</p>
                </div>
              </div>
            </div>

            {/* Detailed summary with Simplify trigger */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Comprehensive Lesson Summary</h3>
                <button
                  onClick={() => handleSimplifySection('det-sum', 'Lesson Summary', item.detailed_summary || item.simple_summary)}
                  disabled={simplifyLoading === 'det-sum'}
                  className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                >
                  {simplifyLoading === 'det-sum' ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3" />
                  )}
                  <span>ELI5 Simplify</span>
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-600 leading-relaxed font-semibold">
                {item.detailed_summary || item.simple_summary}

                {/* Simplified Overlay */}
                <AnimatePresence>
                  {simplifiedTexts['det-sum'] && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-[11px] text-emerald-800 font-medium"
                    >
                      <span className="font-bold text-[9px] uppercase tracking-wider text-emerald-600 font-mono block mb-1">AI Simplified analogy</span>
                      {simplifiedTexts['det-sum']}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Glossary words in this lesson */}
            {item.important_concepts.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Concept Glossary Terms</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.important_concepts.map((concept, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-1">
                      <h4 className="text-xs font-bold text-slate-800">{concept}</h4>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                        {getGlossaryDefinition(concept)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSubTab === 'steps' && (
          <div className="space-y-6">
            {/* Steps list with Simplify trigger next to each step */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Step-by-step Sandbox Guidelines</h3>
              
              <div className="space-y-3">
                {item.important_steps.map((stepText, idx) => {
                  const stepId = `step-${idx}`;
                  return (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center font-mono">
                            0{idx + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-800">Action Step</span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold pr-4">
                          {stepText}
                        </p>

                        {/* Simplified step answer */}
                        <AnimatePresence>
                          {simplifiedTexts[stepId] && (
                            <motion.div
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-[10px] text-emerald-800 font-medium"
                            >
                              💡 {simplifiedTexts[stepId]}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <button
                        onClick={() => handleSimplifySection(stepId, `Step 0${idx+1}`, stepText)}
                        disabled={simplifyLoading === stepId}
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 bg-white border border-slate-200 px-2 py-1 rounded-lg shrink-0 transition-all shadow-sm"
                      >
                        {simplifyLoading === stepId ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          'Simplify'
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Required environment tools card */}
            <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-emerald-950">Sandbox Tool Checklist</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  To conduct the recommended micro-experiment, you'll need to create a free account on the following services:
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {(item.required_tools || []).map((t, idx) => (
                    <span key={idx} className="bg-white border border-emerald-200/50 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-md font-mono">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'cases' && (
          <div className="space-y-6">
            
            {/* Practical Use Cases */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Practical Real-World Use Cases</h3>
              <div className="grid grid-cols-1 gap-3">
                {(item.possible_use_cases || []).map((uc, idx) => (
                  <div key={idx} className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 flex gap-2.5 items-start">
                    <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-bold text-slate-800">Use Case 0{idx + 1}</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-semibold">{uc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitations & Hype checks */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase font-mono tracking-wider">Hype Check & Limitations</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex items-start gap-2.5">
                  <AlertTriangle className="w-4.5 h-4.5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-950">Limitations & Failures</h4>
                    <ul className="list-disc list-inside text-[10px] text-rose-800 space-y-1 font-medium leading-relaxed">
                      {(item.limitations || []).map((limit, idx) => (
                        <li key={idx}>{limit}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-2.5">
                  <HelpCircle className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-amber-950">Investigation Questions</h4>
                    <p className="text-[10px] text-amber-800 font-medium leading-relaxed mb-1">
                      Test these critical claims during your experiment to confirm if it fits your needs:
                    </p>
                    <ul className="list-disc list-inside text-[10px] text-amber-800 space-y-1 font-medium leading-relaxed">
                      {(item.investigation_questions || []).map((q, idx) => (
                        <li key={idx}>{q}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metadata parameters */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Pricing</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">{item.pricing_type}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Requires Code</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">{item.coding_required}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl text-center">
                <span className="text-[9px] font-bold text-slate-400 font-mono uppercase block">Phone friendly</span>
                <span className="text-xs font-bold text-slate-700 mt-1 block">{item.phone_friendly}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action launchers block */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
          <button
            onClick={handleGenerateExperiment}
            disabled={experimentLoading}
            className="flex-1 min-w-[200px] bg-slate-900 hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-slate-900/10 disabled:opacity-50"
          >
            {experimentLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-emerald-400" />
            )}
            <span>{experimentLoading ? 'Formulating Micro-Test...' : 'Build No-Code Experiment'}</span>
          </button>

          <button
            onClick={() => {
              // Redirect to Content draft creator preloaded
              setActiveTab('ideas');
            }}
            className="px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
          >
            <Lightbulb className="w-4 h-4 text-emerald-600" />
            <span>SaaS Business Idea</span>
          </button>

          {item.original_link && (
            <a
              href={item.original_link}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-600 font-bold border border-slate-200 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Original Video</span>
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
