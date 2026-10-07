'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';
import {
  PlanTier,
  BillingOverview,
  SubscriptionStatus,
} from '@feedbackpulse/types';
import {
  CreditCard,
  CheckCircle2,
  XCircle,
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Download,
  AlertCircle,
  Layers,
  Users,
  MessageSquare,
  Globe,
  Webhook,
  Code2,
} from 'lucide-react';

export default function BillingPage() {
  const [billing, setBilling] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'month' | 'year'>('month');
  const [upgradingPlan, setUpgradingPlan] = useState<PlanTier | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadBilling();
  }, []);

  const loadBilling = async () => {
    try {
      const data = await apiClient.getBillingOverview();
      setBilling(data);
    } catch {
      // Handled by mock fallback
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: PlanTier) => {
    if (billing?.currentPlan === tier) return;
    setUpgradingPlan(tier);
    setMessage(null);
    try {
      const res = await apiClient.createCheckout({
        plan: tier,
        interval: billingCycle,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });

      setMessage({
        type: 'success',
        text: `Stripe Checkout oturumu hazırlandı (${tier}). Simülasyon yönlendirmesi: ${res.checkoutUrl}`,
      });

      // Update state locally for instant optimistic experience
      if (billing) {
        setBilling({
          ...billing,
          currentPlan: tier,
          status: SubscriptionStatus.ACTIVE,
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Ödeme oturumu başlatılırken bir hata oluştu.',
      });
    } finally {
      setUpgradingPlan(null);
    }
  };

  const plans = [
    {
      tier: PlanTier.FREE,
      name: 'Starter (Free)',
      description: 'Küçük projeler ve erken aşama ürünler için temel geri bildirim yönetimi.',
      priceMonth: 0,
      priceYear: 0,
      badge: 'Başlangıç',
      popular: false,
      features: [
        { text: '1 Geri Bildirim Panosu', included: true },
        { text: '1 Takım Üyesi', included: true },
        { text: '100 Müşteri Geri Bildirimi / Ay', included: true },
        { text: 'Temel Yol Haritası (Roadmap)', included: true },
        { text: 'Changelog Yayınlama', included: true },
        { text: 'Watermark\'sız Embed Widget', included: false },
        { text: 'Özel Alan Adı (Custom Domain)', included: false },
        { text: 'Webhook & API Entegrasyonu', included: false },
        { text: 'Yapay Zeka Destekli Özetleme', included: false },
      ],
    },
    {
      tier: PlanTier.PRO,
      name: 'Professional',
      description: 'Büyüyen SaaS ve teknoloji ekipleri için sınırsız pano ve tam özellik seti.',
      priceMonth: 29,
      priceYear: 24,
      badge: 'En Popüler',
      popular: true,
      features: [
        { text: '10 Geri Bildirim Panosu', included: true },
        { text: '5 Takım Üyesi', included: true },
        { text: '10.000 Müşteri Geri Bildirimi / Ay', included: true },
        { text: 'Gelişmiş Kanban Yol Haritası', included: true },
        { text: 'Changelog & Duyuru Akışı', included: true },
        { text: 'Özelleştirilebilir Embed Widget (Beyaz Etiket)', included: true },
        { text: 'Özel Alan Adı (feedback.sirketiniz.com)', included: true },
        { text: 'Webhook & REST API Erişimi', included: true },
        { text: 'Yapay Zeka ile Benzer Talep Tespiti', included: false },
      ],
    },
    {
      tier: PlanTier.BUSINESS,
      name: 'Enterprise / Business',
      description: 'Geniş ürün portföyüne sahip şirketler, kurumsal güvenlik ve AI gücü.',
      priceMonth: 79,
      priceYear: 64,
      badge: 'Maksimum Güç',
      popular: false,
      features: [
        { text: 'Sınırsız Pano & Proje', included: true },
        { text: 'Sınırsız Takım Üyesi', included: true },
        { text: 'Sınırsız Müşteri Etkileşimi', included: true },
        { text: 'Çoklu Yol Haritası & Özel Durumlar', included: true },
        { text: 'Changelog E-posta Bülteni Gönderimi', included: true },
        { text: 'Tam Beyaz Etiket (White-label) Widget', included: true },
        { text: 'Çoklu Özel Domain & Otomatik SSL', included: true },
        { text: 'Gelişmiş Webhook & Anlık Bildirimler', included: true },
        { text: 'Yapay Zeka Destekli Otomatik Özetleme & Analiz', included: true },
      ],
    },
  ];

  const invoices = [
    { id: 'INV-2026-003', date: '01 Ekim 2026', amount: '$29.00', status: 'Ödendi', plan: 'Pro Plan' },
    { id: 'INV-2026-002', date: '01 Eylül 2026', amount: '$29.00', status: 'Ödendi', plan: 'Pro Plan' },
    { id: 'INV-2026-001', date: '01 Ağustos 2026', amount: '$29.00', status: 'Ödendi', plan: 'Pro Plan' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-indigo-500" />
            Faturalandırma & Abonelik Planları
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Ekip kotalarınızı, aktif Stripe aboneliğinizi ve plan yükseltme seçeneklerinizi buradan yönetin.
          </p>
        </div>

        {billing && (
          <div className="flex items-center gap-3 bg-secondary/60 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-border/60">
            <div className="text-right">
              <div className="text-xs text-muted-foreground font-medium">Mevcut Planınız</div>
              <div className="text-sm font-bold text-indigo-500 uppercase tracking-wider">
                {billing.currentPlan}
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {billing.status === SubscriptionStatus.ACTIVE ? 'Aktif' : billing.status}
            </span>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Usage Overview KPI Cards */}
      {billing && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                Geri Bildirim Panoları
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                {billing.usage.boardsCount} / {billing.limits.maxBoards}
              </span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (billing.usage.boardsCount / billing.limits.maxBoards) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Kota dolduğunda yeni pano oluşturmak için plan yükseltin.
            </p>
          </div>

          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-500" />
                Takım Üyeleri
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                {billing.usage.membersCount} / {billing.limits.maxTeamMembers}
              </span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (billing.usage.membersCount / billing.limits.maxTeamMembers) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Ürün yöneticileri ve ekip arkadaşlarınız.
            </p>
          </div>

          <div className="bg-card/70 border border-border/80 rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-500" />
                Toplam Geri Bildirim
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground">
                {billing.usage.feedbacksCount} / {billing.limits.maxCustomers}
              </span>
            </div>
            <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(100, (billing.usage.feedbacksCount / billing.limits.maxCustomers) * 100)}%`,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Toplanan müşteri talepleri ve oyları.
            </p>
          </div>
        </div>
      )}

      {/* Billing Cycle Switcher */}
      <div className="flex flex-col items-center justify-center pt-4">
        <div className="inline-flex items-center bg-secondary/80 p-1.5 rounded-2xl border border-border/80 shadow-inner">
          <button
            onClick={() => setBillingCycle('month')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              billingCycle === 'month'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Aylık Ödeme
          </button>
          <button
            onClick={() => setBillingCycle('year')}
            className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
              billingCycle === 'year'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>Yıllık Ödeme</span>
            <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500 text-white shadow-sm">
              %20 İndirim
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {plans.map((p) => {
          const isCurrent = billing?.currentPlan === p.tier;
          const price = billingCycle === 'month' ? p.priceMonth : p.priceYear;

          return (
            <div
              key={p.tier}
              className={`rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 relative ${
                p.popular
                  ? 'bg-card border-2 border-indigo-600 shadow-xl shadow-indigo-500/10 scale-102 lg:-translate-y-1'
                  : 'bg-card/70 border border-border/80 hover:border-border shadow-sm'
              }`}
            >
              {p.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold tracking-wide shadow-md">
                  EN ÇOK TERCİH EDİLEN
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-foreground">{p.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                    {p.badge}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                  {p.description}
                </p>

                <div className="my-6">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-foreground tracking-tight">
                      ${price}
                    </span>
                    <span className="text-muted-foreground text-sm font-medium">
                      / kullanıcı / ay
                    </span>
                  </div>
                  {billingCycle === 'year' && p.priceMonth > 0 && (
                    <span className="text-xs text-emerald-500 font-semibold mt-1 block">
                      Yıllık faturalandırılır (Yıllık ${(price * 12).toFixed(0)})
                    </span>
                  )}
                </div>

                {/* Features List */}
                <div className="space-y-3 pt-4 border-t border-border/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Dahil Olan Özellikler
                  </span>
                  {p.features.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      {f.included ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground/40 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          f.included
                            ? 'text-foreground'
                            : 'text-muted-foreground/50 line-through text-xs'
                        }
                      >
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-8 pt-4">
                <button
                  onClick={() => handleUpgrade(p.tier)}
                  disabled={isCurrent || upgradingPlan !== null}
                  className={`w-full py-3 px-5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-secondary text-muted-foreground cursor-default'
                      : p.popular
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-secondary hover:bg-secondary/80 text-foreground border border-border'
                  }`}
                >
                  {isCurrent ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      Mevcut Planınız
                    </>
                  ) : upgradingPlan === p.tier ? (
                    'Yönlendiriliyor...'
                  ) : (
                    <>
                      {p.priceMonth === 0 ? 'Bu Plana Geç' : 'Hemen Yükselt'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Invoice History */}
      <div className="bg-card/70 border border-border/80 rounded-3xl p-6 shadow-sm mt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-foreground">Fatura Geçmişi</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Geçmiş ödemeleriniz ve PDF faturalarınız.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs text-muted-foreground uppercase">
                <th className="pb-3 font-semibold">Fatura No</th>
                <th className="pb-3 font-semibold">Tarih</th>
                <th className="pb-3 font-semibold">Plan</th>
                <th className="pb-3 font-semibold">Tutar</th>
                <th className="pb-3 font-semibold">Durum</th>
                <th className="pb-3 font-semibold text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-3.5 font-medium text-foreground">{inv.id}</td>
                  <td className="py-3.5 text-muted-foreground text-xs">{inv.date}</td>
                  <td className="py-3.5 text-foreground text-xs">{inv.plan}</td>
                  <td className="py-3.5 font-semibold text-foreground">{inv.amount}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => alert(`${inv.id} PDF faturası indiriliyor...`)}
                      className="inline-flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      İndir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
