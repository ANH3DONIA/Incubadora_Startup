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
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#030712] px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b0f19] p-8 text-center space-y-6">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
          <Video className="h-7 w-7" />
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
            Sala de Pitch Preparada
          </span>
          <h2 className="text-xl font-bold mt-1 text-white">{title}</h2>
          {startupName && (
            <p className="text-xs text-slate-400 mt-1">Presentado por {startupName}</p>
          )}
        </div>

        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 text-left space-y-2 text-xs text-slate-300">
          <div className="flex items-center gap-2 text-blue-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Cifrado y autenticación JWT activos</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Mic className="h-4 w-4" />
            <span>Dispositivos de audio y video listos</span>
          </div>
        </div>

        <button
          onClick={onJoin}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-500 transition"
        >
          <Play className="h-4 w-4" />
          <span>{isHost ? 'Iniciar y Abrir Sala' : 'Entrar a la Sala de Pitch'}</span>
        </button>
      </div>
    </div>
  );
};
