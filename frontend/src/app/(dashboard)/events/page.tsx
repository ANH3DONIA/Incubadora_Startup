'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';
import { Calendar as CalendarIcon, Plus, Video, Clock, Users, ArrowRight, BookOpen, AlertCircle } from 'lucide-react';

export default function EventsPage() {
  const { user } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [pitches, setPitches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Event Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const [eventsRes, pitchesRes] = await Promise.all([
        api.get('/calendar/public').catch(() => ({ data: { data: [] } })),
        api.get('/pitches/upcoming').catch(() => ({ data: { data: [] } })),
      ]);
      setEvents(eventsRes.data.data || []);
      setPitches(pitchesRes.data.data || []);
    } catch (err) {
      console.error('Error fetching calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const getMinDateTime = () => {
    const now = new Date(Date.now() + 2 * 60 * 1000);
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setFormError('Por favor especifica fecha y hora de inicio y fin válidas.');
      return;
    }

    if (start.getTime() <= Date.now()) {
      setFormError('La fecha de inicio debe ser futura.');
      return;
    }

    if (end.getTime() <= start.getTime()) {
      setFormError('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }

    setCreating(true);
    try {
      await api.post('/calendar', {
        title: title.trim(),
        description: description.trim(),
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });

      setTitle('');
      setDescription('');
      setStartTime('');
      setEndTime('');
      setModalOpen(false);
      await fetchEvents();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al crear el evento.');
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Cargando calendario y eventos..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Eventos & Quick Pitches</h1>
          <p className="text-xs text-slate-500 mt-1">
            Calendario de rondas en vivo, demo days y masterclasses dinámicas de la incubadora
          </p>
        </div>

        <button
          onClick={() => {
            setFormError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Crear Evento / Taller</span>
        </button>
      </div>

      {/* Upcoming Pitches Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video className="h-4 w-4 text-teal-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Próximos Quick Pitches en Vivo ({pitches.length})
          </h2>
        </div>

        {pitches.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            No hay pitches programados en las próximas 24 horas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pitches.map((pitch) => (
              <div
                key={pitch.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4"
              >
                <div>
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300">
                    {pitch.startup?.industry || 'Startup'}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                    {pitch.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Presentado por <b className="text-slate-800 dark:text-slate-200">{pitch.startup?.name}</b>
                  </p>
                  <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold mt-2 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(pitch.scheduledFor)} ({pitch.durationMinutes} min)
                  </p>
                </div>

                <Link
                  href={`/pitch-room/${pitch.room?.id || pitch.id}`}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-xs font-bold text-white hover:bg-teal-700 transition"
                >
                  <span>Entrar a la Sala</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* General Calendar Events from Database */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-4 w-4 text-indigo-600" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Talleres & Eventos Comunitarios ({events.length})
          </h2>
        </div>

        {events.length === 0 ? (
          <EmptyState
            title="No hay eventos programados en el calendario"
            description="Sé el primero en programar una masterclass o sesión abierta para la comunidad."
            icon={BookOpen}
            action={
              <button
                onClick={() => {
                  setFormError(null);
                  setModalOpen(true);
                }}
                className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700"
              >
                Crear Primer Evento
              </button>
            }
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((event) => (
              <div key={event.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{event.title}</h4>
                  {event.description && (
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{event.description}</p>
                  )}
                  <p className="text-[11px] text-slate-400">
                    Organizado por: {event.user?.firstName} {event.user?.lastName}
                  </p>
                </div>
                <div className="text-right sm:text-right shrink-0">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 block">
                    {formatDate(event.startTime)}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Hasta {new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit' }).format(new Date(event.endTime))}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Crear Evento en Calendario</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Título del Evento
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Masterclass: Valuaciones y Cap Tables"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Temario y detalles del evento..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Inicio (Futuro)
                  </label>
                  <input
                    type="datetime-local"
                    required
                    min={getMinDateTime()}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1">
                    Fin
                  </label>
                  <input
                    type="datetime-local"
                    required
                    min={startTime || getMinDateTime()}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-2xl bg-teal-600 py-3 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20"
              >
                {creating ? 'Guardando en Base de Datos...' : 'Publicar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
