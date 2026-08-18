'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DollarSign, CreditCard, CheckCircle2, ArrowDownRight } from 'lucide-react';

export default function AdminFinancesPage() {
  const [finances, setFinances] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinances = async () => {
      try {
        const res = await api.get('/admin/finances');
        setFinances(res.data.data);
      } catch (err) {
        console.error('Error fetching finances:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFinances();
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Cargando información financiera..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Finanzas & Desglose de Inversiones</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supervisa flujos fiat (Stripe) y criptoactivos (Binance Pay)</p>
      </div>

      {/* Totals Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <StatCard
          title="Total Procesado"
          value={formatCurrency(finances?.totals?.overall || 0)}
          subtitle="Fiat + Cripto combinados"
          icon={DollarSign}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
        />
        <StatCard
          title="Stripe (Fiat USD)"
          value={formatCurrency(finances?.totals?.fiat || 0)}
          subtitle="Tarjetas de crédito / débito"
          icon={CreditCard}
          iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
        />
        <StatCard
          title="Binance Pay (Cripto)"
          value={formatCurrency(finances?.totals?.crypto || 0, 'USD')}
          subtitle="USDT / Web3 direct"
          icon={DollarSign}
          iconBg="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
        />
      </div>

      {/* Transactions Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden dark:border-slate-800/80 dark:bg-[#0b0f19]">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Historial de Transacciones
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 uppercase text-[10px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
              <tr>
                <th className="p-4">Inversionista</th>
                <th className="p-4">Startup</th>
                <th className="p-4">Monto</th>
                <th className="p-4">Método</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Tx Hash / ID</th>
                <th className="p-4">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(!finances?.transactions || finances.transactions.length === 0) ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No hay transacciones registradas aún.
                  </td>
                </tr>
              ) : (
                finances.transactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {tx.investor?.firstName} {tx.investor?.lastName}
                    </td>
                    <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                      {tx.startup?.name || 'Incubadora'}
                    </td>
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(Number(tx.amount))}
                    </td>
                    <td className="p-4">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                        tx.paymentMethodType === 'FIAT'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {tx.paymentMethodType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {tx.status}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-xs" title={tx.transactionHash}>
                      {tx.transactionHash || '—'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400">{formatDate(tx.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
