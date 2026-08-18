'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Shield, FileText } from 'lucide-react';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get('/admin/audit-logs');
        setLogs(res.data.data || []);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) return <LoadingSpinner size="lg" label="Cargando logs de auditoría..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Auditoría & Seguridad Inmutable</h1>
        <p className="text-xs text-slate-500 mt-1">Registro de cada mutación, payload, IP y código de respuesta HTTP</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="border-b border-slate-100 bg-slate-50 uppercase text-[10px] font-bold text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="p-4">Timestamp</th>
                <th className="p-4">Método & Ruta</th>
                <th className="p-4">Usuario</th>
                <th className="p-4">IP Address</th>
                <th className="p-4">Status</th>
                <th className="p-4">Payload Sanitizado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="p-4 text-slate-400 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                  <td className="p-4 font-bold text-slate-900 dark:text-white">
                    <span className={`px-1.5 py-0.5 rounded mr-1.5 text-[10px] ${
                      log.method === 'POST' ? 'bg-emerald-100 text-emerald-800' :
                      log.method === 'PUT' || log.method === 'PATCH' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.method || 'ACTION'}
                    </span>
                    {log.path || log.action}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {log.user?.email || 'ANONYMOUS'}
                  </td>
                  <td className="p-4 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  <td className="p-4">
                    <span className={`font-bold ${
                      (log.statusCode || 200) < 400 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {log.statusCode || 200}
                    </span>
                  </td>
                  <td className="p-4 text-slate-400 max-w-xs truncate" title={log.requestPayload}>
                    {log.requestPayload || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
