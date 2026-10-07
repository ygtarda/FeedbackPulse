'use client';

import React from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '../../../components/marketing/navbar';
import { MarketingFooter } from '../../../components/marketing/footer';
import { Sparkles, Calendar, Zap, Wrench, Bug, ArrowRight } from 'lucide-react';

export default function MarketingChangelogPage() {
  const updates = [
    {
      version: 'v1.3.0',
      date: '8 Ekim 2026',
      title: 'Yayın Notları (Changelog) ve Çoklu Kanal Bildirim Altyapısı',
      category: 'Yeni Özellik',
      body: 'Ürün ekipleri artık geliştirdikleri özellikleri doğrudan kullanıcılarına duyurabilecekleri şeffaf bir Yayın Notları (Changelog) panosuna sahip. Hem admin panelinden düzenlenebilir hem de topluluk panosunda herkese açık sergilenebilir.',
    },
    {
      version: 'v1.2.0',
      date: '7 Ekim 2026',
      title: 'Sürükle-Bırak (Drag-and-Drop) Kanban Yol Haritası',
      category: 'Yeni Özellik',
      body: 'Geliştirme ekipleri için kartları fareyle sürükleyip bırakarak aşamalarını değiştirebilecekleri, optimize edilmiş iyimser arayüz (Optimistic UI) ve müşteri geri bildirimi çift yönlü senkronizasyonu devreye alındı.',
    },
    {
      version: 'v1.1.0',
      date: '5 Ekim 2026',
      title: 'Koyu Tema (Dark Mode) ve Tasarım Sistemi Güncellemesi',
      category: 'İyileştirme',
      body: 'Tüm sayfalarda göz yormayan modern HSL koyu tema entegrasyonu tamamlandı. Sistem temasını otomatik algılama ve manuel geçiş anahtarı eklendi.',
    },
    {
      version: 'v1.0.0',
      date: '1 Ekim 2026',
      title: 'FeedbackPulse İlk MVP Canlıya Alındı',
      category: 'Yeni Özellik',
      body: 'Çok kiracılı (multi-tenant) mimari, kullanıcı yetkilendirmesi, panolar, özellik oylama ve temel yol haritası altyapısıyla FeedbackPulse genel kullanıma açıldı.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Sürekli Gelişen Platform
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            Yayın Notları & Güncellemeler
          </h1>
          <p className="mt-4 text-muted-foreground text-base">
            FeedbackPulse platformundaki en yeni özellikler, iyileştirmeler ve performans güncellemeleri.
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-8 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
          {updates.map((item, idx) => (
            <div key={idx} className="relative pl-9 group">
              <div className="absolute left-1.5 top-5 w-4 h-4 rounded-full border-2 border-indigo-500 bg-background group-hover:bg-indigo-500 transition-colors" />

              <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm hover:border-indigo-500/40 transition-all space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-secondary text-foreground border border-border">
                      {item.version}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {item.category}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {item.date}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-foreground">{item.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 p-8 rounded-3xl bg-card border border-border text-center space-y-4">
          <h3 className="text-xl font-bold text-foreground">Siz de Kendi Ürününüz İçin Kullanın</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            FeedbackPulse ile dakikalar içinde kendi şirketinizin geri bildirim panosunu ve yol haritasını yayınlayın.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all"
          >
            Ücretsiz Başlayın <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
