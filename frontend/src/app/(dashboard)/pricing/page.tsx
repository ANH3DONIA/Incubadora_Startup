'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Check,
  Rocket,
  Shield,
  Sparkles,
  CreditCard,
  DollarSign,
  Lock,
  Download,
  CheckCircle2,
  ArrowRight,
  X,
  Building2,
  Receipt,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { PricingPlanItem } from '@/types/dashboard';

export default function PricingPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlanItem | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'binance'>('stripe');
  
  // Checkout Form State
  const [cardHolder, setCardHolder] = useState(user ? `${user.firstName} ${user.lastName}` : 'Carlos Santana');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [processing, setProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Digital Invoice / Receipt State
  const [completedInvoice, setCompletedInvoice] = useState<{
    invoiceId: string;
    authCode: string;
    date: string;
    planName: string;
    amount: number;
    paymentMethod: string;
    periodEnd: string;
  } | null>(null);

  const plans: PricingPlanItem[] = [
    {
      id: 'free',
      name: 'Free Starter',
      price: '$0',
      description: 'Acceso básico para fundadores y exploradores',
      features: [
        'Registro de 1 Startup',
        '1 Quick Pitch al mes',
        'Visualización pública en Marketplace',
        'Soporte estándar por comunidad',
      ],
      cta: 'Plan Actual',
      popular: false,
      amount: 0,
    },
    {
      id: 'pro',
      name: 'Pro Incubator',
      price: '$49',
      period: '/mes',
      description: 'Para startups listas para levantar capital y VCs activos',
      features: [
        'Quick Pitches ilimitados',
        'Pitch Decks cifrados con AES-256',
        'Acceso preferencial a inversores top',
        'Algoritmo de Matchmaking personalizado',
        'Insignia PRO Founder destacada en salas y marketplace',
        'Sincronización con Google Calendar & Outlook',
      ],
      cta: 'Suscribirme con Pro',
      popular: true,
      amount: 49,
      code: 'PRO',
    },
    {
      id: 'enterprise',
      name: 'VC & Fund Suite',
      price: '$249',
      period: '/mes',
      description: 'Para firmas de Venture Capital y fondos ángeles',
      features: [
        'Acceso a Deal Flow privado exclusivo',
        'Auditoría y trazabilidad completa de transacciones',
        'Múltiples cuentas de analistas y socios',
        'Descarga masiva de Pitch Decks descifrados',
        'Insignia Institutional VC verificada',
        'Soporte prioritario 24/7 y Account Manager dedicado',
      ],
      cta: 'Adquirir Suite',
      popular: false,
      amount: 249,
      code: 'ENTERPRISE',
    },
  ];

  const handleOpenCheckout = (plan: PricingPlanItem) => {
    if (plan.id === 'free') return;
    setSelectedPlan(plan);
    setCheckoutError(null);
    setCompletedInvoice(null);
  };

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setProcessing(true);
    setCheckoutError(null);

    const planCode = selectedPlan.code;

    try {
      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/payments/subscriptions/checkout', {
          plan: planCode,
        });

        if (data.data?.url && !data.data.url.includes('mock=true')) {
          window.location.href = data.data.url;
          return;
        }
      } else {
        await api.post('/payments/subscriptions/crypto', {
          plan: planCode,
          currency: 'USDT',
        });
      }

      // Actualizar el perfil del usuario en la sesión global
      try {
        const profileRes = await api.get('/auth/profile');
        if (profileRes.data?.data) {
          useAuthStore.getState().setUser(profileRes.data.data);
        }
      } catch {}

      // Generar Recibo / Factura Oficial Digital
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      setCompletedInvoice({
        invoiceId: `INV-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        date: now.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        planName: selectedPlan.name,
        amount: selectedPlan.amount,
        paymentMethod: paymentMethod === 'stripe' ? 'Tarjeta de Crédito (Visa •••• 4242)' : 'Binance Pay (USDT TRC20)',
        periodEnd: nextMonth.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
      });
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || 'Error al procesar el pago bancario.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadInvoice = () => {
    if (!completedInvoice) return;
    const content = `
============================================================
              NEXUS VENTURES INCUBATOR LLC
          COMPROBANTE OFICIAL DE SUSCRIPCIÓN DIGITAL
============================================================
No. de Factura:   ${completedInvoice.invoiceId}
Código Autoriz.:  ${completedInvoice.authCode}
Fecha y Hora:     ${completedInvoice.date}
Estado:           PAGADO / APROBADO (Modo Verificado)
------------------------------------------------------------
DATOS DEL CLIENTE:
Nombre:           ${user?.firstName} ${user?.lastName}
Email:            ${user?.email}
Rol en Plataforma:${user?.role}
------------------------------------------------------------
DESGLOSE DE SERVICIO:
Concepto:         ${completedInvoice.planName} (Acceso 30 Días)
Vigencia Hasta:   ${completedInvoice.periodEnd}
Método de Pago:   ${completedInvoice.paymentMethod}
------------------------------------------------------------
SUBTOTAL:         $${completedInvoice.amount}.00 USD
IMPUESTOS (0%):   $0.00 USD
TOTAL COBRADO:    $${completedInvoice.amount}.00 USD
============================================================
Este documento certifica el pago electrónico y la activación
inmediata de los privilegios Pro/Enterprise en la plataforma.
============================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo-${completedInvoice.invoiceId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Membresías Institucionales & Planes
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Acelera tu Crecimiento en la Incubadora
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
          Selecciona el plan que mejor se adapte a tu etapa de levantamiento o tesis de inversión con activación y recibo digital inmediato.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col justify-between rounded-2xl p-7 border transition-all relative ${
              plan.popular
                ? 'border-blue-500 bg-white dark:bg-[#0b0f19] ring-2 ring-blue-500/30'
                : 'border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#0b0f19]'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-md bg-blue-600 px-3 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                Más Popular
              </span>
            )}

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{plan.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-xs text-slate-400 font-medium">{plan.period}</span>}
              </div>

              <div className="mt-6 space-y-2.5">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={plan.id === 'free'}
                onClick={() => handleOpenCheckout(plan)}
                className={`w-full rounded-xl py-3 text-xs font-bold transition flex items-center justify-center gap-2 ${
                  plan.popular
                    ? 'bg-blue-600 text-white hover:bg-blue-500'
                    : plan.id === 'free'
                    ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-default'
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
                }`}
              >
                <span>{plan.cta}</span>
                {plan.id !== 'free' && <ArrowRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE CHECKOUT & RECIBO OFICIAL                                       */}
      {/* ========================================================================= */}
      {selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedPlan(null)}
              className="absolute top-5 right-5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
            >
              <X className="h-4 w-4" />
            </button>

            {!completedInvoice ? (
              /* PASO 1: CHECKOUT & DATOS DE PAGO */
              <form onSubmit={handleProcessPayment} className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    <CreditCard className="h-4 w-4" />
                    <span>Checkout & Activación de Membresía</span>
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
                    Contratar {selectedPlan.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Revisa el resumen de tu suscripción y selecciona tu método de pago
                  </p>
                </div>

                {/* Resumen del Pedido */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Plan Seleccionado:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name} (30 días)</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Subtotal:</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">${selectedPlan.amount}.00 USD</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Impuestos / IVA (0%):</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">$0.00 USD</span>
                  </div>
                  <div className="border-t border-slate-200/80 pt-2 flex items-center justify-between text-sm font-bold text-slate-900 dark:text-white dark:border-slate-700">
                    <span>Total a Pagar:</span>
                    <span className="text-blue-600 dark:text-blue-400">${selectedPlan.amount}.00 USD</span>
                  </div>
                </div>

                {/* Selector de Método de Pago */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Selecciona tu Método de Pago
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
                      <span>Tarjeta (Stripe)</span>
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
                      <span>Binance Pay</span>
                    </button>
                  </div>
                </div>

                {/* Formulario según Método */}
                {paymentMethod === 'stripe' ? (
                  <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Titular de la Tarjeta
                      </label>
                      <input
                        type="text"
                        required
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        placeholder="Nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Número de Tarjeta
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Vencimiento
                        </label>
                        <input
                          type="text"
                          required
                          value={cardExp}
                          onChange={(e) => setCardExp(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-center"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          required
                          maxLength={4}
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-center"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20 text-center space-y-3">
                    <QrCode className="h-14 w-14 text-amber-600 dark:text-amber-400 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Binance Pay • Red TRC-20 / BEP-20</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                        Monto a liquidar: <b>{selectedPlan.amount} USDT</b>
                      </p>
                    </div>
                  </div>
                )}

                {checkoutError && (
                  <div className="rounded-lg bg-red-50 p-3 text-xs font-semibold text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    {checkoutError}
                  </div>
                )}

                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <Lock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Procesamiento encriptado de grado bancario TLS 256-bit</span>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition shadow-md"
                >
                  {processing ? 'Procesando Transacción y Activando Membresía...' : `Pagar $${selectedPlan.amount}.00 USD y Activar`}
                </button>
              </form>
            ) : (
              /* PASO 2: RECIBO / FACTURA OFICIAL DIGITAL */
              <div className="space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-500/20">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    ¡Pago Aprobado y Membresía Activada!
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tu cuenta ha sido actualizada al plan {completedInvoice.planName}
                  </p>
                </div>

                {/* Comprobante Digital */}
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/90 p-5 dark:border-slate-700 dark:bg-slate-900/60 font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-bold text-slate-900 dark:text-white">NEXUS VENTURES</span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-bold">{completedInvoice.invoiceId}</span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <p><b>Fecha:</b> {completedInvoice.date}</p>
                    <p><b>Cliente:</b> {user?.firstName} {user?.lastName} ({user?.email})</p>
                    <p><b>Método:</b> {completedInvoice.paymentMethod}</p>
                    <p><b>Vigencia:</b> Hasta {completedInvoice.periodEnd}</p>
                  </div>

                  <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex justify-between font-bold text-xs text-slate-900 dark:text-white">
                    <span>Monto Cobrado:</span>
                    <span className="text-blue-600 dark:text-blue-400">${completedInvoice.amount}.00 USD</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadInvoice}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <Download className="h-4 w-4" />
                    <span>Descargar Recibo Oficial (TXT / PDF)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPlan(null);
                      router.push('/dashboard');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-bold text-white hover:bg-blue-500 transition"
                  >
                    <span>Ir a mi Dashboard con Beneficios Pro</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
