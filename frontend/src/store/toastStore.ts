import { create } from 'zustand';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

// Quick utility functions
export const toast = {
  success: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'success', message, title, duration }),
  error: (message: string, title?: string, duration = 5000) =>
    useToastStore.getState().addToast({ type: 'error', message, title, duration }),
  info: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'info', message, title, duration }),
  warning: (message: string, title?: string, duration = 4500) =>
    useToastStore.getState().addToast({ type: 'warning', message, title, duration }),
};
