'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  Rocket,
  Lock,
  Mail,
  User,
  Building2,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  ShieldCheck,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const [role, setRole] = useState<'ENTREPRENEUR' | 'INVESTOR'>('ENTREPRENEUR');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorDetails, setErrorDetails] = useState<{ general: string; fields: Record<string, string> } | null>(null);

  // Real-time password requirement flags
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&#^()_.\-]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDetails(null);

    // Pre-flight client check
    if (!isPasswordValid) {
      setErrorDetails({
        general: 'La contraseña no cumple con todos los requisitos de seguridad.',
        fields: { password: 'Revisa la lista de requisitos marcada en rojo abajo.' },
      });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', {
        email,
        password,
        firstName,
        lastName,
        role,
      });

      const { user, tokens } = data.data;
      login(tokens.accessToken, tokens.refreshToken, user);
      router.push('/dashboard');
    } catch (err: any) {
      const resp = err.response?.data;
      const fieldErrorsMap: Record<string, string> = {};

      if (Array.isArray(resp?.errors)) {
        resp.errors.forEach((item: any) => {
          if (item.field) {
            fieldErrorsMap[item.field] = item.message;
          }
        });
      }

      setErrorDetails({
        general: resp?.message || 'Error al registrar la cuenta. Revisa los campos resaltados.',
        fields: fieldErrorsMap,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-8 shadow-2xl dark:border-slate-800/80 dark:bg-[#0e1526] space-y-6 animate-fade-in">
        {/* Top Header */}
        <div className="text-center space-y-2">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/25">
            <Rocket className="h-7 w-7" />
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Nexus<span className="text-teal-500">Ventures</span>
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Crea tu Cuenta</h2>
          <p className="text-xs text-slate-500">Únete al ecosistema de venture capital e incubación en vivo</p>
        </div>

        {/* Role Selector Tabs */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 text-center">
            Tipo de Perfil
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('ENTREPRENEUR')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                role === 'ENTREPRENEUR'
                  ? 'border-teal-600 bg-teal-500/10 text-teal-900 dark:text-teal-300 ring-2 ring-teal-500/30 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Building2 className={`h-6 w-6 ${role === 'ENTREPRENEUR' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold">🚀 Soy Fundador</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Levantar capital & Pitch Rooms</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setRole('INVESTOR')}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all text-center ${
                role === 'INVESTOR'
                  ? 'border-teal-600 bg-teal-500/10 text-teal-900 dark:text-teal-300 ring-2 ring-teal-500/30 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Briefcase className={`h-6 w-6 ${role === 'INVESTOR' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
              <div>
                <p className="text-xs font-bold">💼 Soy Inversor</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Explorar Startups & Evaluar Pitches</p>
              </div>
            </button>
          </div>
        </div>

        {errorDetails && (
          <div className="rounded-2xl bg-red-50 p-4 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{errorDetails.general}</span>
            </div>
            {Object.keys(errorDetails.fields).length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 pl-1">
                {Object.entries(errorDetails.fields).map(([field, msg]) => (
                  <li key={field}>
                    <b>{field === 'password' ? 'Contraseña' : field === 'email' ? 'Email' : field === 'firstName' ? 'Nombre' : 'Apellido'}:</b> {msg}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Nombre
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Carlos"
                className={`w-full rounded-2xl border bg-slate-50 py-3 px-4 text-xs text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white transition ${
                  errorDetails?.fields?.firstName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-teal-500 dark:border-slate-700'
                }`}
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Apellido
              </label>
              <input
                type="text"
                required
                minLength={2}
                maxLength={50}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Pérez"
                className={`w-full rounded-2xl border bg-slate-50 py-3 px-4 text-xs text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white transition ${
                  errorDetails?.fields?.lastName
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-teal-500 dark:border-slate-700'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="carlos@startup.com"
                className={`w-full rounded-2xl border bg-slate-50 py-3 pl-11 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white transition ${
                  errorDetails?.fields?.email
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-teal-500 dark:border-slate-700'
                }`}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña segura"
                className={`w-full rounded-2xl border bg-slate-50 py-3 pl-11 pr-11 text-xs text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white transition ${
                  errorDetails?.fields?.password
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-slate-200 focus:ring-teal-500 dark:border-slate-700'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Interactive Live Password Requirements Checklist */}
            <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 space-y-1.5 mt-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Requisitos de Seguridad de Contraseña:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-medium">
                <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                  {hasMinLength ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 ml-1" />}
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                  {hasUppercase ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 ml-1" />}
                  <span>Una mayúscula (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                  {hasLowercase ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 ml-1" />}
                  <span>Una minúscula (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                  {hasNumber ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 ml-1" />}
                  <span>Un número (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 sm:col-span-2 ${hasSpecial ? 'text-teal-600 dark:text-teal-400 font-bold' : 'text-slate-400'}`}>
                  {hasSpecial ? <Check className="h-3.5 w-3.5 text-teal-600" /> : <div className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700 ml-1" />}
                  <span>Un símbolo (@$!%*?&#^()_.-)</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 py-3.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-60 shadow-lg shadow-teal-600/25 transition mt-2"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
}


