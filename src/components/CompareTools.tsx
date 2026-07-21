/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { KnowledgeItem, Profile } from '../types';
import {
  RefreshCw,
  Award,
  ChevronLeft,
  Smartphone,
  Code,
  DollarSign,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompareToolsProps {
  items: KnowledgeItem[];
  profile: Profile;
  onBack: () => void;
  setActiveTab: (tab: any) => void;
}

export default function CompareTools({ items, profile, onBack, setActiveTab }: CompareToolsProps) {
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<string | null>(null);

  const calculateComparisonRecommendation = () => {
    setLoading(true);
    // Dynamic logic based on user profile and selected tools
    setTimeout(() => {
      let recText = '';
      const hasFree = items.some(x => x.pricing_type === 'Free');
      const hasPhone = items.some(x => x.phone_friendly === 'Yes');
      const codingNovice = profile.coding_knowledge === 'No';

      if (items.length === 2) {
        const [toolA, toolB] = items;
        recText = `Based on your onboarding profile as a ${profile.experience_level} who uses a ${profile.main_device}, here is our recommendation:
We highly recommend starting with **${toolA.relevance_score > toolB.relevance_score ? toolA.tool_name : toolB.tool_name}** because it has a significantly higher compatibility score (${Math.max(toolA.relevance_score, toolB.relevance_score)}%) with your goals: "${profile.learning_goals}". 

- If you want a quick, 10-minute free trial without complex setup, use **${toolA.pricing_type === 'Free' ? toolA.tool_name : toolB.tool_name}**.
- If you are testing from your mobile phone, **${hasPhone ? items.find(x => x.phone_friendly === 'Yes')?.tool_name : 'either'}** is your optimal sandbox choice.`;
      } else {
        const bestItem = [...items].sort((a,b) => b.relevance_score - a.relevance_score)[0];
        recText = `After analyzing these ${items.length} options against your interests in "${profile.interests.join(', ')}", our top pick is **${bestItem.tool_name}**:
- **Why**: It matches your "${profile.experience_level}" background perfectly and presents the lowest entry barrier for coding requirements (${bestItem.coding_required}).
- **First Step**: Go to its Steps & Sandbox guidelines tab and launch its generated micro-experiment to test it in under 15 minutes!`;
      }

      setRecommendation(recText);
      setLoading(false);
    }, 1200);
  };

  return (
    <div id="compare-tools-view" className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header back */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-all shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Return to Library</span>
      </button>

      {/* Header title */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-emerald-600" />
          <span>Compare Tools Side-by-Side</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">
          Review claims, capabilities, difficulty, and restrictions for your selected {items.length} tools.
        </p>
      </div>

      {/* Comparison Grid Matrix */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50">
              <th className="p-4 font-bold text-slate-500 uppercase font-mono tracking-wider w-40 shrink-0">Specification</th>
              {items.map((item) => (
                <th key={item.id} className="p-4 font-bold text-slate-900 border-l border-slate-100 min-w-48 text-center">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase font-mono">{item.category}</span>
                    <h4 className="text-xs font-bold leading-none mt-1">{item.tool_name}</h4>
                    <p className="text-[10px] text-slate-400 font-medium font-mono truncate max-w-[180px]">{item.title}</p>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="divide-y divide-slate-100">
            {/* 1. Relevance score */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Compatibility</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-center">
                  <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[11px]">
                    <Award className="w-3.5 h-3.5" />
                    <span>{item.relevance_score}% Match</span>
                  </span>
                </td>
              ))}
            </tr>

            {/* 2. Simple analogy summary */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Analogous Purpose</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-center font-medium text-slate-500 leading-relaxed max-w-[200px]">
                  {item.simple_summary}
                </td>
              ))}
            </tr>

            {/* 3. Difficulty */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Difficulty</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-center font-semibold text-slate-700">
                  {item.difficulty}
                </td>
              ))}
            </tr>

            {/* 4. Pricing type */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Pricing Sandbox</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-center font-semibold text-slate-700">
                  <span className="inline-flex items-center gap-0.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.pricing_type}</span>
                  </span>
                </td>
              ))}
            </tr>

            {/* 5. Phone Friendly */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Mobile Usable</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-center">
                  <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-full ${item.phone_friendly === 'Yes' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Smartphone className="w-3 h-3" />
                    <span>{item.phone_friendly === 'Yes' ? 'Yes, Phone Friendly' : 'No'}</span>
                  </span>
                </td>
              ))}
            </tr>

            {/* 6. Coding required */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Coding Required</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-center">
                  <span className={`inline-flex items-center gap-1 font-semibold text-[10px] px-2 py-0.5 rounded-full ${item.coding_required === 'No' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                    <Code className="w-3 h-3" />
                    <span>{item.coding_required === 'Yes' ? 'Requires Code' : 'No-Code'}</span>
                  </span>
                </td>
              ))}
            </tr>

            {/* 7. Limitations */}
            <tr>
              <td className="p-4 font-bold text-slate-700 font-mono">Key Limitations</td>
              {items.map((item) => (
                <td key={item.id} className="p-4 border-l border-slate-100 text-left font-medium text-slate-500 max-w-[200px] leading-relaxed">
                  <ul className="list-disc list-inside space-y-1 text-[10px]">
                    {(item.limitations || []).map((l, i) => <li key={i}>{l}</li>)}
                  </ul>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Recommendations & Action blocks */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-xl shadow-slate-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>AI Comparative Advice Summary</span>
            </h3>

            <button
              onClick={calculateComparisonRecommendation}
              disabled={loading}
              className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[10px] transition-all"
            >
              {loading ? 'Synthesizing...' : 'Calculate Advice'}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {recommendation ? (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs leading-relaxed font-semibold text-slate-200 max-w-2xl whitespace-pre-line"
              >
                {recommendation}
              </motion.div>
            ) : (
              <p className="text-slate-400 text-[11px] font-medium font-mono">
                Tap "Calculate Advice" to get customized feedback matching these tools directly against your learning profile.
              </p>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
}
