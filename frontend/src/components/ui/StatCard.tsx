import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  icon: LucideIcon;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  icon: Icon,
  iconBg = 'bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400',
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        {trend && (
          <span className="mt-2 inline-flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>
    </div>
  );
};
