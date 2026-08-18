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
} from 'lucide-react';

export default function StartupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const startupId = params.id as string;

  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investModalOpen, setInvestModalOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState<number | string>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'binance'>('stripe');
  const [paymentProcessing, setPaymentProcessing] = useState(false);
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

  if (loading) return <LoadingSpinner size="lg" label="Cargando ficha de startup..." />;
  if (!startup) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-slate-500">Startup no encontrada o retirada del marketplace.</p>
        <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 hover:underline">
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

    try {
      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/payments/checkout', {
          amount: numInvestAmount,
          startupId: startup.id,
          type: 'INVESTMENT',
        });

        if (data.data.url) {
          if (data.data.url.includes('mock=true')) {
            setPaymentMessage({
              type: 'success',
              text: `Orden de inversión sandbox generada (Ref: ${data.data.sessionId}). En modo de prueba, las transacciones quedan en estado PENDING hasta ser verificadas por el ledger.`,
            });
            const refreshed = await api.get(`/startups/${startupId}`);
            setStartup(refreshed.data.data);
          } else {
            window.location.href = data.data.url;
          }
        }
      } else {
        // Binance Pay
        const { data } = await api.post('/payments/crypto/create-order', {
          amount: numInvestAmount,
          currency: 'USDT',
          startupId: startup.id,
        });

        if (data.data.checkoutUrl) {
          setPaymentMessage({
            type: 'success',
            text: `Orden Binance Pay generada (TradeNo: ${data.data.merchantTradeNo}). Procede con el pago en la pasarela oficial.`,
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
      const token = localStorage.getItem('access_token');
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
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Directorio</span>
      </button>

      {/* Header Banner VC Data Sheet */}
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#0e1526]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-3xl shadow-lg shadow-teal-500/25">
              {startup.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {startup.name}
                </h1>
                {isOwner && (
                  <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[11px] font-bold text-teal-700 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800">
                    Tu Startup
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="rounded-full bg-teal-100/70 px-3 py-1 text-xs font-bold text-teal-800 dark:bg-teal-950/80 dark:text-teal-300">
                  {startup.industry}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition shadow-sm"
              >
                <Lock className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                <span>Descargar Pitch Deck (AES-256)</span>
              </button>
            )}

            {!isOwner && (
              <button
                onClick={() => {
                  setPaymentMessage(null);
                  setInvestModalOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-teal-600 px-7 py-3 text-xs font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-600/25 transition-all hover:scale-[1.02]"
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
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-teal-600" />
              Tesis y Modelo de Negocio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line text-justify">
              {startup.description}
            </p>
          </div>

          {/* Upcoming Pitch Sessions */}
          {startup.pitchSessions && startup.pitchSessions.length > 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Video className="h-4 w-4 text-teal-600" />
                Quick Pitches en Vivo Programados ({startup.pitchSessions.length})
              </h2>
              <div className="space-y-3">
                {startup.pitchSessions.map((session: any) => (
                  <div
                    key={session.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
                        <Video className="h-5 w-5" />
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
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20"
                    >
                      <span>Entrar al Pitch</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ratings & Investor Reviews */}
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Reseñas de Inversionistas ({startup.ratings?.length || 0})
              </h2>
            </div>

            {/* Investor Rate Form */}
            {user?.role === 'INVESTOR' && !isOwner && (
              <form onSubmit={handleRate} className="rounded-2xl bg-slate-50 dark:bg-slate-800/40 p-5 space-y-3 border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Emitir Calificación y Feedback</p>
                <div className="flex items-center gap-3">
                  <RatingStars rating={ratingScore} readOnly={false} onChange={setRatingScore} size={20} />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{ratingScore} / 5</span>
                </div>
                <textarea
                  rows={2}
                  maxLength={1000}
                  value={ratingFeedback}
                  onChange={(e) => setRatingFeedback(e.target.value)}
                  placeholder="Escribe tu análisis de oportunidad o feedback para el founder..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {submittingRating ? 'Enviando...' : 'Publicar Calificación'}
                </button>
              </form>
            )}

            <div className="space-y-4">
              {!startup.ratings || startup.ratings.length === 0 ? (
                <p className="text-xs text-slate-500 italic">Aún no hay calificaciones registradas para esta startup.</p>
              ) : (
                startup.ratings.map((r: any) => (
                  <div key={r.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {r.investor?.firstName} {r.investor?.lastName}
                      </span>
                      <RatingStars rating={r.score} size={13} />
                    </div>
                    {r.feedback && <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{r.feedback}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Lateral 30% column: Funding Round & Progress */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Métricas de la Ronda</h3>

            <div>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{formatCurrency(startup.amountRaised)}</p>
              <p className="text-xs text-slate-500 mt-1">
                de la meta total de <b className="text-slate-800 dark:text-slate-200">{formatCurrency(startup.fundingGoal)}</b>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-teal-600 dark:text-teal-400">{percentage}% Fondeado</span>
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
                className="w-full rounded-2xl bg-teal-600 py-3.5 text-xs font-bold text-white hover:bg-teal-700 shadow-lg shadow-teal-600/25 transition"
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
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl dark:bg-[#0e1526] border border-slate-100 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">Invertir en {startup.name}</h3>
                <p className="text-xs text-slate-500">Transacción auditada y protegida</p>
              </div>
              <button
                onClick={() => setInvestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {paymentMessage && (
              <div
                className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-semibold border ${
                  paymentMessage.type === 'success'
                    ? 'border-teal-500/30 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-300'
                    : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {paymentMessage.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
                )}
                <span>{paymentMessage.text}</span>
              </div>
            )}

            {/* Quick Amounts */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Monto de Inversión (USD)
                </label>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                  {formatCurrency(numInvestAmount)}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[500, 1000, 5000, 25000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setInvestAmount(amt.toString())}
                    className={`rounded-xl border py-2 text-xs font-bold transition ${
                      numInvestAmount === amt
                        ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 ring-2 ring-teal-500'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                    }`}
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Límites: Mínimo $50 USD — Máximo $10,000,000 USD (Máx 8 dígitos)
              </p>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Método de Liquidación
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('stripe')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-bold transition ${
                    paymentMethod === 'stripe'
                      ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 ring-2 ring-teal-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  <span>Stripe (Fiat)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('binance')}
                  className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-bold transition ${
                    paymentMethod === 'binance'
                      ? 'border-teal-600 bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 ring-2 ring-teal-500'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  <DollarSign className="h-4 w-4 text-amber-500" />
                  <span>Binance Pay (Cripto)</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={paymentProcessing || !isInvestValid}
              onClick={handleInvest}
              className="w-full rounded-2xl bg-teal-600 py-4 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 shadow-lg shadow-teal-600/25 transition"
            >
              {paymentProcessing ? 'Validando y Procesando Transacción...' : `Confirmar Inversión de ${formatCurrency(numInvestAmount)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

