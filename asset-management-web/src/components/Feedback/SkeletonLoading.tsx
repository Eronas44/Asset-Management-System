import React from 'react';

export const SkeletonTable: React.FC = () => {
  return (
    <div className="w-full space-y-2.5 mt-4">
      <div className="h-9 w-full rounded-md bg-slate-100 dark:bg-slate-800 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-7 flex-1 rounded bg-slate-50 dark:bg-slate-850 animate-pulse" />
          <div className="h-7 flex-[2] rounded bg-slate-50 dark:bg-slate-850 animate-pulse" />
          <div className="h-7 flex-1 rounded bg-slate-50 dark:bg-slate-850 animate-pulse" />
        </div>
      ))}
    </div>
  );
};
