/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { Profile } from '../types';
import {
  User,
  GraduationCap,
  Sparkles,
  Smartphone,
  Award,
  Check,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { motion } from 'motion/react';

interface ProfileSettingsProps {
  userId: string;
  profile: Profile;
  onProfileUpdate: (updated: Profile) => void;
}

export default function ProfileSettings({ userId, profile, onProfileUpdate }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(profile.full_name);
  const [experienceLevel, setExperienceLevel] = useState(profile.experience_level);
  const [mainDevice, setMainDevice] = useState(profile.main_device);
  const [codingKnowledge, setCodingKnowledge] = useState(profile.coding_knowledge);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(profile.interests || []);
  const [learningGoals, setLearningGoals] = useState(profile.learning_goals || '');
  const [currentProjects, setCurrentProjects] = useState(profile.current_projects || '');
  const [weeklyLearningTime, setWeeklyLearningTime] = useState(profile.weekly_learning_time || 3);

  const [saving, setSaving] = useState(false);

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

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedProfile: Partial<Profile> & { id: string } = {
        id: userId,
        full_name: fullName.trim() || 'Excited Learner',
        experience_level: experienceLevel,
        main_device: mainDevice,
        coding_knowledge: codingKnowledge,
        interests: selectedInterests,
        learning_goals: learningGoals,
        current_projects: currentProjects,
        weekly_learning_time: weeklyLearningTime
      };

      const completed = await dbService.updateProfile(updatedProfile);
      onProfileUpdate(completed);
      alert('Learning profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm('⚠️ WARNING: This will delete all of your current custom saves, content drafts, and experiments, and restore the original pre-seeded lessons. Do you want to proceed?')) {
      localStorage.clear();
      alert('Database successfully reset to seeded demo files! Reloading applet...');
      window.location.reload();
    }
  };

  return (
    <div id="profile-settings-block" className="space-y-6">
      
      {/* Title */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase font-mono tracking-wider flex items-center gap-1.5">
          <User className="w-4 h-4 text-emerald-600" />
          <span>My Learning Profile Settings</span>
        </h3>
        <p className="text-slate-500 text-xs mt-1">
          Adjust your educational variables. AI Learning Vault utilizes these fields to calculate customized match grades and formulate sandbox testing suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Core Profile parameters */}
        <form onSubmit={handleSave} className="md:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">Update Learning Parameters</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white font-bold"
              >
                <option value="Complete beginner">Complete beginner</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Write code?</label>
              <select
                value={codingKnowledge}
                onChange={(e) => setCodingKnowledge(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white font-bold"
              >
                <option value="Yes">Yes, I can write code</option>
                <option value="No">No, I can't write code</option>
                <option value="A little">A little / beginner programmer</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Device</label>
              <select
                value={mainDevice}
                onChange={(e) => setMainDevice(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:bg-white font-bold"
              >
                <option value="Phone">Smart Phone only</option>
                <option value="Computer">Computer / Laptop</option>
                <option value="Both">Both phone & computer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Learning Goals</label>
            <textarea
              value={learningGoals}
              onChange={(e) => setLearningGoals(e.target.value)}
              rows={2}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-slate-400 focus:bg-white transition-all font-semibold resize-none"
            />
          </div>

          {/* Topics checkboxes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">My Topics of Interest</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {topics.map((topic) => {
                const isSelected = selectedInterests.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => handleInterestToggle(topic)}
                    className={`p-2 border rounded-xl text-[10px] font-bold text-left transition-all flex items-center justify-between ${
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
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            {saving ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </form>

        {/* Database reset block */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[9px] font-bold text-slate-400 font-mono uppercase tracking-widest block">System Diagnostics</span>
            
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1">
              <h5 className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" /> Reset Database
              </h5>
              <p className="text-[10px] text-rose-600 font-semibold leading-relaxed">
                Clearing local storage deletes all custom logs, notes, drafts, and resets original seed data. Recommended when testing multiple scenarios!
              </p>
            </div>
          </div>

          <button
            onClick={handleResetDatabase}
            className="w-full py-2.5 border border-rose-200 hover:bg-rose-50 hover:text-rose-700 rounded-xl text-xs font-bold text-rose-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Factory Reset Database</span>
          </button>
        </div>

      </div>

    </div>
  );
}
