'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Building2, Upload, Lock, CheckCircle2, AlertCircle, ShieldCheck, DollarSign, Sparkles, FileCheck2 } from 'lucide-react';

export default function MyStartupPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [startup, setStartup] = useState<any>(null);

  // Form fields with safe initial values
  const [name, setName] = useState('');
  const [industry, setIndustry] = useState('Fintech');
  const [stage, setStage] = useState('Seed');
  const [fundingGoal, setFundingGoal] = useState<number | string>(100000);
  const [description, setDescription] = useState('');

  // Pitch Deck upload
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchStartup = async () => {
      try {
        const { data } = await api.get('/startups/my');
        if (data.data) {
          setStartup(data.data);
          setName(data.data.name || '');
          setIndustry(data.data.industry || 'Fintech');
          setStage(data.data.stage || 'Seed');
          setFundingGoal(data.data.fundingGoal || 100000);
          setDescription(data.data.description || '');
        }
      } catch (err) {
        console.error('Error fetching my startup:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStartup();
  }, []);

  const numFundingGoal = typeof fundingGoal === 'string' ? parseFloat(fundingGoal) || 0 : fundingGoal;
  const isGoalValid = numFundingGoal >= 1000 && numFundingGoal <= 50_000_000;
  const isNameValid = name.trim().length >= 2 && name.trim().length <= 80;
  const isDescValid = description.trim().length >= 10 && description.trim().length <= 2000;

  const handleSaveStartup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!isNameValid) {
      setMessage({ type: 'error', text: 'El nombre debe tener entre 2 y 80 caracteres.' });
      return;
    }
    if (!isGoalValid) {
      setMessage({ type: 'error', text: 'La meta de fondeo debe estar entre $1,000 USD y $50,000,000 USD.' });
      return;
    }
    if (!isDescValid) {
      setMessage({ type: 'error', text: 'La descripción debe tener entre 10 y 2,000 caracteres.' });
      return;
    }

    setSaving(true);

    try {
      if (startup) {
        // Update
        const { data } = await api.put(`/startups/${startup.id}`, {
          name: name.trim(),
          industry,
          stage,
          fundingGoal: numFundingGoal,
          description: description.trim(),
        });
        setStartup(data.data);
        setMessage({ type: 'success', text: '¡Datos de startup actualizados exitosamente!' });
      } else {
        // Create
        const { data } = await api.post('/startups', {
          name: name.trim(),
          industry,
          stage,
          fundingGoal: numFundingGoal,
          description: description.trim(),
        });
        setStartup(data.data);
        setMessage({ type: 'success', text: '¡Startup registrada con éxito! Ya puedes subir tu Pitch Deck cifrado.' });
      }
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al guardar la información de la startup.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadDeck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !startup) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: 'El archivo debe ser un documento PDF.' });
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El archivo no puede exceder 25 MB.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('pitchDeck', file);

    try {
      const { data } = await api.post(`/startups/${startup.id}/pitch-deck`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setStartup(data.data);
      setFile(null);
      setMessage({
        type: 'success',
        text: '¡Pitch Deck PDF cifrado con AES-256 en servidor y guardado con éxito!',
      });
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Error al subir el pitch deck.',
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <LoadingSpinner size="lg" label="Cargando perfil de startup..." />;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <Sparkles className="h-3.5 w-3.5" />
              Gestión de Emprendimiento
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">
            {startup ? `Perfil: ${startup.name}` : 'Registrar Nueva Startup'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configura los datos clave de tu proyecto, tu ronda de inversión y tu Pitch Deck confidencial
          </p>
        </div>

        {startup && (
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 dark:border-slate-800 dark:bg-[#0b0f19]">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">Startup Publicada</span>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`flex items-center gap-3 rounded-xl p-3.5 text-xs font-semibold border ${
            message.type === 'success'
              ? 'border-blue-500/30 bg-blue-50 text-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
              : 'border-red-500/30 bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Main Info Form */}
      <form onSubmit={handleSaveStartup} className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <Building2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Información de la Compañía
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">* Campos obligatorios auditados</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Nombre de la Startup
              </label>
              <span className={`text-[11px] font-mono ${name.length > 80 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                {name.length}/80
              </span>
            </div>
            <input
              type="text"
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. FinNext Technologies"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Meta de Fondeo (USD)
              </label>
              <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                {numFundingGoal ? formatCurrency(numFundingGoal) : '$0 USD'}
              </span>
            </div>

            {/* Quick preset amount pills */}
            <div className="flex flex-wrap gap-1.5 mb-2">
              {[50000, 100000, 500000, 1000000, 5000000, 10000000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setFundingGoal(amt.toString())}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-semibold transition border ${
                    numFundingGoal === amt
                      ? 'border-blue-600 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-blue-500 hover:text-blue-600'
                  }`}
                >
                  ${(amt / 1000 >= 1000 ? `${amt / 1000000}M` : `${amt / 1000}K`)}
                </button>
              ))}
            </div>

            <div className="relative">
              <DollarSign className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                inputMode="numeric"
                required
                maxLength={10}
                value={fundingGoal ? Number(fundingGoal).toLocaleString('en-US') : ''}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  if (!clean) {
                    setFundingGoal('');
                    return;
                  }
                  const truncated = clean.slice(0, 8);
                  const num = parseInt(truncated, 10);
                  if (num > 50_000_000) {
                    setFundingGoal('50000000');
                  } else {
                    setFundingGoal(num.toString());
                  }
                }}
                placeholder="100,000"
                className={`w-full rounded-xl border bg-slate-50 py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white transition ${
                  isGoalValid
                    ? 'border-slate-200 focus:ring-blue-500 dark:border-slate-700'
                    : 'border-red-400 focus:ring-red-500 dark:border-red-500'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Rango auditado: Min $1,000 USD — Máx $50,000,000 USD (Máximo 8 dígitos)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Industria / Sector
            </label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
            >
              <option value="Fintech">Fintech (Finanzas & Pagos)</option>
              <option value="AI">AI & Machine Learning</option>
              <option value="Healthtech">Healthtech (Salud & Biotecnología)</option>
              <option value="Cleantech">Cleantech & Sustentabilidad</option>
              <option value="E-commerce">E-commerce & Logística</option>
              <option value="Edtech">Edtech (Educación)</option>
              <option value="Web3">Web3 & Cripto</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Etapa (Stage de Inversión)
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
            >
              <option value="Pre-Seed">Pre-Seed (Idea / MVP Inicial)</option>
              <option value="Seed">Seed (Producto en Mercado)</option>
              <option value="Series A">Series A (Crecimiento Acelerado)</option>
              <option value="Series B">Series B+ (Expansión Global)</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Descripción y Propuesta de Valor
            </label>
            <span className={`text-[11px] font-mono ${description.length > 2000 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
              {description.length}/2,000
            </span>
          </div>
          <textarea
            rows={4}
            required
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe el problema que resuelves, tu tracción, modelo de negocio y para qué se utilizarán los fondos..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={saving || !isNameValid || !isGoalValid || !isDescValid}
          className="w-full sm:w-auto rounded-xl bg-blue-600 px-7 py-3 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition-all hover:scale-[1.02]"
        >
          {saving ? 'Validando y Guardando...' : startup ? 'Guardar Cambios' : 'Crear Perfil de Startup'}
        </button>
      </form>

      {/* Pitch Deck Upload with AES-256 */}
      {startup && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 dark:border-slate-800/80 dark:bg-[#0b0f19] space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Pitch Deck Confidencial (Cifrado AES-256-GCM)
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-md border border-blue-500/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Seguridad Criptográfica
            </span>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Tu presentación en PDF se valida mediante Magic Bytes (`%PDF`) y se cifra en memoria con una clave simétrica AES-256-GCM antes de persistirse. Únicamente inversionistas verificados y evaluadores autorizados pueden descifrarla.
          </p>

          {startup.encryptedPitchDeck && (
            <div className="flex items-center gap-3 rounded-xl border border-blue-500/30 bg-blue-50/60 p-4 text-xs font-medium text-blue-950 dark:bg-blue-950/30 dark:text-blue-200">
              <FileCheck2 className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Pitch Deck activo y protegido</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  El archivo se encuentra debidamente cifrado en el servidor con AES-256-GCM. Puedes reemplazarlo subiendo un nuevo PDF.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleUploadDeck} className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-950/80 dark:file:text-blue-300"
            />
            <button
              type="submit"
              disabled={!file || uploading}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-800 dark:hover:bg-slate-700 transition flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              <span>{uploading ? 'Cifrando con AES-256-GCM...' : 'Subir y Cifrar Pitch Deck (PDF)'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

