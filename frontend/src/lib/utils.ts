import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | null | undefined,
  currency: string = 'USD',
  compact: boolean = false
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (!Number.isFinite(numericAmount) || isNaN(numericAmount)) {
    return '$0';
  }

  if (compact && Math.abs(numericAmount) >= 1_000_000) {
    return `$${(numericAmount / 1_000_000).toFixed(1)}M`;
  }
  if (compact && Math.abs(numericAmount) >= 1_000) {
    return `$${(numericAmount / 1_000).toFixed(0)}k`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: numericAmount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(numericAmount);
}

export function formatNumber(num: number | string | null | undefined): string {
  const n = typeof num === 'string' ? parseFloat(num) : (num ?? 0);
  if (!Number.isFinite(n) || isNaN(n)) return '0';
  return new Intl.NumberFormat('es-ES').format(n);
}

export function calculatePercentage(raised: number | string | null | undefined, goal: number | string | null | undefined): number {
  const r = typeof raised === 'string' ? parseFloat(raised) : (raised ?? 0);
  const g = typeof goal === 'string' ? parseFloat(goal) : (goal ?? 1);
  if (!Number.isFinite(r) || !Number.isFinite(g) || g <= 0) return 0;
  return Math.min(Math.round((r / g) * 100), 100);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'Fecha no disponible';
  const d = new Date(date);
  if (isNaN(d.getTime())) return 'Fecha inválida';
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

