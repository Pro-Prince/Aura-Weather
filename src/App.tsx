/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search } from 'lucide-react';
import { GlassCard } from './components/GlassCard';

export default function App() {
  return (
    <div className="min-h-screen w-full flex justify-center bg-gradient-to-br from-slate-900 to-slate-950 text-slate-100 overflow-x-hidden relative p-4 sm:p-6 md:p-8">
      {/* Subtle glassmorphic decorative elements */}
      <div className="fixed top-1/4 -left-1/4 md:left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="fixed bottom-1/4 -right-1/4 md:right-1/4 w-[28rem] h-[28rem] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content Layout */}
      <div className="relative z-10 w-full max-w-md flex flex-col space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between py-2">
          <h1 className="text-2xl font-light tracking-wide text-slate-50 drop-shadow-sm">
            Aura Weather
          </h1>
          <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <Search className="w-5 h-5 text-slate-200" />
          </button>
        </header>

        {/* Current Conditions Hero */}
        <GlassCard className="p-6 flex flex-col items-center justify-center space-y-6 min-h-[300px]">
          {/* Skeleton placeholders */}
          <div className="w-32 h-32 rounded-full bg-white/10 animate-pulse" />
          <div className="flex flex-col items-center space-y-3 w-full">
            <div className="w-24 h-12 rounded-xl bg-white/10 animate-pulse" />
            <div className="w-40 h-6 rounded-lg bg-white/10 animate-pulse" />
          </div>
          <div className="flex w-full justify-between pt-4 border-t border-white/10">
            <div className="w-16 h-10 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-16 h-10 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-16 h-10 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </GlassCard>

        {/* Hourly Forecast */}
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-slate-300 px-1 uppercase tracking-wider">Hourly</h2>
          <div className="flex space-x-3 overflow-x-auto pb-4 pt-1 snap-x hide-scrollbar">
            {[...Array(6)].map((_, i) => (
              <GlassCard key={i} className="min-w-[80px] p-4 flex flex-col items-center space-y-3 snap-start shrink-0">
                <div className="w-8 h-4 rounded bg-white/10 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                <div className="w-8 h-4 rounded bg-white/10 animate-pulse" />
              </GlassCard>
            ))}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="space-y-3 pb-8">
          <h2 className="text-sm font-medium text-slate-300 px-1 uppercase tracking-wider">7-Day Forecast</h2>
          <GlassCard className="p-4 flex flex-col space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="flex items-center justify-between w-full">
                <div className="w-12 h-5 rounded bg-white/10 animate-pulse" />
                <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
                <div className="flex space-x-2">
                  <div className="w-8 h-5 rounded bg-white/10 animate-pulse" />
                  <div className="w-8 h-5 rounded bg-white/10 animate-pulse" />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
