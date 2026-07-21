/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Key, Shield } from 'lucide-react';
import { motion } from 'motion/react';

export default function AISettings() {
  return (
    <div id="ai-settings-block" className="max-w-xl mx-auto space-y-6 py-4">
      {/* Title */}
      <div className="space-y-1 text-center md:text-left">
        <h3 className="text-xs font-bold text-slate-400 uppercase font-mono tracking-widest flex items-center justify-center md:justify-start gap-1.5">
          <Key className="w-4 h-4 text-indigo-600" />
          <span>API Settings</span>
        </h3>
        <p className="text-slate-500 text-xs font-medium">
          Configure external models and developer endpoints for customized processing.
        </p>
      </div>

      {/* Disabled/Coming Soon Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 text-center space-y-4 shadow-sm"
      >
        <div className="mx-auto w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-2 max-w-sm mx-auto">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Custom Providers Coming Soon</h4>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Custom AI providers are coming later. This personal MVP currently uses the securely configured workspace Gemini key.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
