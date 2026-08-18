'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import {
  Video,
  Plus,
  Play,
  Calendar,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Ban,
  Check,
  Copy,
  ExternalLink,
  Sparkles,
  X,
} from 'lucide-react';

export default function PitchSessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New pitch form
  const [title, setTitle] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const { data } = await api.get('/startups/my');
      setStartup(data.data);
      if (data.data) {
        // Fetch startup pitches directly from /pitches/my or startup object
        const pitchesRes = await api.get('/pitches/my').catch(() => ({ data: { data: data.data.pitchSessions || [] } }));
        setSessions(pitchesRes.data.data || data.data.pitchSessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getMinDateTime = () => {
    const now = new Date(Date.now() + 2 * 60 * 1000);
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!startup) return;

    const chosenDate = new Date(scheduledFor);
    if (isNaN(chosenDate.getTime())) {
      setFormError('Por favor selecciona una fecha y hora válidas.');
      return;
    }

    if (chosenDate.getTime() <= Date.now()) {
      setFormError('La fecha y hora deben ser futuras. No se pueden programar sesiones en el pasado.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/pitches', {
        startupId: startup.id,
        title: title.trim(),
        scheduledFor: chosenDate.toISOString(),
        durationMinutes,
      });

      setTitle('');
      setScheduledFor('');
      setModalOpen(false);
      setActionMessage({ type: 'success', text: '¡Sesión de pitch creada exitosamente con su sala virtual!' });
      await fetchData();
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          (err.response?.data?.errors && err.response.data.errors[0]?.message) ||
          'Error al programar la sesión de pitch.'
      );
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateStatus = async (sessionId: string, newStatus: 'COMPLETED' | 'CANCELLED') => {
    try {
      await api.patch(`/pitches/${sessionId}/status`, { status: newStatus });
      setActionMessage({
        type: 'success',
        text: `Estado actualizado a ${newStatus === 'COMPLETED' ? 'Finalizado' : 'Cancelado'}.`,
      });
      await fetchData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al actualizar el estado.',
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta sesión de pitch?')) return;

    try {
      await api.delete(`/pitches/${sessionId}`);
      setActionMessage({ type: 'success', text: 'Sesión de pitch eliminada exitosamente.' });
      await fetchData();
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al eliminar la sesión.',
      });
    }
  };

  const handleCopyLink = (roomId: string) => {
    const url = `${window.location.origin}/pitch-room/${roomId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(roomId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) return <LoadingSpinner size="lg" label="Cargando sesiones de pitch..." />;

  const filteredSessions = sessions.filter((s) => {
    if (statusFilter === 'ALL') return true;
    return s.status === statusFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LIVE':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 animate-pulse';
      case 'SCHEDULED':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'COMPLETED':
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
      case 'CANCELLED':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              Gestión de Eventos en Vivo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            Mis Sesiones de Pitch
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Crea, administra, abre o concluye salas de presentación en vivo ante inversores
          </p>
        </div>

        {startup && (
          <button
            onClick={() => {
              setFormError(null);
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition self-start sm:self-auto hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4" />
            <span>Programar Nuevo Pitch</span>
          </button>
        )}
      </div>

      {actionMessage && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border ${
            actionMessage.type === 'success'
              ? 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
              : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        {[
          { key: 'ALL', label: `Todos (${sessions.length})` },
          { key: 'SCHEDULED', label: `Programados (${sessions.filter((s) => s.status === 'SCHEDULED').length})` },
          { key: 'LIVE', label: `En Vivo (${sessions.filter((s) => s.status === 'LIVE').length})` },
          { key: 'COMPLETED', label: `Finalizados (${sessions.filter((s) => s.status === 'COMPLETED').length})` },
          { key: 'CANCELLED', label: `Cancelados (${sessions.filter((s) => s.status === 'CANCELLED').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key as any)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              statusFilter === tab.key
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!startup ? (
        <EmptyState
          title="Primero registra tu startup"
          description="Debes crear el perfil de tu empresa antes de poder habilitar las sesiones de pitch."
          action={
            <Link
              href="/my-startup"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Registrar Mi Startup
            </Link>
          }
        />
      ) : filteredSessions.length === 0 ? (
        <EmptyState
          title="No hay sesiones en esta categoría"
          description="No se encontraron pitches bajo el filtro actual. Puedes programar una nueva sesión en cualquier momento."
          action={
            <button
              onClick={() => {
                setFormError(null);
                setModalOpen(true);
              }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500"
            >
              Programar Quick Pitch
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSessions.map((session) => {
            const roomId = session.room?.id || session.id;
            return (
              <div
                key={session.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0b0f19] transition-all space-y-5"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold border ${getStatusBadge(session.status)}`}>
                      {session.status}
                    </span>
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {session.durationMinutes} min
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">
                    {session.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    {formatDate(session.scheduledFor)}
                  </p>
                </div>

                {/* Actions Grid */}
                <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3.5">
                  {/* Primary Link to Live Room */}
                  <Link
                    href={`/pitch-room/${roomId}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Entrar a la Sala Virtual</span>
                  </Link>

                  {/* Secondary Utilities: Copy Link, Conclude, Cancel, Delete */}
                  <div className="grid grid-cols-4 gap-1.5">
                    <button
                      onClick={() => handleCopyLink(roomId)}
                      title="Copiar enlace de invitación"
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                    >
                      {copiedId === roomId ? <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>

                    {session.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'COMPLETED')}
                        title="Marcar como Concluido"
                        className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                      </button>
                    )}

                    {session.status !== 'CANCELLED' && (
                      <button
                        onClick={() => handleUpdateStatus(session.id, 'CANCELLED')}
                        title="Cancelar Pitch"
                        className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-400 transition"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      title="Eliminar Pitch"
                      className="flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-slate-700 dark:bg-slate-800 dark:text-red-400 transition col-start-4"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Schedule Pitch Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Programar Quick Pitch</h3>
                <p className="text-xs text-slate-400">Configura la sala interactiva para inversores</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal de pitch"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300 border border-red-500/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Título de la Sesión
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Demo Day - Presentación Ronda Semilla"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Fecha y Hora Programada
                </label>
                <input
                  type="datetime-local"
                  required
                  min={getMinDateTime()}
                  value={scheduledFor}
                  onChange={(e) => {
                    setScheduledFor(e.target.value);
                    setFormError(null);
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <p className="text-[10px] text-slate-400">Debe ser al menos 2 minutos en el futuro.</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Duración del Pitch
                </label>
                <select
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value={5}>5 minutos (Quick Pitch estándar)</option>
                  <option value={10}>10 minutos</option>
                  <option value={15}>15 minutos (Pitch + Preguntas)</option>
                  <option value={30}>30 minutos (Ronda extendida)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition mt-2"
              >
                {creating ? 'Generando Sala y Programando...' : 'Programar y Crear Sala Virtual'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

