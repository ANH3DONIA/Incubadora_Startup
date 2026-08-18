'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Users, Building2, Video, DollarSign, Shield, ArrowRight } from 'lucide-react';

import { AdminUserItem, AuditLogEntry } from '@/types/dashboard';

interface AdminDashboardData {
  stats?: {
    totalUsers: number;
    totalStartups: number;
    totalPitches: number;
    totalInvested: number;
  };
  recentUsers?: AdminUserItem[];
  recentAuditLogs?: AuditLogEntry[];
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setData(res.data.data);
      } catch (err) {
        console.error('Error fetching admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Cargando panel de administración..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de Control de Administrador</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supervisa usuarios, transacciones y registros de seguridad</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Usuarios"
          value={data?.stats?.totalUsers || 0}
          icon={Users}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Startups en Plataforma"
          value={data?.stats?.totalStartups || 0}
          icon={Building2}
          iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          title="Sesiones de Pitch"
          value={data?.stats?.totalPitches || 0}
          icon={Video}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Volumen Invertido"
          value={formatCurrency(data?.stats?.totalInvested || 0)}
          icon={DollarSign}
          iconBg="bg-slate-100 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200"
        />
      </div>

      {/* Recent Users & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Users */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Usuarios Registrados Recientes
            </h3>
            <Link href="/admin/users" className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Ver todos
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {data?.recentUsers?.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</p>
                </div>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Actividad de Seguridad Reciente
            </h3>
            <Link href="/admin/audit" className="text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Ver logs completos
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
            {data?.recentAuditLogs?.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-xs">{log.action}</p>
                  <p className="text-[10px] text-slate-400">{log.user?.email || 'Sistema / Anónimo'}</p>
                </div>
                <span className="text-slate-400 text-[10px]">{formatDate(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
