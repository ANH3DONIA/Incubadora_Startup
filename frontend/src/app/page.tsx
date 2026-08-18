import React from 'react';
import Link from 'next/link';
import { Rocket, Video, ShieldCheck, TrendingUp, Users, ArrowRight, CheckCircle2, Lock } from 'lucide-react';
import { Footer } from '@/components/layout/Footer';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-24 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/30 via-slate-950 to-slate-950" />
        <div className="container relative mx-auto px-4 sm:px-8 text-center max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-1.5 text-xs font-semibold text-teal-300">
            <Rocket className="h-3.5 w-3.5" />
            <span>Incubación de Alto Rendimiento & Quick Pitches en Vivo</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Levanta Capital y Encuentra Startups en <span className="text-teal-400">Salas de Pitch de 5 Minutos</span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-400 leading-relaxed">
            La plataforma líder que une a fundadores visionarios con inversores ángeles y fondos VC. Presentaciones cronometradas en tiempo real, pitch decks cifrados con AES-256 y pagos seguros con Stripe y Binance Pay.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-8 py-4 text-base font-bold text-slate-950 hover:bg-teal-400 shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
            >
              <span>Presentar mi Startup</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/marketplace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-8 py-4 text-base font-bold text-white hover:bg-slate-800 transition"
            >
              <span>Explorar Marketplace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">$4.8M+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Capital Levantado</p>
          </div>
          <div>
            <p className="text-3xl font-black text-teal-600">320+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Startups Graduadas</p>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white">1,500+</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Quick Pitches Realizados</p>
          </div>
          <div>
            <p className="text-3xl font-black text-teal-600">98%</p>
            <p className="text-xs text-slate-500 font-medium mt-1">Tasa de Satisfacción VC</p>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600">Cómo Funciona</h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Un Proceso Diseñado para la Velocidad</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 font-bold dark:bg-teal-950 dark:text-teal-400">
                1
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Crea tu Perfil Cifrado</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Sube los datos de tu startup y tu Pitch Deck en PDF protegido con criptografía AES-256 de nivel militar.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-950 dark:text-indigo-400">
                2
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Quick Pitch en Vivo</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Presenta en vivo durante 5 minutos sincronizados ante decenas de inversionistas calificados con WebRTC ultra-rápido.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 font-bold dark:bg-emerald-950 dark:text-emerald-400">
                3
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Cierra Inversiones</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Recibe ofertas de inversión, agendas directas con Google Calendar y pagos fiat o cripto procesados al instante.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4 sm:px-8 max-w-5xl space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-teal-600">Tecnología de Vanguardia</h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white">Seguridad y Rendimiento Sin Compromisos</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white">
                <Video className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Salas WebSockets & WebRTC</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Streaming en baja latencia, chat en vivo y cronómetro centralizado que asegura la equidad de cada presentación.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                <Lock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Cifrado AES-256 de Decks</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Tus documentos confidenciales son cifrados antes de guardarse. Solo usuarios autorizados pueden desencriptarlos.
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
