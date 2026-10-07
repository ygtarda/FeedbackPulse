'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, LoginDto } from '@feedbackpulse/types';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import { Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginDto>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: 'demo@acmesaas.com',
      password: 'Password123!',
      tenantSlug: 'acme',
    },
  });

  const onSubmit = async (data: LoginDto) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiClient.login(data);
      setAuth(response);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Giriş yapılamadı. Bilgilerinizi kontrol ediniz.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Header Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              Feedback<span className="text-indigo-500">Pulse</span>
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Hesabınıza Giriş Yapın</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Geri bildirim panolarınızı ve yol haritanızı yönetin
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-xl">
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                E-posta Adresi
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="ahmet@sirket.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-foreground">Şifre</label>
                <Link href="/forgot-password" className="text-xs text-indigo-500 hover:underline">
                  Şifremi unuttum
                </Link>
              </div>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Şirket / Çalışma Alanı Alt Alan Adı (Opsiyonel)
              </label>
              <div className="flex rounded-xl border border-border bg-background overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
                <input
                  type="text"
                  {...register('tenantSlug')}
                  placeholder="acme"
                  className="w-full px-4 py-2.5 bg-transparent text-foreground text-sm focus:outline-none"
                />
                <span className="px-3 py-2.5 text-xs text-muted-foreground bg-secondary/50 border-l border-border flex items-center">
                  .feedbackpulse.com
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Giriş Yapılıyor...
                </>
              ) : (
                <>
                  Giriş Yap <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            Henüz bir FeedbackPulse hesabınız yok mu?{' '}
            <Link href="/register" className="font-semibold text-indigo-500 hover:underline">
              14 Gün Ücretsiz Başlayın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
