'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/store/toastStore';
import { formatCurrency, formatDate, calculatePercentage } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { RatingStars } from '@/components/ui/RatingStars';
import {
  Building2,
  DollarSign,
  FileText,
  Lock,
  Calendar,
  Star,
  CheckCircle2,
  ArrowLeft,
  Video,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Users,
  X,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { StartupPitchSession, StartupDetailRating } from '@/types/dashboard';

export default function StartupDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const startupId = Array.isArray(id) ? id[0] : id;

  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Investment Modal State
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState<number | string>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'binance'>('stripe');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [sandboxTxHash, setSandboxTxHash] = useState<string | null>(null);
  const [settlingSandbox, setSettlingSandbox] = useState(false);
  const [paymentMessage, setPaymentMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Rating state
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (investModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [investModalOpen]);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const { data } = await api.get(`/startups/${startupId}`);
        setStartup(data.data);
      } catch (err) {
        console.error('Error fetching startup:', err);
      } finally {
        setLoading(false);
      }
    };

    if (startupId) fetchStartup();
  }, [startupId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      const verifyPayment = async () => {
        try {
          const { data } = await api.post('/payments/verify-session', { sessionId });
          if (data.data?.startup) {
            setStartup(data.data.startup);
          } else {
            const refreshed = await api.get(`/startups/${startupId}`);
            setStartup(refreshed.data.data);
          }
          setPaymentMessage({
            type: 'success',
            text: '¡Inversión confirmada y acreditada exitosamente en la startup!',
          });
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Error verificando sesión de pago:', err);
        }
      };

      verifyPayment();
    } else if (paymentStatus === 'cancelled') {
      setPaymentMessage({
        type: 'error',
        text: 'El proceso de inversión fue cancelado.',
      });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [startupId]);

  if (loading) return <LoadingSpinner size="lg" label="Cargando ficha de startup..." />;
  if (!startup) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-500">Startup no encontrada o retirada del marketplace.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
          <ArrowLeft className="h-4 w-4" /> Volver al Marketplace
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === startup.userId;
  const percentage = calculatePercentage(startup.amountRaised, startup.fundingGoal);
  const remainingGoal = Math.max(0, startup.fundingGoal - startup.amountRaised);

  const numInvestAmount = typeof investAmount === 'string' ? parseFloat(investAmount) || 0 : investAmount;
  const isInvestValid = numInvestAmount >= 50 && numInvestAmount <= 10_000_000;

  const handleInvest = async () => {
    if (!isInvestValid) {
      setPaymentMessage({
        type: 'error',
        text: 'El monto debe ser un valor válido entre $50 USD y $10,000,000 USD.',
      });
      return;
    }

    if (isOwner) {
      setPaymentMessage({
        type: 'error',
        text: 'No puedes invertir en tu propia startup.',
      });
      return;
    }

    setPaymentProcessing(true);
    setPaymentMessage(null);
    setSandboxTxHash(null);

    try {
      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/payments/investments/checkout', {
          amount: numInvestAmount,
          startupId: startup.id,
          successUrl: `${window.location.origin}/startup/${startup.id}?payment=success`,
          cancelUrl: `${window.location.origin}/startup/${startup.id}?payment=cancelled`,
        });

        if (data.data?.url) {
          if (data.data.url.includes('mock=true')) {
            const txRef = data.data.sessionId || data.data.url.split('session_id=')[1]?.split('&')[0];
            setSandboxTxHash(txRef);
            setPaymentMessage({
              type: 'success',
              text: `Orden de inversión sandbox generada con éxito (Ref: ${txRef}).`,
            });
            const refreshed = await api.get(`/startups/${startupId}`);
            setStartup(refreshed.data.data);
          } else {
            window.location.href = data.data.url;
          }
        }
      } else {
        // Binance Pay
        const { data } = await api.post('/payments/investments/crypto', {
          amount: numInvestAmount,
          currency: 'USDT',
          startupId: startup.id,
        });

        if (data.data?.merchantTradeNo) {
          setSandboxTxHash(data.data.merchantTradeNo);
          setPaymentMessage({
            type: 'success',
            text: `Orden Binance Pay generada (TradeNo: ${data.data.merchantTradeNo}).`,
          });
          const refreshed = await api.get(`/startups/${startupId}`);
          setStartup(refreshed.data.data);
        }
      }
    } catch (err: any) {
      setPaymentMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al procesar la inversión.',
      });
    } finally {
      setPaymentProcessing(false);
    }
  };

  const handleConfirmSandbox = async () => {
    if (!sandboxTxHash) return;
    setSettlingSandbox(true);
    try {
      await api.post('/payments/confirm-sandbox', {
        transactionHash: sandboxTxHash,
      });
      toast.success('¡Inversión simulada y fondos acreditados exitosamente!');
      setPaymentMessage({
        type: 'success',
        text: `¡Pago Aprobado y Liquidado en Sandbox! Los fondos han sido transferidos exitosamente al capital de ${startup.name}.`,
      });
      setSandboxTxHash(null);
      const refreshed = await api.get(`/startups/${startupId}`);
      setStartup(refreshed.data.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al liquidar transacción sandbox');
    } finally {
      setSettlingSandbox(false);
    }
  };

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOwner) {
      toast.warning('No puedes calificar tu propio emprendimiento.');
      return;
    }

    setSubmittingRating(true);
    try {
      await api.post(`/pitches/${startup.id}/ratings`, {
        score: ratingScore,
        feedback: ratingFeedback.trim().slice(0, 1000),
        isPublic: true,
      });
      // Refresh
      const refreshed = await api.get(`/startups/${startupId}`);
      setStartup(refreshed.data.data);
      setRatingFeedback('');
      toast.success('¡Calificación y feedback publicados con éxito!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al enviar calificación');
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleDownloadPitchDeck = async () => {
    try {
      const token = useAuthStore.getState().token || localStorage.getItem('access_token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/startups/${startup.id}/pitch-deck/file`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('No tienes permisos para descargar el archivo o no está disponible.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${startup.name}-PitchDeck-Decrypted.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Pitch Deck descifrado y descargado exitosamente');
    } catch (err: any) {
      toast.error(err.message || 'Error al descargar pitch deck');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Directorio</span>
      </button>

      {/* Header Banner VC Data Sheet */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800/80 dark:bg-[#0b0f19]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-extrabold text-2xl">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {startup.name}
                </h1>
                {isOwner && (
                  <span className="rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/60">
                    Tu Startup
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="rounded-md bg-blue-50/80 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-500/20">
                  {startup.industry}
                </span>
                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {startup.stage}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-xs text-slate-500 font-medium">
                  Fundador: <b className="text-slate-700 dark:text-slate-300">{startup.user?.firstName} {startup.user?.lastName}</b>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {startup.pitchDeckUrl && (
              <button
                onClick={handleDownloadPitchDeck}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition"
              >
                <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Descargar Pitch Deck (AES-256-GCM)</span>
              </button>
            )}

            {!isOwner && (
              <button
                onClick={() => {
                  setPaymentMessage(null);
                  setInvestModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 transition-all hover:scale-[1.02]"
              >
                <DollarSign className="h-4 w-4" />
                <span>Invertir en Startup</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main 70% column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Overview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-3.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Tesis y Modelo de Negocio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line text-justify">
              {startup.description}
            </p>
          </div>

          {/* Upcoming Pitch Sessions */}
          {startup.pitchSessions && startup.pitchSessions.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Quick Pitches en Vivo Programados ({startup.pitchSessions.length})
              </h2>
              <div className="space-y-3">
                {startup.pitchSessions.map((session: StartupPitchSession) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-9 w-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <Video className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{session.title}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {formatDate(session.scheduledFor)} • Duración: {session.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/pitch-room/${session.room?.id || session.id}`}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                    >
                      <span>Entrar al Pitch</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ratings & Investor Reviews */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Reseñas de Inversionistas ({startup.ratings?.length || 0})
              </h2>
            </div>

            {/* Investor Rate Form */}
            {user?.role === 'INVESTOR' && !isOwner && (
              <form onSubmit={handleRate} className="rounded-xl bg-slate-50 dark:bg-slate-800/40 p-4 space-y-3 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Emitir Calificación y Feedback</p>
                <div className="flex items-center gap-3">
                  <RatingStars rating={ratingScore} readOnly={false} onChange={setRatingScore} size={18} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ratingScore} / 5</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Escribe tu análisis de oportunidad o feedback para el founder..."
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {submittingRating ? 'Enviando...' : 'Publicar Calificación'}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {!startup.ratings || startup.ratings.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  Esta startup aún no tiene evaluaciones registradas por inversionistas.
                </p>
              ) : (
                startup.ratings.map((rate: StartupDetailRating) => (
                  <div key={rate.id} className="border-b border-slate-100 dark:border-slate-800/80 pb-4 last:border-0 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={rate.score} size={12} />
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {rate.user?.firstName || 'Inversionista'} {rate.user?.lastName || ''}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">{formatDate(rate.createdAt)}</span>
                    </div>
                    {rate.feedback && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1 italic">
                        &ldquo;{rate.feedback}&rdquo;
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lateral 30% column: Funding Round & Progress */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Métricas de la Ronda</h3>

            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(startup.amountRaised)}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                de la meta total de <b className="text-slate-800 dark:text-slate-200">{formatCurrency(startup.fundingGoal)}</b>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-blue-600 dark:text-blue-400">{percentage}% Fondeado</span>
                <span className="text-slate-400">Restante: {formatCurrency(remainingGoal, 'USD', true)}</span>
              </div>
            </div>

            {!isOwner && (
              <button
                type="button"
                onClick={() => {
                  setPaymentMessage(null);
                  setInvestModalOpen(true);
                }}
                className="w-full rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-500 transition"
              >
                Invertir en esta Ronda
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Investment Modal */}
      {investModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invertir en {startup.name}</h3>
                <p className="text-xs text-slate-400">Transacción auditada y protegida</p>
              </div>
              <button
                onClick={() => setInvestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                aria-label="Cerrar modal de inversión"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {paymentMessage && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border ${
                  paymentMessage.type === 'success'
                    ? 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {paymentMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                )}
                <span>{paymentMessage.text}</span>
              </div>
            )}

            {/* Quick Amounts */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Monto de Inversión (USD)
                </label>
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                  {formatCurrency(numInvestAmount)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestAmount(amt.toString())}
                    className={`rounded-lg border py-1.5 text-xs font-semibold transition ${
                      numInvestAmount === amt
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 ring-2 ring-blue-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  value={investAmount ? Number(investAmount).toLocaleString('en-US') : ''}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    if (!clean) {
                      setInvestAmount('');
                      return;
                    }
                    const truncated = clean.slice(0, 8);
                    const num = parseInt(truncated, 10);
                    if (num > 10_000_000) {
                      setInvestAmount('10000000');
                    } else {
                      setInvestAmount(num.toString());
                    }
                  }}
                  placeholder="5,000"
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Límites: Mínimo $50 USD — Máximo $10,000,000 USD (Máx 8 dígitos)
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Método de Liquidación
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                    paymentMethod === 'stripe'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 ring-2 ring-blue-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Stripe (Fiat)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition ${
                    paymentMethod === 'binance'
                      ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 ring-2 ring-blue-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <span>Binance Pay (Cripto)</span>
                </button>
              </div>
            </div>

            {/* Interactive Sandbox Settlement Widget */}
            {sandboxTxHash && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 dark:border-blue-800/80 dark:bg-blue-950/40 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>Simulador de Liquidación Sandbox</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  Estás operando en entorno de pruebas. Haz clic para liquidar y transferir los fondos a la startup inmediatamente.
                </p>
                <button
                  type="button"
                  disabled={settlingSandbox}
                  onClick={handleConfirmSandbox}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-500 py-2.5 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  <Zap className="h-4 w-4" />
                  <span>{settlingSandbox ? 'Acreditando en Ledger...' : '⚡ Simular Pago Aprobado (Sandbox)'}</span>
                </button>
              </div>
            )}

            <button
              type="button"
              disabled={paymentProcessing || !isInvestValid}
              onClick={handleInvest}
              className="w-full rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
            >
              {paymentProcessing ? 'Validando y Procesando Transacción...' : `Confirmar Inversión de ${formatCurrency(numInvestAmount)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

