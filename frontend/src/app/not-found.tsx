import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-4">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-2">
        Página no encontrada
      </p>
      <p className="text-xs text-slate-400 max-w-sm mt-1">
        El recurso que buscas no existe o ha sido movido en la plataforma.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-6 py-3 text-xs font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Inicio</span>
      </Link>
    </div>
  );
}
