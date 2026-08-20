import React from 'react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 dark:border-slate-800/80 dark:bg-[#030712]">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
                <Rocket className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Incuba<span className="text-blue-600 dark:text-blue-400 font-extrabold">Tech</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              El ecosistema integral de venture capital e incubación institucional. Conectamos fundadores visionarios con inversores ángeles y fondos VC.
            </p>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Plataforma</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/marketplace" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Marketplace de Startups</Link></li>
              <li><Link href="/events" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Salas de Pitch en Vivo</Link></li>
              <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Membresías y Precios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Seguridad & VC</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Pitch Decks Cifrados AES-256-GCM</li>
              <li>Liquidaciones con Stripe & Binance Pay</li>
              <li>Salas WebRTC Ultra-Rápidas</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Legal & Transparencia</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              © {new Date().getFullYear()} IncubaTech Inc. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

