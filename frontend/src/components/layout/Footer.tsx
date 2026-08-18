import React from 'react';
import Link from 'next/link';
import { Rocket } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 bg-white py-12 dark:border-slate-800/80 dark:bg-[#070a13]">
      <div className="container mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white shadow-md shadow-teal-500/25">
                <Rocket className="h-4 w-4" />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white">
                Nexus<span className="text-teal-500">Ventures</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              El ecosistema integral de venture capital e incubación en vivo. Conectamos fundadores visionarios con inversores ángeles y fondos VC.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Plataforma</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li><Link href="/marketplace" className="hover:text-teal-600">Marketplace de Startups</Link></li>
              <li><Link href="/events" className="hover:text-teal-600">Salas de Pitch en Vivo</Link></li>
              <li><Link href="/pricing" className="hover:text-teal-600">Membresías y Precios</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Seguridad & VC</h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>Pitch Decks Cifrados AES-256</li>
              <li>Liquidaciones con Stripe & Binance Pay</li>
              <li>Salas WebRTC Ultra-Rápidas</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">Legal & Transparencia</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              © {new Date().getFullYear()} Nexus Ventures Inc. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

