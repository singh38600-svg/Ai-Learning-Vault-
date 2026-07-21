/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, Experiment, ContentDraft, ProductIdea, Profile } from '../types';
import {
  Sparkles,
  Inbox,
  Library,
  FlaskConical,
  CheckCircle,
  XCircle,
  Lightbulb,
  FileText,
  Flame,
  ArrowRight,
  TrendingUp,
  Award,
  PlusCircle
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  userId: string;
  setActiveTab: (tab: 'dashboard' | 'add' | 'inbox' | 'library' | 'actions' | 'experiments' | 'ideas' | 'settings') => void;
  setSelectedItemId: (id: string | null) => void;
  profile: Profile;
}

export default function Dashboard({ userId, setActiveTab, setSelectedItemId, profile }: DashboardProps) {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [exps, setExps] = useState<Experiment[]>([]);
  const [drafts, setDrafts] = useState<ContentDraft[]>([]);
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ki, ex, dr, id] = await Promise.all([
          dbService.getKnowledgeItems(userId),
          dbService.getExperiments(userId),
          dbService.getContentDrafts(userId),
          dbService.getProductIdeas(userId),
        ]);
        setItems(ki);
        setExps(ex);
        setDrafts(dr);
        setIdeas(id);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-[50vh] space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs">Assembling your learning metrics...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalSaved = items.length;
  const waitingReview = items.filter(x => x.status === 'Waiting for review').length;
  const readyToTest = items.filter(x => x.status === 'Test now').length;
  const activeExps = exps.filter(x => x.status === 'Active').length;
  const completedExps = exps.filter(x => x.status === 'Completed' || x.status === 'Adopted' || x.status === 'Rejected').length;
  const adoptedTools = exps.filter(x => x.status === 'Adopted' || x.final_decision === 'Adopted').length;
  const rejectedTools = exps.filter(x => x.status === 'Rejected' || x.final_decision === 'Rejected').length;
  const contentDraftsCreated = drafts.length;
  const productIdeasCreated = ideas.length;

  // Encouragement Message
  const testedCount = completedExps + activeExps;
  const progressMessage = totalSaved > 0
    ? `You saved ${totalSaved} useful ideas and tested ${testedCount}. Let's choose one small thing to try today!`
    : "Your vault is empty! Let's copy a transcript from a viral AI video or post and see what you can test today!";

  // Generate dynamic recommended actions (max 3)
  const recommendedActions: Array<{
    id: string;
    title: string;
    description: string;
    actionLabel: string;
    tab: 'dashboard' | 'add' | 'inbox' | 'library' | 'actions' | 'experiments' | 'ideas' | 'settings';
    itemId?: string;
  }> = [];

  // Action 1: Review items waiting in Inbox
  if (waitingReview > 0) {
    recommendedActions.push({
      id: 'review-inbox',
      title: 'Review Inbox Items',
      description: `You have ${waitingReview} saved transcripts waiting for your analysis review. Let's see which are relevant!`,
      actionLabel: 'Go to Inbox',
      tab: 'inbox'
    });
  }

  // Action 2: Trigger a planned experiment
  const pendingExp = exps.find(x => x.status === 'Planned');
  if (pendingExp && recommendedActions.length < 3) {
    recommendedActions.push({
      id: 'start-experiment',
      title: 'Launch a Micro-Test',
      description: `Ready to test "${pendingExp.title}"? It only takes about ${pendingExp.estimated_time || '15 mins'} of no-code investigation.`,
      actionLabel: 'Open Experiments',
      tab: 'experiments'
    });
  }

  // Action 3: Turn an adopted tool into a SaaS idea or Content Draft
  const adoptedExp = exps.find(x => x.status === 'Adopted' || x.final_decision === 'Adopted');
  if (adoptedExp && recommendedActions.length < 3) {
    recommendedActions.push({
      id: 'create-product-idea',
      title: 'Formulate a Product Idea',
      description: `You successfully adopted "${adoptedExp.title}"! Let's translate this verified expertise into a small business idea.`,
      actionLabel: 'Generate Product Idea',
      tab: 'ideas'
    });
  }

  // Fallbacks if not enough context
  if (recommendedActions.length < 3) {
    recommendedActions.push({
      id: 'add-item',
      title: 'Add an AI Reel or Article',
      description: 'Found a helpful tip on Instagram, YouTube, or Medium? Paste its transcript here to extract clean steps.',
      actionLabel: 'Add New Content',
      tab: 'add'
    });
  }
  if (recommendedActions.length < 3) {
    recommendedActions.push({
      id: 'try-compare',
      title: 'Compare Tools',
      description: 'Select two saved tools from your library to examine their differences, pricing, and limitations side-by-side.',
      actionLabel: 'Open Library to Compare',
      tab: 'library'
    });
  }

  const statCards = [
    { label: 'Total Saved', value: totalSaved, icon: Library, color: 'bg-indigo-50 text-indigo-600' },
    { label: 'Review Pending', value: waitingReview, icon: Inbox, color: 'bg-amber-50 text-amber-600' },
    { label: 'Ready to Test', value: readyToTest, icon: Sparkles, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Active Tests', value: activeExps, icon: FlaskConical, color: 'bg-pink-50 text-pink-600 animate-pulse' },
    { label: 'Tests Completed', value: completedExps, icon: CheckCircle, color: 'bg-teal-50 text-teal-600' },
    { label: 'Tools Adopted', value: adoptedTools, icon: Award, color: 'bg-purple-50 text-purple-600' },
    { label: 'Tools Rejected', value: rejectedTools, icon: XCircle, color: 'bg-rose-50 text-rose-600' },
    { label: 'Product Ideas', value: productIdeasCreated, icon: Lightbulb, color: 'bg-sky-50 text-sky-600' },
    { label: 'Content Drafts', value: contentDraftsCreated, icon: FileText, color: 'bg-slate-50 text-slate-600' },
  ];

  return (
    <div id="dashboard-view" className="space-y-8">
      
      {/* Clean Minimalism Top Header */}
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 pb-2"
      >
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Workspace Overview</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            Hello, {profile.full_name}! 👋
          </h2>
          <p className="text-slate-500 max-w-xl leading-relaxed text-sm font-medium">
            {progressMessage}
          </p>
        </div>
        
        <div className="shrink-0">
          <button
            onClick={() => setActiveTab('add')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all flex items-center gap-2 text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Analyse Video</span>
          </button>
        </div>
      </motion.header>

      {/* Recommended Next Actions */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-600" />
          <span>Recommended Actions (Max 3)</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedActions.map((action, index) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={action.id}
              className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-indigo-200 transition-colors flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Action 0{index + 1}</span>
                  <span className="text-slate-400 text-xs font-medium">⏱ Active</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{action.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{action.description}</p>
              </div>
              
              <button
                onClick={() => {
                  if (action.itemId) setSelectedItemId(action.itemId);
                  setActiveTab(action.tab);
                }}
                className="mt-6 w-full py-3 bg-slate-900 text-white hover:bg-black rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <span>{action.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bento Stats Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Vault Metrics</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-9 gap-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            // Introduce subtle border-l styles to some cards for rhythm/variation as in Clean Minimalism
            const isFeatured = index === 0 || index === 2 || index === 5;
            return (
              <div
                key={stat.label}
                className={`bg-white p-5 rounded-3xl border border-slate-100 flex flex-col justify-between shadow-sm transition-transform hover:-translate-y-0.5 duration-200 ${
                  isFeatured ? 'border-l-4 border-l-indigo-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">{stat.label}</span>
                  <div className="p-1 text-slate-400 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4 text-2xl font-bold text-slate-900 leading-none">{stat.value}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Onboarding goals reminder card */}
      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Target Learning Synergy</span>
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            You set your experience level as <strong className="font-bold text-slate-900">{profile.experience_level}</strong> with active interest in <strong className="font-bold text-slate-900">{profile.interests.join(', ')}</strong>. Matching entries are highlighted automatically.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="shrink-0 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition-colors shadow-sm"
        >
          Adjust Experience Goals
        </button>
      </div>

    </div>
  );
}
