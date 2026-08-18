'use client';

import React from 'react';
import { Timer, AlertTriangle } from 'lucide-react';

interface PitchTimerProps {
  remainingSeconds: number;
  isWarning?: boolean;
  isActive?: boolean;
}

export const PitchTimer: React.FC<PitchTimerProps> = ({
  remainingSeconds,
  isWarning = false,
  isActive = false,
}) => {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = remainingSeconds <= 30 && isActive;

  return (
    <div
      className={`flex items-center gap-2.5 rounded-xl px-4 py-2 border transition-all ${
        isCritical
          ? 'bg-red-600 border-red-500 text-white animate-pulse'
          : isWarning
          ? 'bg-amber-500 border-amber-400 text-white'
          : 'bg-[#0b0f19]/90 border-slate-800 text-white backdrop-blur'
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5 animate-bounce" />
      ) : (
        <Timer className="h-5 w-5 text-blue-400" />
      )}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
          {isActive ? 'Pitch en Vivo' : 'Tiempo Restante'}
        </span>
        <span className="font-mono text-xl font-bold tracking-tight">{formatted}</span>
      </div>
    </div>
  );
};
