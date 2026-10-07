'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft, Mail, Loader2, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);

    // Simulate password reset email trigger
    await new Promise((r) => setTimeout(r, 1000));
    setIsLoading(false);
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Ambient background glow */}
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
          <h1 className="text-2xl font-bold text-foreground">Şifrenizi mi Unuttunuz?</h1>
          <p className="text-sm text-muted-foreground mt-1">
            E-posta adresinizi girin, sıfırlama bağlantısını hemen iletelim.
          </p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-xl">
          {isSubmitted ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-lg font-bold text-foreground">Sıfırlama Bağlantısı Gönderildi</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-foreground">{email}</strong> adresine şifre yenileme talimatlarını gönderdik. Lütfen gelen kutunuzu (ve spam klasörünü) kontrol edin.
              </p>
              <div className="pt-4">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Giriş Sayfasına Dön
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Kayıtlı E-posta Adresi
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="ahmet@sirket.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-all shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...
                  </>
                ) : (
                  <>
                    Sıfırlama Bağlantısı Gönder <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-6 pt-6 border-t border-border text-center text-xs text-muted-foreground">
                Şifrenizi hatırladınız mı?{' '}
                <Link href="/login" className="font-semibold text-indigo-500 hover:underline">
                  Giriş Yapın
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
