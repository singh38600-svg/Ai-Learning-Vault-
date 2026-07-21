/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { dbService } from '../lib/databaseService';
import { LogIn, Key, Mail, ShieldAlert, Sparkles, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthProps {
  onAuthSuccess: (user: { id: string; email: string }) => void;
}

export default function Auth({ onAuthSuccess }: AuthProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOffline = dbService.isOfflineMode();

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      if (isOffline) {
        // Mock Auth login/signup
        const res = await dbService.login(email);
        if (res.data?.user) {
          onAuthSuccess(res.data.user);
        } else {
          setError('Login failed');
        }
      } else {
        // Real Supabase Auth
        const { data, error: authError } = isSignUp
          ? await dbService.login(email) // Simulated helper
          : await dbService.login(email);

        if (authError) {
          setError(authError.message || 'Authentication failed.');
        } else if (data?.user) {
          onAuthSuccess(data.user);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await dbService.login('demo@example.com');
      if (res.data?.user) {
        onAuthSuccess(res.data.user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="auth-page" className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 overflow-hidden"
      >
        {/* Banner Section */}
        <div className="bg-slate-900 text-white px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl"></div>
          
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl mb-3">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AI Learning Vault</h1>
          <p className="text-slate-400 text-xs mt-1 px-4">
            Turn saved AI reels and tutorials into real-life experiments and micro-products
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {isOffline && (
            <div className="mb-6 p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-start gap-3">
              <Key className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-semibold text-emerald-800">Demo Mode Active</h4>
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  The database is running client-side using browser storage. All features are fully interactive!
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base md:text-sm focus:outline-none focus:border-slate-400 focus:bg-white transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSignUp ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              {loading ? 'Please wait...' : isSignUp ? 'Create Vault Account' : 'Sign In to Vault'}
            </button>
          </form>

          {/* Guest Direct Entry Option */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100"
            >
              <Sparkles className="w-4 h-4" />
              One-Click Demo Guest Sign In
            </button>
            <p className="text-center text-[10px] text-slate-400 mt-2">
              Highly recommended for testing immediately without registration!
            </p>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
