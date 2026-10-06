'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, RegisterDto } from '@feedbackpulse/types';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import { Sparkles, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RegisterDto>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      tenantName: '',
      tenantSlug: '',
    },
  });

  const tenantNameValue = watch('tenantName');

  const handleTenantNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue('tenantName', val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    setValue('tenantSlug', slug);
  };

  const onSubmit = async (data: RegisterDto) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await apiClient.register(data);
      setAuth(response);
      router.push('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Kayıt sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden py-12">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-foreground">
              Feedback<span className="text-indigo-500">Pulse</span>
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
            Ücretsiz Hesabınızı Oluşturun
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            14 gün tam erişim, kredi kartı gerektirmez
          </p>
        </div>

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
                Adınız ve Soyadınız
              </label>
              <input
                type="text"
                {...register('name')}
                placeholder="Ahmet Yılmaz"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                İş E-postanız
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="ahmet@sirketiniz.com"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.email && (
                <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Şirket / Ürün Adı
                </label>
                <input
                  type="text"
                  placeholder="Acme SaaS"
                  value={tenantNameValue}
                  onChange={handleTenantNameChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.tenantName && (
                  <p className="text-xs text-rose-500 mt-1">{errors.tenantName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Alt Alan Adı (Subdomain)
                </label>
                <input
                  type="text"
                  {...register('tenantSlug')}
                  placeholder="acme"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {errors.tenantSlug && (
                  <p className="text-xs text-rose-500 mt-1">{errors.tenantSlug.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Şifre (En az 8 karakter)
              </label>
              <input
                type="password"
                {...register('password')}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.password && (
                <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
              )}
            </div>

            <div className="p-3 rounded-xl bg-secondary/50 border border-border/60 text-xs text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Free Plan ile başlarsınız. Dilediğiniz an Pro plana geçebilirsiniz.</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Çalışma Alanı Kuruluyor...
                </>
              ) : (
                <>
                  Hesabı Oluştur ve Başla <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
            Zaten bir hesabınız var mı?{' '}
            <Link href="/login" className="font-semibold text-indigo-500 hover:underline">
              Giriş Yapın
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
