'use client';

import React from 'react';
import { Video, Mic, ShieldCheck, Play } from 'lucide-react';

interface WaitingRoomProps {
  title: string;
  startupName?: string;
  isHost: boolean;
  onJoin: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  title,
  startupName,
  isHost,
  onJoin,
}) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center shadow-2xl space-y-6">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-teal-600/20 text-teal-400">
          <Video className="h-8 w-8" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-400">
            Sala de Pitch Preparada
          </span>
          <h2 className="text-xl font-bold mt-1 text-white">{title}</h2>
          {startupName && (
            <p className="text-xs text-slate-400 mt-1">Presentado por {startupName}</p>
          )}
        </div>

        <div className="rounded-2xl bg-slate-800/60 p-4 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Cifrado de extremo a extremo activo</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mic className="h-4 w-4" />
            <span>Micrófono y cámara listos</span>
          </div>
        </div>

        <button
          onClick={onJoin}
          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-sm font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-600/30 transition"
        >
          <Play className="h-4 w-4" />
          <span>{isHost ? 'Iniciar y Abrir Sala' : 'Entrar a la Sala de Pitch'}</span>
        </button>
      </div>
    </div>
  );
};
