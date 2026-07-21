/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { KnowledgeItem, Profile } from '../types';
import {
  Sparkles,
  Link,
  Video,
  User,
  FileText,
  Bookmark,
  ChevronRight,
  Eraser,
  Undo,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AddItemProps {
  userId: string;
  profile: Profile;
  onAnalysisSuccess: (newItem: KnowledgeItem) => void;
}

export default function AddItem({ userId, profile, onAnalysisSuccess }: AddItemProps) {
  // Form states
  const [originalLink, setOriginalLink] = useState('');
  const [contentType, setContentType] = useState('Instagram Reel');
  const [platform, setPlatform] = useState('Instagram');
  const [creatorName, setCreatorName] = useState('');
  const [transcript, setTranscript] = useState('');
  const [personalNotes, setPersonalNotes] = useState('');
  const [category, setCategory] = useState('AI agents');

  // Interactive states
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const contentTypes = [
    'Instagram Reel', 'YouTube video', 'YouTube Short', 'LinkedIn post',
    'X post', 'Podcast', 'Article', 'Course lesson', 'Other'
  ];

  const categories = [
    'AI tools', 'AI agents', 'Automation', 'Content creation', 'Research',
    'Product building', 'Coding', 'Recruitment', 'Career growth',
    'Business ideas', 'Productivity', 'Other'
  ];

  const loadingMessages = [
    'The AI is reading your transcript...',
    'Now it is finding the main idea...',
    'Now it is looking for useful tools and techniques...',
    'Now it is deciding what may be useful for you...',
    'Now it is creating a simple explanation...'
  ];

  const sampleTranscript = `Hey guys, check out Vapi! This tool is incredible. You can build a voice-powered customer support chatbot in 10 minutes without writing a single line of code. You just connect your microphone, write down simple instructions like "You are a friendly dentist assistant", select a super realistic voice provider, and connect it to a Twilio phone number. It answers customer calls, takes down appointment notes, and pushes them straight into your Google Sheet. Setup is 100% free and very easy to configure!`;

  const handlePasteSample = () => {
    setOriginalLink('https://youtube.com/shorts/nocode_chatbot_voice');
    setContentType('YouTube Short');
    setPlatform('YouTube');
    setCreatorName('BuildWithAI');
    setTranscript(sampleTranscript);
    setCategory('AI tools');
    setPersonalNotes('Test receptionist voice latency on my pizzeria customer demo idea.');
  };

  const handleClear = () => {
    setOriginalLink('');
    setCreatorName('');
    setTranscript('');
    setPersonalNotes('');
  };

  const handleAnalyse = async (e: FormEvent) => {
    e.preventDefault();
    if (!transcript.trim()) {
      setError('Please provide a transcript. The transcript is a required field.');
      return;
    }
    setError(null);
    setLoading(true);
    setLoadingStep(0);

    // Simulated stepper animation
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingMessages.length - 1) return prev + 1;
        return prev;
      });
    }, 2800);

    try {
      const response = await fetch('/api/ai/analyse-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript,
          content_type: contentType,
          platform,
          creator_name: creatorName,
          original_link: originalLink,
          personal_notes: personalNotes,
          user_experience_level: profile.experience_level,
          user_learning_goals: profile.learning_goals,
          user_interests: profile.interests
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || 'The server encountered an error parsing the transcript.');
      }

      const aiData = await response.json();

      // Formulate a saved item
      const newItem: Omit<KnowledgeItem, 'id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        original_link: originalLink,
        content_type: contentType,
        platform,
        creator_name: creatorName,
        transcript,
        personal_notes: personalNotes,
        title: aiData.title || 'Parsed AI Transcript Lesson',
        main_topic: aiData.main_topic || 'AI Learning',
        category: aiData.category || category,
        tool_name: aiData.tool_name || 'None',
        simple_summary: aiData.simple_summary || 'An informative AI tutorial summary.',
        detailed_summary: aiData.detailed_summary || '',
        simple_explanation: aiData.simple_explanation || {
          what_is_it: 'Unknown',
          why_it_matters: 'Unknown',
          how_it_works: 'Unknown',
          where_to_use_it: 'Unknown',
          what_to_do_next: 'Unknown'
        },
        problem_solved: aiData.problem_solved || '',
        main_claims: aiData.main_claims || [],
        important_concepts: aiData.important_concepts || [],
        important_steps: aiData.important_steps || [],
        possible_use_cases: aiData.possible_use_cases || [],
        target_user: aiData.target_user || '',
        difficulty: aiData.difficulty || 'Medium',
        estimated_time: aiData.estimated_time || '10 minutes',
        coding_required: aiData.coding_required || 'No',
        phone_friendly: aiData.phone_friendly || 'Yes',
        pricing_type: aiData.pricing_type || 'Free',
        required_tools: aiData.required_tools || [],
        limitations: aiData.limitations || [],
        investigation_questions: aiData.investigation_questions || [],
        relevance_score: aiData.relevance_score || 70,
        relevance_reason: aiData.relevance_reason || '',
        recommended_decision: aiData.recommended_decision || 'Test now',
        suggested_action: aiData.suggested_action || '',
        status: 'Waiting for review', // Enters Inbox waiting for decision confirmation
      };

      const saved = await dbService.saveKnowledgeItem(newItem);
      onAnalysisSuccess(saved);
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please verify your connection/API Keys and try again.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  return (
    <div id="add-item-view" className="max-w-2xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">Add Transcript</h2>
        <p className="text-slate-500 text-sm mt-1">
          Paste the copied transcript of any reel, video, or article to get a simple, beginner-friendly explanation.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Analysis Failed</h4>
            <p className="mt-0.5 leading-relaxed font-medium">{error}</p>
            <p className="mt-1 text-[10px] text-rose-500 font-medium">We saved all your form inputs so you won't lose your work!</p>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-8 bg-white border border-slate-100 text-slate-800 rounded-[2rem] text-center space-y-6 shadow-sm py-16"
          >
            <div className="flex justify-center">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
            
            <div className="space-y-2 max-w-sm mx-auto">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Step 0{loadingStep + 1} of 05</span>
              <h3 className="text-lg font-bold tracking-tight text-slate-900">{loadingMessages[loadingStep]}</h3>
              <p className="text-slate-500 text-xs">
                Analyzing the transcript, mapping simple definitions, and custom calculating your match score...
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleAnalyse}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-7 shadow-sm space-y-5"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800">Fill in details</span>
              <button
                type="button"
                onClick={handlePasteSample}
                className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Paste Sample Transcript</span>
              </button>
            </div>

            {/* Link & platform row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Original URL Link (Optional)</label>
                <div className="relative">
                  <Link className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="url"
                    value={originalLink}
                    onChange={(e) => setOriginalLink(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Content Type & Platform</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold"
                  >
                    {contentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="text"
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    placeholder="Platform (e.g. YouTube)"
                    className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* Creator & Category row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Creator Name (Optional)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={creatorName}
                    onChange={(e) => setCreatorName(e.target.value)}
                    placeholder="e.g. AITrendsetter"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Learning Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Transcript Textarea (Required) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">Transcript / Copied Text (Required)</label>
                <span className="text-[10px] text-slate-400 font-mono">{transcript.length} chars</span>
              </div>
              <div className="relative">
                <FileText className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste the copied transcription text of the AI reel or video here..."
                  rows={6}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all leading-relaxed font-medium"
                  required
                />
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">My Personal Notes (Optional)</label>
              <div className="relative">
                <Bookmark className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  placeholder="e.g. Write why you saved this or what specific local business you think this can help."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-base md:text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all leading-relaxed font-medium"
                />
              </div>
            </div>

            {/* Prompt warning & action footer */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  💡 <strong>What happens next?</strong> The AI will read your transcript, explain it simply, match it to your experience level, and recommend one small action step to test it yourself.
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-lg shadow-indigo-100 animate-none"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Get Explanation</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
