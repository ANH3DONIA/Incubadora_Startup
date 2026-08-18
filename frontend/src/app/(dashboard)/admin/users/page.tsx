'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatDate } from '@/lib/utils';
import { Users, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { isActive: !currentStatus });
      await fetchUsers();
    } catch (err) {
      alert('Error al actualizar estado del usuario');
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Cargando listado de usuarios..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Gestión de Usuarios</h1>
        <p className="text-xs text-slate-500 mt-1">Control de accesos y estados para todos los miembros registrados</p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/60">
              <tr>
                <th className="p-4">Usuario</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Startup Asociada</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Fecha Registro</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                  <td className="p-4">
                    <p className="font-bold text-slate-900 dark:text-white">{u.firstName} {u.lastName}</p>
                    <p className="text-[11px] text-slate-500">{u.email}</p>
                  </td>
                  <td className="p-4">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-slate-600 dark:text-slate-300">
                    {u.startup?.name || '—'}
                  </td>
                  <td className="p-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5" /> Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-500 font-semibold">
                        <XCircle className="h-3.5 w-3.5" /> Suspendido
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">{formatDate(u.createdAt)}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id, u.isActive)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        u.isActive
                          ? 'border border-red-200 text-red-600 hover:bg-red-50'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {u.isActive ? 'Suspender' : 'Reactivar'}
                    </button>
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
