'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  Rocket,
  LogOut,
  User,
  Settings,
  Building2,
  Video,
  LayoutDashboard,
  Shield,
  ChevronDown,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, initAuth } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    router.push('/login');
  };

  const isPitchRoom = pathname.startsWith('/pitch-room');
  if (isPitchRoom) return null;

  const roleLabel =
    user?.role === 'ENTREPRENEUR'
      ? 'Fundador'
      : user?.role === 'INVESTOR'
      ? 'Inversor'
      : 'Admin';

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-[#030712]/95">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white group-hover:scale-105 transition-transform">
            <Rocket className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Incuba<span className="text-blue-600 dark:text-blue-400 font-extrabold">Tech</span>
              </span>
              <span className="rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                PRO
              </span>
            </div>
          </div>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <Link
            href="/marketplace"
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
              pathname === '/marketplace' ? 'text-blue-600 font-bold dark:text-blue-400' : ''
            }`}
          >
            Marketplace
          </Link>
          <Link
            href="/events"
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
              pathname === '/events' ? 'text-blue-600 font-bold dark:text-blue-400' : ''
            }`}
          >
            Eventos & Pitches
          </Link>
          <Link
            href="/pricing"
            className={`hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
              pathname === '/pricing' ? 'text-blue-600 font-bold dark:text-blue-400' : ''
            }`}
          >
            Membresías
          </Link>
        </nav>

        {/* User / Auth Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-slate-50/80 p-1.5 pr-3 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:bg-slate-800 transition"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.firstName}
                      className="h-8 w-8 rounded-lg object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>

                {/* Name & Role */}
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                    {roleLabel}
                  </p>
                </div>

                <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-[#0b0f19] z-50 animate-fade-in space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    <LayoutDashboard className="h-4 w-4 text-blue-500" />
                    <span>Panel General</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                  >
                    <Settings className="h-4 w-4 text-indigo-500" />
                    <span>Mi Perfil & Ajustes</span>
                  </Link>

                  {user.role === 'ENTREPRENEUR' && (
                    <>
                      <Link
                        href="/my-startup"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                      >
                        <Building2 className="h-4 w-4 text-blue-500" />
                        <span>Mi Startup & Pitch Deck</span>
                      </Link>

                      <Link
                        href="/my-startup/pitch-sessions"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                      >
                        <Video className="h-4 w-4 text-indigo-500" />
                        <span>Gestionar Pitches</span>
                      </Link>
                    </>
                  )}

                  {user.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                    >
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Panel Administrador</span>
                    </Link>
                  )}

                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 dark:text-slate-200 transition"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition"
              >
                Comenzar Ahora
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

