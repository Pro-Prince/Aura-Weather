import { GlassCard } from './GlassCard';

export function HeroSkeleton() {
  return (
    <GlassCard className="p-6">
      <div className="flex flex-col items-center justify-center pt-2 pb-4 space-y-4">
        <div className="flex items-center justify-center space-x-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/10 animate-pulse" />
          <div className="flex flex-col space-y-3">
             <div className="w-32 h-16 sm:w-40 sm:h-20 bg-white/10 rounded-xl animate-pulse" />
             <div className="w-24 h-5 bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full border-t border-white/10 pt-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-16 h-4 bg-white/10 rounded animate-pulse mb-2" />
            <div className="w-12 h-6 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function AQIUVSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {[...Array(2)].map((_, i) => (
        <GlassCard key={i} className="p-4 flex flex-col justify-between space-y-3">
          <div className="w-20 h-4 bg-white/10 rounded animate-pulse" />
          <div className="w-12 h-8 bg-white/10 rounded animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-full h-1.5 bg-white/10 rounded-full animate-pulse" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export function HourlySkeleton() {
  return (
    <div className="space-y-3">
      <div className="w-24 h-4 bg-white/10 rounded animate-pulse ml-1" />
      <GlassCard className="p-4 flex space-x-4 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex flex-col items-center space-y-3 min-w-[4rem]">
            <div className="w-10 h-4 bg-white/10 rounded animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            <div className="w-8 h-6 bg-white/10 rounded animate-pulse" />
            <div className="w-8 h-3 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </GlassCard>
    </div>
  );
}

export function DailySkeleton() {
  return (
    <div className="space-y-3 pb-8">
      <div className="w-24 h-4 bg-white/10 rounded animate-pulse ml-1" />
      <GlassCard className="p-4 flex flex-col space-y-4">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center justify-between w-full">
            <div className="w-12 h-5 rounded bg-white/10 animate-pulse" />
            <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
            <div className="flex space-x-2">
              <div className="w-8 h-5 rounded bg-white/10 animate-pulse" />
              <div className="w-24 h-1.5 rounded-full bg-white/10 animate-pulse mt-2" />
              <div className="w-8 h-5 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
