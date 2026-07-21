/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { dbService } from './lib/databaseService';
import { Profile, KnowledgeItem } from './types';

// Import sub-views
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Layout, { TabType } from './components/Layout';
import Dashboard from './components/Dashboard';
import AddItem from './components/AddItem';
import Inbox from './components/Inbox';
import Library from './components/Library';
import ExperimentLog from './components/ExperimentLog';
import ProductIdeaGenerator from './components/ProductIdeaGenerator';
import Settings from './components/Settings';
import CompareTools from './components/CompareTools';

export default function App() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Router / Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [compareItems, setCompareItems] = useState<KnowledgeItem[] | null>(null);

  const isOffline = dbService.isOfflineMode();

  // Try loading current active session on mount
  useEffect(() => {
    async function checkSession() {
      try {
        const currentUser = await dbService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await dbService.getProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Session loading failed:', err);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleAuthSuccess = async (authUser: { id: string; email: string }) => {
    setUser(authUser);
    setLoading(true);
    try {
      const userProfile = await dbService.getProfile(authUser.id);
      setProfile(userProfile);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  const handleLogout = () => {
    dbService.logout();
    setUser(null);
    setProfile(null);
    setActiveTab('dashboard');
    setSelectedItemId(null);
    setCompareItems(null);
  };

  if (loading) {
    return (
      <div id="app-loading" className="min-h-screen bg-slate-50 flex flex-col justify-center items-center space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 text-xs font-semibold font-mono">Initializing AI Learning Vault...</p>
      </div>
    );
  }

  // 1. Authentication screen if no session
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  // 2. Onboarding wizard if profile is incomplete
  if (!profile || !profile.onboarding_completed) {
    return (
      <Onboarding
        userId={user.id}
        onOnboardingComplete={handleOnboardingComplete}
      />
    );
  }

  // Trigger analysis navigation
  const handleAnalysisSuccess = (newItem: KnowledgeItem) => {
    setActiveTab('inbox');
  };

  // Trigger side-by-side comparison layout
  const handleCompareTrigger = (selectedTools: KnowledgeItem[]) => {
    setCompareItems(selectedTools);
  };

  const handleBackFromCompare = () => {
    setCompareItems(null);
  };

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setSelectedItemId(null); // Clear detail view on tab switch
        setCompareItems(null);   // Clear compare matrix on tab switch
      }}
      profile={profile}
      onLogout={handleLogout}
      isOffline={isOffline}
    >
      {/* 3. Side-by-side comparison sub-route */}
      {compareItems ? (
        <CompareTools
          items={compareItems}
          profile={profile}
          onBack={handleBackFromCompare}
          setActiveTab={setActiveTab}
        />
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <Dashboard
              userId={user.id}
              setActiveTab={setActiveTab}
              setSelectedItemId={setSelectedItemId}
              profile={profile}
            />
          )}

          {activeTab === 'add' && (
            <AddItem
              userId={user.id}
              profile={profile}
              onAnalysisSuccess={handleAnalysisSuccess}
            />
          )}

          {activeTab === 'inbox' && (
            <Inbox
              userId={user.id}
              onDecisionComplete={() => {}}
              setSelectedItemId={setSelectedItemId}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'library' && (
            <Library
              userId={user.id}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              onCompareTrigger={handleCompareTrigger}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          )}

          {/* Both Actions & Experiments resolve to the combined log engine */}
          {(activeTab === 'actions' || activeTab === 'experiments') && (
            <ExperimentLog
              userId={user.id}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'ideas' && (
            <ProductIdeaGenerator
              userId={user.id}
            />
          )}

          {activeTab === 'settings' && (
            <Settings
              userId={user.id}
              profile={profile}
              onProfileUpdate={setProfile}
            />
          )}
        </>
      )}
    </Layout>
  );
}
