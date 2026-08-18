'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import { StatCard } from '@/components/ui/StatCard';
import { StartupCard, StartupItem } from '@/components/marketplace/StartupCard';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  DollarSign,
  TrendingUp,
  Video,
  Building2,
  Sparkles,
  ArrowRight,
  Shield,
  Users,
  Calendar,
  Play,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [myStartup, setMyStartup] = useState<any>(null);
  const [upcomingPitches, setUpcomingPitches] = useState<any[]>([]);
  const [matchedStartups, setMatchedStartups] = useState<StartupItem[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (user?.role === 'ENTREPRENEUR') {
          const [startupRes, pitchesRes] = await Promise.all([
            api.get('/startups/my').catch(() => ({ data: { data: null } })),
            api.get('/pitches/upcoming').catch(() => ({ data: { data: [] } })),
          ]);
          setMyStartup(startupRes.data.data);
          setUpcomingPitches(pitchesRes.data.data);
        } else if (user?.role === 'INVESTOR') {
          const [matchesRes, pitchesRes] = await Promise.all([
            api.get('/matchmaking/matches').catch(() => ({ data: { data: [] } })),
            api.get('/pitches/upcoming').catch(() => ({ data: { data: [] } })),
          ]);
          setMatchedStartups(matchesRes.data.data || []);
          setUpcomingPitches(pitchesRes.data.data || []);
        } else if (user?.role === 'ADMIN') {
          const res = await api.get('/admin/dashboard').catch(() => ({ data: { data: null } }));
          setAdminStats(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return <LoadingSpinner size="lg" label="Cargando panel..." />;
  }

  // ==========================================
  // ENTREPRENEUR VIEW
  // ==========================================
  if (user?.role === 'ENTREPRENEUR') {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hola, {user.firstName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Panel de control ejecutivo y estado de ronda
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Capital Recaudado"
            value={formatCurrency(myStartup?.amountRaised || 0)}
            subtitle={`Meta: ${formatCurrency(myStartup?.fundingGoal || 0)}`}
            icon={DollarSign}
            iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-500/20"
          />
          <StatCard
            title="Calificación Promedio"
            value={myStartup?.ratings?.length ? `${(myStartup.ratings.reduce((a: any, c: any) => a + c.score, 0) / myStartup.ratings.length).toFixed(1)} / 5.0` : 'Sin reseñas'}
            subtitle={`${myStartup?.ratings?.length || 0} inversores han calificado`}
            icon={TrendingUp}
            iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-500/20"
          />
          <StatCard
            title="Sesiones de Pitch"
            value={myStartup?.pitchSessions?.length || 0}
            subtitle="Pitches programados / concluidos"
            icon={Video}
            iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 border border-violet-500/20"
          />
        </div>

        {/* Startup Card / Call to Action */}
        {!myStartup ? (
          <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 p-8 text-center dark:border-blue-800/60 dark:bg-blue-950/15 space-y-4">
            <Building2 className="h-10 w-10 text-blue-600 dark:text-blue-400 mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Registra tu Startup</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                Aún no has registrado el perfil de tu empresa. Complétalo para poder agendar Quick Pitches y subir tu Pitch Deck cifrado.
              </p>
            </div>
            <Link
              href="/my-startup"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition"
            >
              <span>Completar Perfil de Startup</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{myStartup.name}</h3>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{myStartup.industry} • {myStartup.stage}</p>
                </div>
                <Link
                  href="/my-startup"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 transition"
                >
                  Editar Perfil
                </Link>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {myStartup.description}
              </p>
              <div className="flex gap-4 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-3 dark:border-slate-800">
                <span>Pitch Deck: <b className="text-blue-600 dark:text-blue-400">{myStartup.encryptedPitchDeck ? 'Cifrado AES-256-GCM (Activo)' : 'No subido'}</b></span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">Acciones Rápidas</h3>
              <div className="space-y-2">
                <Link
                  href="/my-startup/pitch-sessions"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition text-xs font-medium border border-transparent hover:border-blue-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Agendar Quick Pitch
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
                <Link
                  href="/events"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900 hover:bg-blue-50/60 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition text-xs font-medium border border-transparent hover:border-blue-500/20"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    Ver Calendario de Eventos
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // INVESTOR VIEW
  // ==========================================
  if (user?.role === 'INVESTOR') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Panel de Inversiones, {user.firstName}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Startups con mayor afinidad a tu tesis de inversión y sesiones en vivo
            </p>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
          >
            <span>Explorar Marketplace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Live / Upcoming Pitches Banner */}
        {upcomingPitches.length > 0 && (
          <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-950/80 to-[#0b0f19] p-6 text-white">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 mb-2">
              <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <span>SESIÓN EN VIVO PROGRAMADA</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold">{upcomingPitches[0].title}</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Por {upcomingPitches[0].startup?.name} ({upcomingPitches[0].startup?.industry}) • {formatDate(upcomingPitches[0].scheduledFor)}
                </p>
              </div>
              <Link
                href={`/pitch-room/${upcomingPitches[0].room?.id || upcomingPitches[0].id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-500 transition"
              >
                <Play className="h-4 w-4" />
                <span>Entrar a la Sala</span>
              </Link>
            </div>
          </div>
        )}

        {/* Recommended Matches */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Matches Recomendados por Algoritmo
            </h2>
          </div>

          {matchedStartups.length === 0 ? (
            <p className="text-xs text-slate-500">No hay startups disponibles actualmente.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedStartups.slice(0, 3).map((startup) => (
                <StartupCard key={startup.id} startup={startup} />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // ADMIN VIEW
  // ==========================================
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Panel de Administración General</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supervisión en tiempo real de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard
          title="Usuarios Totales"
          value={adminStats?.stats?.totalUsers || 0}
          icon={Users}
          iconBg="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-500/20"
        />
        <StatCard
          title="Startups Registradas"
          value={adminStats?.stats?.totalStartups || 0}
          icon={Building2}
          iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-500/20"
        />
        <StatCard
          title="Sesiones de Pitch"
          value={adminStats?.stats?.totalPitches || 0}
          icon={Video}
          iconBg="bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 border border-violet-500/20"
        />
        <StatCard
          title="Inversión Procesada"
          value={formatCurrency(adminStats?.stats?.totalInvested || 0)}
          icon={DollarSign}
          iconBg="bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-500/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/audit"
          className="p-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0b0f19] hover:border-blue-500/40 transition space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span>Auditoría & Logs de Seguridad</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Revisa cada mutación, dirección IP, payload y código de estado ejecutado en la API.
          </p>
        </Link>

        <Link
          href="/admin/finances"
          className="p-6 rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0b0f19] hover:border-blue-500/40 transition space-y-2"
        >
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <DollarSign className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>Finanzas & Transacciones Cripto/Fiat</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Desglose de pagos completados a través de Stripe y Binance Pay.
          </p>
        </Link>
      </div>
    </div>
  );
}
