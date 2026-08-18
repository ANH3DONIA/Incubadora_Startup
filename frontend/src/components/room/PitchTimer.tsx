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
      className={`flex items-center gap-2.5 rounded-2xl px-5 py-2.5 shadow-lg border transition-all ${
        isCritical
          ? 'bg-red-600 border-red-500 text-white animate-pulse'
          : isWarning
          ? 'bg-amber-500 border-amber-400 text-white'
          : 'bg-slate-900/90 border-slate-700 text-white backdrop-blur'
      }`}
    >
      {isCritical ? (
        <AlertTriangle className="h-5 w-5 animate-bounce" />
      ) : (
        <Timer className="h-5 w-5 text-teal-400" />
      )}
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold uppercase tracking-wider opacity-80">
          {isActive ? 'Pitch en Vivo' : 'Tiempo de Presentación'}
        </span>
        <span className="font-mono text-2xl font-black tracking-tight">{formatted}</span>
      </div>
    </div>
  );
};
