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
  CreditCard,
  Receipt,
  Download,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'company' | 'billing'>('profile');
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

  // Billing state
  const [cancellingSub, setCancellingSub] = useState(false);
  const [billingMessage, setBillingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleCancelSubscription = async () => {
    if (!confirm('¿Estás seguro de que deseas cancelar la renovación de tu membresía?')) return;
    setCancellingSub(true);
    setBillingMessage(null);
    try {
      await api.post('/payments/subscriptions/cancel');
      setBillingMessage({
        type: 'success',
        text: 'Tu membresía ha sido cancelada exitosamente. Tu plan cambiará a Free Starter.',
      });
      const profileRes = await api.get('/auth/profile');
      if (profileRes.data?.data) {
        useAuthStore.getState().setUser(profileRes.data.data);
        setProfileData(profileRes.data.data);
      }
    } catch (err: any) {
      setBillingMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al cancelar la membresía.',
      });
    } finally {
      setCancellingSub(false);
    }
  };

  const handleDownloadReceiptTxt = (invId: string, planName: string, amount: number, date: string) => {
    const content = `
============================================================
                INCUBATECH PLATFORM LLC
          COMPROBANTE OFICIAL DE SUSCRIPCIÓN DIGITAL
============================================================
No. de Factura:   ${invId}
Fecha y Hora:     ${date}
Estado:           PAGADO / APROBADO
------------------------------------------------------------
DATOS DEL CLIENTE:
Nombre:           ${user?.firstName} ${user?.lastName}
Email:            ${user?.email}
Rol:              ${user?.role}
------------------------------------------------------------
DESGLOSE:
Concepto:         ${planName} (Vigencia 30 Días)
Método de Pago:   Visa •••• 4242 / Binance Pay
------------------------------------------------------------
TOTAL:            $${amount}.00 USD
============================================================
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibo-${invId}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  const currentPlan = profileData?.subscription?.plan || user?.subscription?.plan || 'FREE';
  const planStatus = profileData?.subscription?.status || user?.subscription?.status || 'ACTIVE';
  const periodEndFormatted = formatDate(profileData?.subscription?.currentPeriodEnd || user?.subscription?.currentPeriodEnd || new Date(Date.now() + 30 * 24 * 3600 * 1000));

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Ajustes de Cuenta & Perfil
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Administra tus datos personales, foto de perfil, credenciales, membresías y facturación
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Perfil Personal</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'security'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Seguridad & Claves</span>
        </button>

        <button
          onClick={() => setActiveTab('company')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'company'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>{user?.role === 'ENTREPRENEUR' ? 'Mi Empresa' : 'Actividad Inversora'}</span>
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition ${
            activeTab === 'billing'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Facturación & Membresía</span>
        </button>
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <form onSubmit={handleUpdateProfile} className="space-y-6 animate-fade-in">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Información de Identidad
            </h3>

            {profileMessage && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border ${
                  profileMessage.type === 'success'
                    ? 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {profileMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span>{profileMessage.text}</span>
              </div>
            )}

            {/* Direct Computer Photo Upload Area */}
            <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800/80">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
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
                  className="relative group cursor-pointer h-20 w-20 shrink-0 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-xl flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    initials
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-all backdrop-blur-[2px]">
                    <Camera className="h-5 w-5" />
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
                  className={`flex-1 w-full rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-left space-y-0.5">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Sube una foto desde tu computadora</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Arrastra tu imagen aquí o haz clic para explorar (JPG, PNG o WebP hasta 5MB).
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition flex items-center gap-1.5"
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
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 transition flex items-center gap-1"
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
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Apellido
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  disabled
                  value={profileData?.email || user?.email || ''}
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 py-2.5 pl-10 pr-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400">El correo electrónico está vinculado a tu cuenta y tokens de sesión.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
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
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              Cambiar Contraseña
            </h3>

            {securityMessage && (
              <div
                className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border ${
                  securityMessage.type === 'success'
                    ? 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                    : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
                }`}
              >
                {securityMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                )}
                <span>{securityMessage.text}</span>
              </div>
            )}

            <div className="space-y-4 max-w-lg">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Al menos 8 caracteres..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingPassword || !currentPassword || !newPassword || newPassword !== confirmPassword}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition"
              >
                {savingPassword ? 'Cambiando clave...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* TAB 3: COMPANY */}
      {activeTab === 'company' && (
        <div className="space-y-6 animate-fade-in">
          {user?.role === 'ENTREPRENEUR' ? (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    Mi Empresa / Startup
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Datos registrados en el ecosistema de incubación</p>
                </div>

                <Link
                  href="/my-startup"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  <span>Editar Startup</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {profileData?.startup ? (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white">
                        {profileData.startup.name}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {profileData.startup.industry} • {profileData.startup.stage}
                      </p>
                    </div>
                    <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      Ronda Activa
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Meta de Fondeo</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatCurrency(profileData.startup.fundingGoal)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Recaudado</p>
                      <p className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(profileData.startup.amountRaised)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center space-y-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Aún no has registrado tu startup en la incubadora.
                  </p>
                  <Link
                    href="/my-startup"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Registrar Startup Ahora</span>
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Perfil de Inversionista
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tu cuenta cuenta con credenciales activas para evaluar pitches en tiempo real y ejecutar micro-inversiones.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                <span>Explorar Directorio de Startups</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: BILLING & INVOICES */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-fade-in">
          {billingMessage && (
            <div
              className={`flex items-center gap-2 rounded-xl p-3.5 text-xs font-medium border ${
                billingMessage.type === 'success'
                  ? 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-300'
                  : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/50 dark:text-red-300'
              }`}
            >
              {billingMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              <span>{billingMessage.text}</span>
            </div>
          )}

          {/* Current Subscription Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-7 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Membresía Activa
                </span>
                <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
                  Plan {currentPlan === 'ENTERPRISE' ? 'VC & Fund Suite' : currentPlan === 'PRO' ? 'Pro Incubator' : 'Free Starter'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {currentPlan !== 'FREE'
                    ? `Tu plan incluye Quick Pitches ilimitados, Pitch Decks cifrados y Matchmaking prioritario.`
                    : `Plan gratuito básico con 1 pitch mensual y perfil estándar en marketplace.`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  planStatus === 'ACTIVE'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800'
                    : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
                }`}>
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  {planStatus === 'ACTIVE' ? 'Activo' : 'Cancelado'}
                </span>

                <Link
                  href="/pricing"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
                >
                  {currentPlan === 'FREE' ? 'Mejorar a Pro' : 'Cambiar de Plan'}
                </Link>
              </div>
            </div>

            {/* Plan Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400">Próxima Renovación</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {currentPlan !== 'FREE' ? periodEndFormatted : 'Sin expiración'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400">Tarifa Mensual</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  {currentPlan === 'ENTERPRISE' ? '$249.00 USD / mes' : currentPlan === 'PRO' ? '$49.00 USD / mes' : '$0.00 USD'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] font-bold uppercase text-slate-400">Método de Pago</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Visa •••• 4242</span>
                </p>
              </div>
            </div>

            {currentPlan !== 'FREE' && (
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  disabled={cancellingSub}
                  onClick={handleCancelSubscription}
                  className="text-xs font-semibold text-red-500 hover:text-red-700 dark:text-red-400 transition"
                >
                  {cancellingSub ? 'Cancelando...' : 'Cancelar renovación automática'}
                </button>
              </div>
            )}
          </div>

          {/* Billing & Invoices Table */}
          <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden dark:border-slate-800/80 dark:bg-[#0b0f19]">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Historial de Facturas & Recibos Digitales
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Descarga tus comprobantes oficiales con validez fiscal
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 uppercase text-[10px] font-bold text-slate-400 dark:border-slate-800 dark:bg-slate-900/60">
                  <tr>
                    <th className="p-4">No. Factura</th>
                    <th className="p-4">Concepto</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Monto</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {currentPlan !== 'FREE' ? (
                    <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="p-4 font-mono font-bold text-slate-900 dark:text-white">
                        #INV-2026-8941
                      </td>
                      <td className="p-4 text-slate-700 dark:text-slate-300 font-semibold">
                        Membresía {currentPlan === 'ENTERPRISE' ? 'VC & Fund Suite' : 'Pro Incubator'} (30 Días)
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400">
                        {formatDate(new Date())}
                      </td>
                      <td className="p-4 font-bold text-slate-900 dark:text-white">
                        ${currentPlan === 'ENTERPRISE' ? '249.00' : '49.00'} USD
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Pagado
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDownloadReceiptTxt('INV-2026-8941', currentPlan === 'ENTERPRISE' ? 'VC & Fund Suite' : 'Pro Incubator', currentPlan === 'ENTERPRISE' ? 249 : 49, formatDate(new Date()))}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        >
                          <Download className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                          <span>Descargar Recibo</span>
                        </button>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No tienes facturas emitidas en el plan Free Starter. Al contratar un plan Pro se generarán aquí automáticamente.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
