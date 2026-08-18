'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es">
      <body className="antialiased bg-[#030712] text-white min-h-screen flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0b0f19] p-8 text-center space-y-6">
          <div className="flex h-12 w-12 mx-auto items-center justify-center rounded-xl bg-red-950/60 text-red-400 border border-red-500/20 text-xl font-bold">
            !
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-white">Error Crítico del Sistema</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ocurrió un error grave en la carga inicial de la aplicación.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
          >
            Reintentar Aplicación
          </button>
        </div>
      </body>
    </html>
  );
}
