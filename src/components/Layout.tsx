/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import {
  Sparkles,
  PlusCircle,
  Inbox,
  Library,
  Flame,
  FlaskConical,
  Lightbulb,
  Settings,
  LogOut,
  Database,
  Menu,
  X
} from 'lucide-react';
import { Profile } from '../types';

export type TabType = 'dashboard' | 'add' | 'inbox' | 'library' | 'actions' | 'experiments' | 'ideas' | 'settings';

interface LayoutProps {
  children: ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  profile: Profile | null;
  onLogout: () => void;
  isOffline: boolean;
}

export default function Layout({
  children,
  activeTab,
  setActiveTab,
  profile,
  onLogout,
  isOffline
}: LayoutProps) {

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Flame },
    { id: 'add', label: 'Add', icon: PlusCircle },
    { id: 'library', label: 'Saved Lessons', icon: Library },
    { id: 'experiments', label: 'Try Next', icon: FlaskConical },
    { id: 'settings', label: 'Profile', icon: Settings },
  ] as const;

  return (
    <div id="vault-layout" className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row pb-16 md:pb-0 font-sans text-slate-800">
      
      {/* Desktop Sidebar Navigation */}
      <aside className="hidden md:flex flex-col w-64 bg-white text-slate-700 border-r border-slate-200 shrink-0 sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
            <Flame className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none">Learning Vault</h1>
            <span className="text-[9px] text-slate-400 mt-0.5 block font-mono">Clean Minimalism</span>
          </div>
        </div>

        {/* User Quick Profile Info */}
        {profile && (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shadow-sm">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-800 truncate">{profile.full_name}</p>
              <p className="text-[10px] text-slate-500 truncate font-mono">{profile.experience_level}</p>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-slate-100 text-indigo-700 font-semibold shadow-sm'
                    : 'hover:bg-slate-50 hover:text-slate-950 text-slate-600'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 space-y-3">
          {/* System status block */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">AI Status</p>
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.6)] ${isOffline ? 'bg-amber-500' : 'bg-indigo-600'}`}></div>
              <p className="text-xs font-medium text-slate-700 truncate">
                {isOffline ? 'Local Sandbox' : 'Supabase Live'}
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-50 hover:text-rose-600 text-slate-500 rounded-xl text-xs font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sticky Header */}
      <header className="md:hidden bg-white border-b border-slate-200 text-slate-800 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold tracking-tight text-slate-900">Learning Vault</span>
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
              {profile.full_name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 max-w-7xl mx-auto px-5 py-5 md:py-8 md:px-8">
        
        {/* Active view rendering */}
        <div className="flex-grow">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Rail */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg px-2 py-2.5 flex justify-around items-center z-40 select-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 min-h-[48px]"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-slate-100 text-indigo-700 px-3' : 'text-slate-500'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium mt-1 ${isActive ? 'text-indigo-700 font-bold' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
      
    </div>
  );
}
