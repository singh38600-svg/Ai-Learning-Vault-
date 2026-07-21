/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import ProfileSettings from './ProfileSettings';
import AISettings from './AISettings';
import { Settings as SettingsIcon, User, Key } from 'lucide-react';
import { Profile } from '../types';

interface SettingsProps {
  userId: string;
  profile: Profile;
  onProfileUpdate: (updated: Profile) => void;
}

export default function Settings({ userId, profile, onProfileUpdate }: SettingsProps) {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'keys'>('profile');

  return (
    <div id="settings-view" className="space-y-6 max-w-3xl mx-auto">
      
      {/* Tab select slider */}
      <div className="border-b border-slate-200 flex gap-1 bg-slate-100 p-1 rounded-xl">
        <button
          onClick={() => setActiveSubTab('profile')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <User className="w-4 h-4 text-emerald-600" />
          <span>My Learning Profile</span>
        </button>
        
        <button
          onClick={() => setActiveSubTab('keys')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'keys' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Key className="w-4 h-4 text-indigo-600" />
          <span>AI API Credentials</span>
        </button>
      </div>

      {/* Render selected settings panel */}
      <div>
        {activeSubTab === 'profile' ? (
          <ProfileSettings
            userId={userId}
            profile={profile}
            onProfileUpdate={onProfileUpdate}
          />
        ) : (
          <AISettings userId={userId} />
        )}
      </div>

    </div>
  );
}
