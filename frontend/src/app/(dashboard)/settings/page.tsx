'use client';

import React, { useEffect, useState, useRef } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatDate } from '@/lib/utils';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import Link from 'next/link';
import {
  User,
  Shield,
  Building2,
  Lock,
  Key,
  CheckCircle2,
  AlertCircle,
  Camera,
  Mail,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Upload,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'company'>('profile');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Security Form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/auth/profile');
        setProfileData(data.data);
        setFirstName(data.data.firstName || '');
        setLastName(data.data.lastName || '');
        setAvatarUrl(data.data.avatarUrl || '');
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Process & compress uploaded image file from user's computer
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setProfileMessage({ type: 'error', text: 'Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileMessage({ type: 'error', text: 'La imagen supera el límite de 5MB. Por favor elige una imagen más ligera.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas for square cropping & compression
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 400;
        let width = img.width;
        let height = img.height;

        // Calculate square crop from center
        const minDim = Math.min(width, height);
        const startX = (width - minDim) / 2;
        const startY = (height - minDim) / 2;

        canvas.width = MAX_SIZE;
        canvas.height = MAX_SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatarUrl(compressedDataUrl);
          setProfileMessage({
            type: 'success',
            text: '¡Foto cargada desde tu equipo! Haz clic en "Guardar Cambios" para confirmar.',
          });
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Cargando tus ajustes..." />;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);

    try {
      const { data } = await api.put('/auth/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarUrl: avatarUrl ? avatarUrl : null,
      });

      if (user) {
        setUser({
          ...user,
          firstName: data.data.firstName,
          lastName: data.data.lastName,
          avatarUrl: data.data.avatarUrl,
        });
      }

      setProfileMessage({
        type: 'success',
        text: '¡Tu perfil y foto han sido actualizados exitosamente!',
      });
    } catch (err: any) {
      setProfileMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al actualizar el perfil.',
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityMessage(null);

    if (newPassword !== confirmPassword) {
      setSecurityMessage({
        type: 'error',
        text: 'La nueva contraseña y su confirmación no coinciden.',
      });
      return;
    }

    setSavingPassword(true);

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });

      setSecurityMessage({
        type: 'success',
        text: '¡Contraseña actualizada exitosamente! Tus sesiones previas han sido aseguradas.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al cambiar la contraseña.',
      });
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
          Ajustes de Cuenta & Perfil
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Administra tus datos personales, foto de perfil, credenciales y vínculos corporativos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'profile'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Perfil Personal</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'security'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Seguridad & Claves</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
            activeTab === 'company'
              ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>{user?.role === 'ENTREPRENEUR' ? 'Mi Empresa' : 'Actividad Inversora'}</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Información de Identidad
            </h3>

            {profileMessage && (
              <div
                className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-semibold border ${
                  profileMessage.type === 'success'
                    ? 'border-teal-500/30 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-300'
                    : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            {/* Direct Computer Photo Upload Area */}
            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                Foto de Perfil
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp, image/jpg"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar Preview */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative group cursor-pointer h-24 w-24 shrink-0 rounded-3xl bg-gradient-to-tr from-teal-500 to-emerald-600 text-white font-black text-2xl shadow-xl shadow-teal-500/20 flex items-center justify-center overflow-hidden border-2 border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all backdrop-blur-[2px]">
                    <Camera className="h-6 w-6" />
                    <span className="text-[9px] font-bold mt-1">Cambiar</span>
                  </div>
                </div>

                {/* Dropzone & Buttons */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex-1 w-full rounded-2xl border-2 border-dashed p-5 text-center transition-all ${
                    isDragging
                      ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left space-y-1">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Upload className="h-4 w-4 text-teal-600" />
                        <span>Sube una foto desde tu computadora</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Arrastra y suelta tu imagen aquí o haz clic para explorar tus archivos (JPG, PNG o WebP hasta 5MB).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20 transition flex items-center gap-1.5"
                      >
                        <ImageIcon className="h-3.5 w-3.5" />
                        <span>Seleccionar Foto</span>
                      </button>

                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setAvatarUrl('');
                            setProfileMessage({ type: 'success', text: 'Foto eliminada. Guarda los cambios para aplicar.' });
                          }}
                          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 transition flex items-center gap-1"
                          title="Eliminar foto de perfil"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Quitar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                  disabled
                  value={profileData?.email || user?.email || ''}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 py-3 pl-11 pr-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400">El correo electrónico está vinculado a tu cuenta y tokens de sesión.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-2xl bg-teal-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 transition"
              >
                {savingProfile ? 'Guardando...' : 'Guardar Cambios de Perfil'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: SECURITY */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="space-y-6 animate-fade-in">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-teal-600" />
              Cambiar Contraseña
            </h3>

            {securityMessage && (
              <div
                className={`flex items-center gap-2 rounded-2xl p-4 text-xs font-semibold border ${
                  securityMessage.type === 'success'
                    ? 'border-teal-500/30 bg-teal-50 text-teal-900 dark:bg-teal-950/50 dark:text-teal-300'
                    : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {securityMessage.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 text-teal-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
                )}
                <span>{securityMessage.text}</span>
              </div>
            )}

            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  Debe incluir 8+ caracteres, mayúscula, minúscula, número y símbolo especial.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="rounded-2xl bg-teal-600 px-6 py-3.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50 shadow-md shadow-teal-600/20 transition"
                >
                  {savingPassword ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: COMPANY / INVESTOR */}
      {activeTab === 'company' && (
        <div className="space-y-6 animate-fade-in">
          {user?.role === 'ENTREPRENEUR' ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-teal-600" />
                    Mi Empresa / Startup
                  </h3>
                  <p className="text-xs text-slate-500">Datos registrados en el ecosistema de incubación</p>
                </div>

                <Link
                  href="/my-startup"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 shadow-sm"
                >
                  <span>Editar Startup</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {profileData?.startup ? (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-black text-slate-900 dark:text-white">
                        {profileData.startup.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {profileData.startup.industry} • {profileData.startup.stage}
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-bold text-teal-600 dark:text-teal-400 border border-teal-500/20">
                      Ronda Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Meta de Fondeo</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {formatCurrency(profileData.startup.fundingGoal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Recaudado</p>
                      <p className="text-sm font-bold text-teal-600 dark:text-teal-400">
                        {formatCurrency(profileData.startup.amountRaised)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Aún no has registrado tu startup en la incubadora.
                  </p>
                  <Link
                    href="/my-startup"
                    className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Registrar Startup Ahora</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-[#0e1526] space-y-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                Perfil de Inversionista
              </h3>
              <p className="text-xs text-slate-500">
                Tu cuenta cuenta con credenciales activas para evaluar pitches en tiempo real y ejecutar micro-inversiones.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-teal-700 shadow-md shadow-teal-600/20"
              >
                <span>Explorar Directorio de Startups</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
