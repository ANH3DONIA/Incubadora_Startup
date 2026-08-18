import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mb-4 border border-blue-500/20">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
        Página no encontrada
      </p>
      <p className="text-xs text-slate-400 max-w-sm mt-1">
        El recurso que buscas no existe o ha sido movido en la plataforma.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Inicio</span>
      </Link>
    </div>
  );
}
