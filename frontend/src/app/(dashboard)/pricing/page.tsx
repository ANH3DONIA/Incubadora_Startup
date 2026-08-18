'use client';

import React, { useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { Check, Rocket, Shield, Sparkles, CreditCard, DollarSign } from 'lucide-react';

export default function PricingPage() {
  const { user } = useAuthStore();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'binance'>('stripe');
  const [message, setMessage] = useState<string | null>(null);

  const plans = [
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
        'Grabaciones de sesiones en la nube',
        'Sincronización con Google Calendar & Outlook',
      ],
      cta: 'Suscribirme con Pro',
      popular: true,
      priceId: 'price_pro_subscription',
      amount: 49,
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
        'Soporte prioritario 24/7 y Account Manager dedicado',
      ],
      cta: 'Adquirir Suite',
      popular: false,
      priceId: 'price_enterprise_subscription',
      amount: 249,
    },
  ];

  const handleSubscribe = async (plan: any) => {
    if (plan.id === 'free') return;
    setLoadingPlan(plan.id);
    setMessage(null);

    try {
      if (paymentMethod === 'stripe') {
        const { data } = await api.post('/payments/checkout', {
          priceId: plan.priceId,
          amount: plan.amount,
          type: 'SUBSCRIPTION',
        });

        if (data.data.url) {
          if (data.data.url.includes('mock=true')) {
            setMessage(`¡Suscripción al plan ${plan.name} activada con éxito (Modo Sandbox)!`);
          } else {
            window.location.href = data.data.url;
          }
        }
      } else {
        // Binance Pay
        const { data } = await api.post('/payments/crypto/create-order', {
          amount: plan.amount,
          currency: 'USDT',
          plan: plan.id,
        });

        setMessage(`¡Orden generada en Binance Pay por ${plan.amount} USDT (Sandbox)!`);
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error al procesar la suscripción.');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Membresías & Planes</span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Acelera tu Crecimiento en la Incubadora
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
          Selecciona el plan que mejor se adapte a tu etapa de levantamiento o tesis de inversión.
        </p>

        {/* Payment Method Switcher */}
        <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 dark:bg-slate-800 p-1.5 mt-4">
          <button
            onClick={() => setPaymentMethod('stripe')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              paymentMethod === 'stripe'
                ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
            <span>Stripe (Tarjeta / Fiat)</span>
          </button>
          <button
            onClick={() => setPaymentMethod('binance')}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition ${
              paymentMethod === 'binance'
                ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5 text-amber-500" />
            <span>Binance Pay (Cripto USDT)</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-2xl bg-teal-50 p-4 text-xs font-semibold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 text-center max-w-md mx-auto">
          {message}
        </div>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`flex flex-col justify-between rounded-3xl p-8 border transition-all relative ${
              plan.popular
                ? 'border-teal-500 bg-white dark:bg-slate-900 shadow-xl shadow-teal-500/10 ring-2 ring-teal-500'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-teal-600 px-3.5 py-1 text-[11px] font-bold text-white uppercase tracking-wider">
                Más Popular
              </span>
            )}

            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{plan.description}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-xs text-slate-500">{plan.period}</span>}
              </div>

              <div className="mt-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                    <Check className="h-4 w-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                disabled={plan.id === 'free' || loadingPlan === plan.id}
                onClick={() => handleSubscribe(plan)}
                className={`w-full rounded-2xl py-3 text-xs font-bold transition shadow-sm ${
                  plan.popular
                    ? 'bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50'
                    : plan.id === 'free'
                    ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 cursor-default'
                    : 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700'
                }`}
              >
                {loadingPlan === plan.id ? 'Procesando...' : plan.cta}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
