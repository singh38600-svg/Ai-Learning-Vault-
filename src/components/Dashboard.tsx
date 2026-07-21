import { useEffect, useState } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, Experiment, Profile } from '../types';
import {
  PlusCircle,
  ArrowRight,
  Sparkles
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [ki, ex] = await Promise.all([
          dbService.getKnowledgeItems(userId),
          dbService.getExperiments(userId),
        ]);
        setItems(ki);
        setExps(ex);
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Assembling your progress...</p>
      </div>
    );
  }

  const totalSaved = items.length;
  // Tried is completed, active or adopted experiments
  const totalTried = exps.filter(x => x.status !== 'Planned').length;
  // Useful is adopted/approved experiments
  const totalUseful = exps.filter(x => x.status === 'Adopted' || x.final_decision === 'Adopted').length;

  const progressSentence = totalSaved > 0
    ? `You have saved ${totalSaved} lessons and tried ${totalTried} small actions. Keep it up!`
    : "Your vault is empty. Paste a transcript to get your first simplified explanation!";

  // Up to three recent lessons
  const recentLessons = [...items]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3);

  // Single recommended next action
  let recommendedAction = {
    title: "Add your first lesson",
    description: "Paste a transcript from any AI video, reel, or article to extract clear, beginner-friendly steps.",
    buttonText: "Paste Transcript",
    onClick: () => setActiveTab('add')
  };

  if (totalSaved > 0) {
    const pendingExp = exps.find(x => x.status === 'Planned');
    const runningExp = exps.find(x => x.status === 'Active');
    
    if (runningExp) {
      recommendedAction = {
        title: `Finish testing: ${runningExp.title}`,
        description: `You are currently trying this tool. Record what happened to finish your test and save your learnings!`,
        buttonText: "Record What Happened",
        onClick: () => setActiveTab('experiments')
      };
    } else if (pendingExp) {
      recommendedAction = {
        title: `Try this next: ${pendingExp.title}`,
        description: `Take one small action today: ${pendingExp.objective || 'Investigate this tool'}. It only takes about 10-15 minutes!`,
        buttonText: "Start Simple Test",
        onClick: () => setActiveTab('experiments')
      };
    } else {
      // Find a saved item without any experiments
      const itemWithNoExp = items.find(item => !exps.some(e => e.knowledge_item_id === item.id));
      if (itemWithNoExp) {
        recommendedAction = {
          title: `Set up a test for "${itemWithNoExp.title}"`,
          description: `You saved this lesson. Choose one small action from it and try it out to see if it's actually useful!`,
          buttonText: "Choose an Action",
          onClick: () => {
            setSelectedItemId(itemWithNoExp.id);
            setActiveTab('library');
          }
        };
      } else {
        recommendedAction = {
          title: "Find another lesson to save",
          description: "Paste another video or article transcript to learn another no-code trick.",
          buttonText: "Add Transcript",
          onClick: () => setActiveTab('add')
        };
      }
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Friendly Greeting Header */}
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
          Hello, {profile.full_name}! 👋
        </h2>
        <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed">
          {progressSentence}
        </p>
      </div>

      {/* Primary Call to Action Button */}
      <div className="pt-2">
        <button
          onClick={() => setActiveTab('add')}
          className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-base shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2.5"
        >
          <PlusCircle className="w-5 h-5" />
          <span>{totalSaved > 0 ? "Add Transcript" : "Add My First Transcript"}</span>
        </button>
      </div>

      {/* Progress Counts (Saved, Tried, Useful) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Your Progress
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{totalSaved}</span>
              <span className="text-[10px] text-slate-500 font-medium">lessons</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tried</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-slate-900">{totalTried}</span>
              <span className="text-[10px] text-slate-500 font-medium font-mono">times</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Useful</span>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-emerald-600">{totalUseful}</span>
              <span className="text-[10px] text-slate-500 font-medium font-mono">tools</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State Instruction or Recommended Action */}
      {totalSaved === 0 ? (
        <div className="bg-indigo-50/50 rounded-3xl border border-indigo-100 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-900">How to use your Learning Vault</h4>
              <p className="text-xs text-indigo-700/90 leading-relaxed mt-1 font-medium">
                This is where you paste transcripts from viral AI reels, posts, or articles to get beginner-friendly, jargon-free explanations. 
                Our AI will break down what the tool does, who it's for, and give you one small action step to test it yourself.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Recommended Action (What to Try Next) */
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            What to Try Next
          </h3>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wide font-mono">
                Suggested
              </span>
              <h4 className="text-base font-bold text-slate-900">{recommendedAction.title}</h4>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {recommendedAction.description}
              </p>
            </div>
            <button
              onClick={recommendedAction.onClick}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-950 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>{recommendedAction.buttonText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Up to Three Recently Saved Lessons */}
      {totalSaved > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
            Recently Saved Lessons
          </h3>
          <div className="space-y-3">
            {recentLessons.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setSelectedItemId(item.id);
                  setActiveTab('library');
                }}
                className="p-4 bg-white rounded-2xl border border-slate-100 hover:border-indigo-200 shadow-sm transition-colors cursor-pointer flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono truncate">
                      {item.tool_name || 'General Lesson'}
                    </span>
                    {item.is_demo && (
                      <span className="text-[9px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold font-mono border border-amber-100">
                        Demo
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                    {item.one_sentence_explanation}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600">
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* What you are learning Goals */}
      <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider font-mono">
          What You Are Learning
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          You are exploring tools with a <strong className="font-bold text-slate-800">{profile.experience_level}</strong> skill level on <strong className="font-bold text-slate-800">{profile.main_device}</strong>. Focused on <strong className="font-bold text-slate-800">{profile.interests.join(', ')}</strong>.
        </p>
        <button
          onClick={() => setActiveTab('settings')}
          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 pt-1"
        >
          Change Preferences →
        </button>
      </div>
    </div>
  );
}
