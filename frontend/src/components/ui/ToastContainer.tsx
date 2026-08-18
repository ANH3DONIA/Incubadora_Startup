'use client';

import React from 'react';
import { useToastStore, ToastItem } from '@/store/toastStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: 'bg-white dark:bg-[#0b0f19] border-emerald-500/30 text-emerald-950 dark:text-emerald-200',
  error: 'bg-white dark:bg-[#0b0f19] border-red-500/30 text-red-950 dark:text-red-200',
  info: 'bg-white dark:bg-[#0b0f19] border-blue-500/30 text-blue-950 dark:text-blue-200',
  warning: 'bg-white dark:bg-[#0b0f19] border-amber-500/30 text-amber-950 dark:text-amber-200',
};

const iconColors = {
  success: 'text-emerald-500',
  error: 'text-red-500',
  info: 'text-blue-500',
  warning: 'text-amber-500',
};

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast: ToastItem) => {
        const Icon = icons[toast.type];
        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 backdrop-blur-md transition-all duration-300 animate-fade-in ${styles[toast.type]}`}
          >
            <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
            <div className="flex-1 space-y-0.5">
              {toast.title && (
                <p className="text-xs font-bold leading-tight">{toast.title}</p>
              )}
              <p className="text-xs font-medium opacity-90 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 transition"
              aria-label="Cerrar notificación"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
