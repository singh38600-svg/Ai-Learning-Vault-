/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Profile } from '../types';
import { dbService } from '../lib/databaseService';
import { BookOpen, Check, ChevronRight, GraduationCap, Smartphone, Sparkles, Watch } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingProps {
  userId: string;
  onOnboardingComplete: (profile: Profile) => void;
}

export default function Onboarding({ userId, onOnboardingComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [learningGoals, setLearningGoals] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<Profile['experience_level']>('Beginner');
  const [mainDevice, setMainDevice] = useState<Profile['main_device']>('Both');
  const [codingKnowledge, setCodingKnowledge] = useState<Profile['coding_knowledge']>('No');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [currentProjects, setCurrentProjects] = useState('');
  const [weeklyLearningTime, setWeeklyLearningTime] = useState(3);
  const [preferredStyle, setPreferredStyle] = useState<Profile['preferred_explanation_style']>('Explain like I am five');

  const topics = [
    'AI tools', 'AI agents', 'Automation', 'Content creation', 'Research',
    'Product building', 'Coding', 'Recruitment', 'Career growth',
    'Business ideas', 'Productivity', 'Other'
  ];

  const handleInterestToggle = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(selectedInterests.filter(x => x !== topic));
    } else {
      setSelectedInterests([...selectedInterests, topic]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const initialProfile: Partial<Profile> & { id: string } = {
        id: userId,
        full_name: fullName.trim() || 'Excited Learner',
        learning_goals: learningGoals.trim() || 'Learn how to utilize AI for automated workflows.',
        experience_level: experienceLevel,
        main_device: mainDevice,
        coding_knowledge: codingKnowledge,
        interests: selectedInterests.length > 0 ? selectedInterests : ['AI tools', 'Automation'],
        current_projects: currentProjects.trim() || 'Exploring useful AI products.',
        preferred_explanation_style: preferredStyle,
        weekly_learning_time: weeklyLearningTime,
        onboarding_completed: true,
      };

      const completed = await dbService.updateProfile(initialProfile);
      onOnboardingComplete(completed);
    } catch (error) {
      console.error('Onboarding failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
    else handleSubmit();
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const progressPercent = (step / 4) * 100;

  return (
    <div id="onboarding-flow" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden flex flex-col min-h-[500px]">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <motion.div
            className="h-full bg-slate-900"
            initial={{ width: '25%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content Container */}
        <div className="p-6 sm:p-8 flex-grow flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-white rounded-full text-[10px] font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3 text-emerald-400" /> Welcome aboard
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Let's set up your Learning Vault</h2>
                <p className="text-slate-500 text-xs">
                  We customize explanations, relevance scores, and experiments based on your specific profile. Let's start with the basics!
                </p>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">What is your full name?</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Rohini Singh"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Explanation Style (We default to ELI5!)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Explain like I am five', 'Beginner', 'Standard', 'Detailed'] as const).map((style) => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => setPreferredStyle(style)}
                          className={`p-3 text-xs border rounded-xl font-medium transition-all text-left flex justify-between items-center ${
                            preferredStyle === style
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <span>{style}</span>
                          {preferredStyle === style && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-semibold tracking-wide uppercase">
                  <GraduationCap className="w-3.5 h-3.5" /> Experience Profile
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your technical background</h2>
                <p className="text-slate-500 text-xs">
                  Be completely honest! AI Learning Vault is custom-crafted to accommodate complete programming beginners.
                </p>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">AI Experience Level</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['Complete beginner', 'Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setExperienceLevel(level)}
                          className={`p-3 text-xs border rounded-xl font-medium transition-all text-left flex justify-between items-center ${
                            experienceLevel === level
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <span>{level}</span>
                          {experienceLevel === level && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Do you know how to write code?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Yes', 'No', 'A little'] as const).map((choice) => (
                        <button
                          key={choice}
                          type="button"
                          onClick={() => setCodingKnowledge(choice)}
                          className={`p-3 text-xs border rounded-xl font-medium text-center transition-all ${
                            codingKnowledge === choice
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {choice}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Which device do you mostly use?</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Phone', 'Computer', 'Both'] as const).map((device) => (
                        <button
                          key={device}
                          type="button"
                          onClick={() => setMainDevice(device as Profile['main_device'])}
                          className={`p-3 text-xs border rounded-xl font-medium text-center transition-all ${
                            mainDevice === device
                              ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          {device}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-3"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-semibold tracking-wide uppercase">
                  <BookOpen className="w-3.5 h-3.5" /> Core Interests
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Select your AI interests</h2>
                <p className="text-slate-500 text-xs">
                  We use these choices to flag saved videos with custom learning matches. Pick as many as you like!
                </p>

                <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pt-2 pr-1">
                  {topics.map((topic) => {
                    const isSelected = selectedInterests.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => handleInterestToggle(topic)}
                        className={`p-2.5 text-xs border rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-600'
                        }`}
                      >
                        <span>{topic}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                className="space-y-4"
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-[10px] font-semibold tracking-wide uppercase">
                  <Watch className="w-3.5 h-3.5" /> Action Plan
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Your goals & current ideas</h2>
                <p className="text-slate-500 text-xs">
                  What are you hoping to build or automate? We evaluate saved transcript recommendations against this description!
                </p>

                <div className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">What is your main AI learning goal?</label>
                    <textarea
                      value={learningGoals}
                      onChange={(e) => setLearningGoals(e.target.value)}
                      placeholder="e.g. I want to build simple automation bots to free up 5 hours of manual writing every week."
                      rows={2}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">What project or tasks are you currently working on?</label>
                    <textarea
                      value={currentProjects}
                      onChange={(e) => setCurrentProjects(e.target.value)}
                      placeholder="e.g. Building an online resume agency, or automating client booking schedules."
                      rows={2}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-semibold text-slate-700">How many hours a week can you spend?</label>
                      <span className="text-xs font-bold text-slate-900">{weeklyLearningTime} hours</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={15}
                      value={weeklyLearningTime}
                      onChange={(e) => setWeeklyLearningTime(parseInt(e.target.value))}
                      className="w-full accent-slate-900 bg-slate-100 rounded-lg h-1.5 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 px-1 mt-1">
                      <span>1 hr</span>
                      <span>5 hrs</span>
                      <span>10 hrs</span>
                      <span>15+ hrs</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav Buttons */}
          <div className="mt-8 flex justify-between items-center gap-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                className="px-5 py-2.5 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={loading}
              onClick={nextStep}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 ml-auto"
            >
              <span>{loading ? 'Setting up...' : step === 4 ? 'Build My Vault' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
