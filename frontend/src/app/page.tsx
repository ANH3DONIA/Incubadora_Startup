import React from 'react';
import Link from 'next/link';
import { Rocket, Video, ShieldCheck, TrendingUp, Users, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#030712] text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/40 via-[#030712] to-[#030712]" />
        <div className="container relative mx-auto px-4 sm:px-8 text-center max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400">
            <Rocket className="h-3.5 w-3.5" />
            <span>Incubación de Alto Nivel & Quick Pitches Institucionales</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Levanta Capital y Conecta Startups en <span className="text-blue-500">Salas de Pitch de 5 Minutos</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed font-normal">
            La plataforma líder que une a fundadores con inversores ángeles y fondos VC. Presentaciones cronometradas en tiempo real, pitch decks cifrados con AES-256-GCM y liquidación de pagos regulada.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all hover:scale-[1.02]"
            >
              <span>Presentar mi Startup</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-[#0b0f19] px-8 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition"
            >
              <span>Explorar Marketplace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-slate-200/80 bg-white py-10 dark:border-slate-800/80 dark:bg-[#0b0f19]">
        <div className="container mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">$4.8M+</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Capital Levantado</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">320+</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Startups Graduadas</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 dark:text-white">1,500+</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Quick Pitches Realizados</p>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">98%</p>
            <p className="text-xs text-slate-400 font-medium mt-1">Tasa de Satisfacción VC</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-[#030712]">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="text-center space-y-2 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Metodología</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Diseñado para la Agilidad y el Rigor</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/60 dark:text-blue-400 border border-blue-500/20">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Perfil & Deck Cifrado</h4>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Sube la tesis de tu startup y tu Pitch Deck en PDF protegido mediante cifrado simétrico autenticado AES-256-GCM.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-500/20">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Quick Pitch en Vivo</h4>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Presenta en vivo durante 5 minutos sincronizados ante decenas de inversionistas calificados con WebRTC y Socket.IO.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 font-bold dark:bg-violet-950/60 dark:text-violet-400 border border-violet-500/20">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">Formalización de Ronda</h4>
              <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                Recibe cartas de intención de inversión, agendas con Google Calendar y pagos procesados con Stripe y Binance Pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Features Section */}
      <section className="py-20 bg-white dark:bg-[#0b0f19] border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Infraestructura</h2>
            <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">Seguridad y Rendimiento Institucional</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#030712]/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Video className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Salas WebSockets & WebRTC</h4>
                <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                  Streaming en baja latencia, chat en vivo y cronómetro centralizado que garantiza el control equitativo de los tiempos.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#030712]/50">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cifrado AES-256-GCM</h4>
                <p className="text-xs text-slate-500 leading-relaxed dark:text-slate-400">
                  Tus documentos confidenciales son cifrados en disco. Solo los usuarios con autorización RBAC pueden descargarlos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
