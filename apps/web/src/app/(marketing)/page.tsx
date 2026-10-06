'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '../../components/marketing/navbar';
import { MarketingFooter } from '../../components/marketing/footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Kanban,
  MessageSquare,
  ThumbsUp,
  ShieldCheck,
  Zap,
  Globe2,
  Layers,
  ChevronDown,
  Building2,
  TrendingUp,
} from 'lucide-react';

export default function LandingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroVotes, setHeroVotes] = useState(48);
  const [hasVotedHero, setHasVotedHero] = useState(false);

  const toggleVoteHero = () => {
    setHasVotedHero(!hasVotedHero);
    setHeroVotes((prev) => (hasVotedHero ? prev - 1 : prev + 1));
  };

  const faqs = [
    {
      q: 'FeedbackPulse tam olarak nedir ve şirketimize nasıl fayda sağlar?',
      a: 'FeedbackPulse, SaaS ve dijital ürün geliştiren ekiplerin kullanıcılarından özellik talepleri toplamasını, bunları oylatarak gerçek müşteri taleplerini önceliklendirmesini ve şeffaf bir Kanban yol haritası ile kullanıcılara sunmasını sağlayan multi-tenant bir B2B platformudur.',
    },
    {
      q: 'Multi-tenant mimari verilerimizin güvenliğini nasıl sağlar?',
      a: 'Veritabanı seviyesinde PostgreSQL Row Level Security (RLS) ve izole tenant anahtarları kullanılır. Her tenant yalnızca kendi müşterilerinin ve ekibinin verisine erişebilir.',
    },
    {
      q: 'Kendi web sitemize veya mobil uygulamamıza gömebilir miyiz?',
      a: 'Evet! FeedbackPulse hafif bir iframe/embed scripti sağlar. Müşterileriniz sitenizden ayrılmadan geri bildirim bırakabilir ve mevcut talepleri oylayabilir.',
    },
    {
      q: 'Ücretsiz planda ne gibi özellikler bulunuyor?',
      a: 'Free planımızda 1 aktif pano, 100 tekil müşteri geri bildirimi ve temel yol haritası modülü tamamen ücretsiz ve süre kısıtlamasız olarak sunulmaktadır.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-indigo-500 selection:text-white">
      <MarketingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-28 md:pt-28 md:pb-36">
          {/* Subtle background glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 dark:bg-indigo-600/20 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 left-1/3 w-[300px] h-[250px] bg-purple-500/15 dark:bg-purple-600/20 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6 backdrop-blur-sm animate-fade-in">
              <Sparkles className="w-3.5 h-3.5" />
              Yeni Nesil B2B Feedback & Roadmap SaaS
            </div>

            {/* Main title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mx-auto leading-[1.12]">
              Müşterilerinizi Dinleyin,{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                Doğru Ürünü İnşa Edin.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Özellik taleplerini toplayın, oylatın ve şeffaf bir Kanban yol haritası ile kullanıcılarınıza duyurun. Tahminlerle değil, gerçek kullanıcı verisiyle büyüyün.
            </p>

            {/* Hero CTAs */}
            <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 group"
              >
                14 Gün Ücretsiz Deneyin
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#features"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold border border-border/80 bg-card/60 backdrop-blur text-foreground hover:bg-secondary/70 transition-all flex items-center justify-center"
              >
                Canlı Demosunu Gör
              </Link>
            </div>

            {/* Trust signals */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Kredi Kartı Gerekmez
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 2 Dakikada Kurulum
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Multi-Tenant Güvencesi
              </span>
            </div>

            {/* HERO PRODUCT MOCKUP */}
            <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border/60 bg-card/80 p-3 sm:p-5 shadow-2xl backdrop-blur-xl glow-indigo">
              {/* Fake browser bar */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/60 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="px-3 py-1 rounded-md bg-secondary/80 text-foreground font-mono text-[11px] flex items-center gap-2">
                  <Globe2 className="w-3.5 h-3.5 text-indigo-500" />
                  app.feedbackpulse.com/acme/boards/features
                </div>
                <div className="text-indigo-400 font-medium">Canlı Önizleme</div>
              </div>

              {/* Mockup content: Interactive Board Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                {/* Interactive Card */}
                <div className="md:col-span-2 p-5 rounded-xl bg-background/80 border border-border/80 shadow-sm hover:border-indigo-500/50 transition-all">
                  <div className="flex items-start gap-4">
                    {/* Vote button */}
                    <button
                      onClick={toggleVoteHero}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                        hasVotedHero
                          ? 'bg-indigo-600 text-white border-indigo-600 scale-105 shadow-md shadow-indigo-500/30'
                          : 'bg-secondary/60 hover:bg-secondary text-foreground border-border'
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${hasVotedHero ? 'fill-white' : ''}`} />
                      <span className="text-sm font-bold mt-1">{heroVotes}</span>
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500">
                          Geliştiriliyor (In Progress)
                        </span>
                        <span className="text-xs text-muted-foreground">3 saat önce</span>
                      </div>
                      <h4 className="text-base sm:text-lg font-bold text-foreground mt-2">
                        Karanlık Mod (Dark Mode) ve Sistem Teması Entegrasyonu
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                        Kullanıcılar paneli gece kullanırken göz yorulmasını engellemek için sistem tercihi ile senkronize çalışan koyu renk paleti talep ediyor.
                      </p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/40">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" /> 8 Yorum
                        </span>
                        <span>Yazar: <strong>Arda Yılmaz</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mini Kanban Preview */}
                <div className="p-4 rounded-xl bg-secondary/40 border border-border/60 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Kanban className="w-4 h-4 text-indigo-500" /> Yol Haritası Özeti
                    </h5>
                    <div className="space-y-2.5 text-xs">
                      <div className="p-2.5 rounded-lg bg-card border border-border/60">
                        <div className="font-semibold text-foreground">Slack Webhook Bildirimleri</div>
                        <span className="text-[10px] text-amber-500 font-medium">Planlandı (Q4)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border/60">
                        <div className="font-semibold text-foreground">Koyu Tema Desteği</div>
                        <span className="text-[10px] text-indigo-500 font-medium">Geliştiriliyor (%80)</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-card border border-border/60">
                        <div className="font-semibold text-foreground">Google & GitHub OAuth</div>
                        <span className="text-[10px] text-emerald-500 font-medium">Tamamlandı (v1.2)</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-3 text-center">
                    <span className="text-[11px] text-indigo-500 font-medium hover:underline cursor-pointer">
                      Tüm Yol Haritasını Gör →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-12 border-y border-border/40 bg-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              200+ Hızlı Büyüyen SaaS ve Ürün Ekibi FeedbackPulse Kullanıyor
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-70 grayscale hover:grayscale-0 transition-all">
              <span className="font-bold text-xl tracking-tight text-foreground/80 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-500" /> NexaCloud
              </span>
              <span className="font-bold text-xl tracking-tight text-foreground/80 flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-500" /> PulseStack
              </span>
              <span className="font-bold text-xl tracking-tight text-foreground/80 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-500" /> DevMorph
              </span>
              <span className="font-bold text-xl tracking-tight text-foreground/80 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" /> ScaleMetrics
              </span>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 mb-3">
              Kapsamlı Modüller
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Müşteri Geri Bildirimini Ürün Başarısına Dönüştürün
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              Gereksiz toplantıları ve kaybolan e-postaları unutun. Tüm süreci tek bir modern SaaS platformunda toplayın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/50 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6">
                <ThumbsUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Oylama & Geri Bildirim Panoları</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Kullanıcılar tek tıkla talep oluşturur, oy verir ve yorum yapar. En popüler özellikler anında listenin tepesine yükselir.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/50 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6">
                <Kanban className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Sürükle-Bırak Yol Haritası</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Planlandı, Geliştiriliyor ve Tamamlandı sütunlarıyla şeffaf bir Kanban panosu sunun. Müşterilerinize ürünün geleceğini gösterin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-card border border-border/60 hover:border-indigo-500/50 shadow-sm transition-all hover:translate-y-[-4px]">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Multi-Tenant PostgreSQL RLS</h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Her şirketin verisi Row-Level Security güvencesiyle izole edilir. Takım üyelerinize Owner, Admin ve Member rolleriyle erişim verin.
              </p>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="py-20 bg-secondary/30 border-y border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">Nasıl Çalışır?</h2>
              <p className="mt-3 text-muted-foreground">3 basit adımda müşteri odaklı ürün yönetimine başlayın.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                  1
                </div>
                <h4 className="text-lg font-bold text-foreground">Çalışma Alanınızı Kurun</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Şirketinizin alt alan adını (ör. acme.feedbackpulse.com) belirleyin ve panonuzu açın.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                  2
                </div>
                <h4 className="text-lg font-bold text-foreground">Talepleri Toplayın ve Oylatın</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  Müşterileriniz doğrudan panodan veya web sitenize gömdüğünüz widget üzerinden talep açsın.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/30">
                  3
                </div>
                <h4 className="text-lg font-bold text-foreground">Yol Haritasına Taşıyın</h4>
                <p className="mt-2 text-sm text-muted-foreground">
                  En çok talep gören özellikleri tek tıkla Kanban yol haritanıza taşıyıp ekibinizle geliştirin.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Şeffaf ve Esnek Fiyatlandırma
            </h2>
            <p className="mt-4 text-muted-foreground">
              İhtiyacınıza uygun planı seçin, işiniz büyüdükçe yükseltin.
            </p>

            {/* Toggle */}
            <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-secondary border border-border">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  billingPeriod === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Aylık Ödeme
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  billingPeriod === 'yearly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                }`}
              >
                Yıllık Ödeme <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-bold px-1.5 py-0.5 rounded">%20 İndirim</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* FREE PLAN */}
            <div className="p-8 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Free (Ücretsiz)</h3>
                <p className="mt-2 text-sm text-muted-foreground">Yeni başlayan ve denemek isteyen startup'lar için</p>
                <div className="mt-6 text-4xl font-extrabold text-foreground">
                  ₺0 <span className="text-sm font-normal text-muted-foreground">/ay</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1 Geri Bildirim Panosu</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100 Kullanıcı Geri Bildirimi</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Temel Kanban Roadmap</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standart Destek</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 rounded-xl text-center text-sm font-semibold border border-border hover:bg-secondary transition-colors"
              >
                Hemen Başla
              </Link>
            </div>

            {/* PRO PLAN */}
            <div className="p-8 rounded-2xl bg-card border-2 border-indigo-600 relative shadow-xl shadow-indigo-500/10 flex flex-col justify-between">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase">
                En Çok Tercih Edilen
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Pro</h3>
                <p className="mt-2 text-sm text-muted-foreground">Büyüyen SaaS şirketleri ve ürün ekipleri için</p>
                <div className="mt-6 text-4xl font-extrabold text-foreground">
                  {billingPeriod === 'monthly' ? '₺499' : '₺399'}{' '}
                  <span className="text-sm font-normal text-muted-foreground">/ay</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Sınırsız Pano & Feedback</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> 3 Takım Üyesi Koltuğu</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Gömülü Web Widget (İframe)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-500" /> Öncelikli E-posta Desteği</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 rounded-xl text-center text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/25"
              >
                Pro Planı Seç
              </Link>
            </div>

            {/* BUSINESS PLAN */}
            <div className="p-8 rounded-2xl bg-card border border-border/70 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-foreground">Business</h3>
                <p className="mt-2 text-sm text-muted-foreground">Geniş ekipler ve kurumsal entegrasyonlar için</p>
                <div className="mt-6 text-4xl font-extrabold text-foreground">
                  {billingPeriod === 'monthly' ? '₺1.499' : '₺1.199'}{' '}
                  <span className="text-sm font-normal text-muted-foreground">/ay</span>
                </div>
                <ul className="mt-8 space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Sınırsız Her Şey</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Özel Domain (Custom Domain)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Webhook & Slack Entegrasyonu</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 7/24 Özel Müşteri Temsilcisi</li>
                </ul>
              </div>
              <Link
                href="/register"
                className="mt-8 w-full py-3 rounded-xl text-center text-sm font-semibold border border-border hover:bg-secondary transition-colors"
              >
                İletişime Geç
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ ACCORDION */}
        <section id="faq" className="py-20 bg-secondary/20 border-t border-border/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-foreground">Sıkça Sorulan Sorular</h2>
              <p className="mt-2 text-muted-foreground">Aklınıza takılan soruların yanıtları burada.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-border/60 bg-card overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between font-semibold text-foreground hover:bg-secondary/40 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-indigo-500' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-indigo-950/20 to-background border-t border-border/40">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
              Müşteri Taleplerini Yönetmeye Bugün Başlayın
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Ücretsiz hesabınızı açın, geri bildirim panonuzu dakikalar içinde canlıya alın.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-3.5 rounded-xl font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.02]"
              >
                Hemen Ücretsiz Başla
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
