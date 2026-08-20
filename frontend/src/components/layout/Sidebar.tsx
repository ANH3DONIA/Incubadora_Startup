'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Building2,
  Video,
  ShoppingBag,
  Calendar,
  CreditCard,
  Users,
  FileText,
  DollarSign,
  Settings,
  Menu,
  X,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const role = user.role;

  const links = [
    {
      title: 'Panel General',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ENTREPRENEUR', 'INVESTOR', 'ADMIN'],
    },
    // Entrepreneur links
    {
      title: 'Mi Startup & Deck',
      href: '/my-startup',
      icon: Building2,
      roles: ['ENTREPRENEUR'],
    },
    {
      title: 'Gestionar Pitches',
      href: '/my-startup/pitch-sessions',
      icon: Video,
      roles: ['ENTREPRENEUR'],
    },
    // Investor links
    {
      title: 'Marketplace Startups',
      href: '/marketplace',
      icon: ShoppingBag,
      roles: ['INVESTOR', 'ADMIN'],
    },
    // Shared links
    {
      title: 'Calendario & Eventos',
      href: '/events',
      icon: Calendar,
      roles: ['ENTREPRENEUR', 'INVESTOR', 'ADMIN'],
    },
    {
      title: 'Membresías & Planes',
      href: '/pricing',
      icon: CreditCard,
      roles: ['ENTREPRENEUR', 'INVESTOR'],
    },
    {
      title: 'Mi Perfil & Ajustes',
      href: '/settings',
      icon: Settings,
      roles: ['ENTREPRENEUR', 'INVESTOR', 'ADMIN'],
    },
    // Admin links
    {
      title: 'Gestión de Usuarios',
      href: '/admin/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      title: 'Auditoría & Logs',
      href: '/admin/audit',
      icon: FileText,
      roles: ['ADMIN'],
    },
    {
      title: 'Finanzas de Plataforma',
      href: '/admin/finances',
      icon: DollarSign,
      roles: ['ADMIN'],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full space-y-6">
      <div className="space-y-6">
        {/* User Card */}
        <div className="px-3.5 py-3 bg-slate-50/80 dark:bg-[#0b0f19] border border-slate-100 dark:border-slate-800/80 rounded-xl">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cuenta Activa</p>
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
            {user.firstName} {user.lastName}
          </p>
          <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-semibold rounded-md bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-500/20 uppercase tracking-wider">
            {role === 'ENTREPRENEUR' ? 'Fundador' : role === 'INVESTOR' ? 'Inversionista' : 'Administrador'}
          </span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {filteredLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3.5 bg-gradient-to-br from-blue-600/5 to-indigo-600/10 border border-blue-500/15 rounded-xl text-center">
        <p className="text-xs text-blue-700 dark:text-blue-300 font-bold">IncubaTech Pro</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Rondas de inversión y salas de pitch</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Trigger Bar */}
      <div className="md:hidden flex items-center justify-between p-3.5 bg-white dark:bg-[#030712] border-b border-slate-200 dark:border-slate-800 w-full sticky top-16 z-30">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Menú de Navegación</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-xs font-bold"
          aria-label="Abrir menú de navegación"
        >
          {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span>{mobileOpen ? 'Cerrar' : 'Menú'}</span>
        </button>
      </div>

      {/* Mobile Overlay Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm pt-32 p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#0b0f19] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 max-w-xs w-full h-[calc(100vh-10rem)] overflow-y-auto">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-[#030712] min-h-[calc(100vh-4rem)] p-4 flex-col justify-between shrink-0">
        {sidebarContent}
      </aside>
    </>
  );
};


