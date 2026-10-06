'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MarketingNavbar } from '../../../components/marketing/navbar';
import { MarketingFooter } from '../../../components/marketing/footer';
import { CheckCircle2, XCircle } from 'lucide-react';

export default function PricingPage() {
  const [period, setPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const comparison = [
    { feature: 'Geri Bildirim Panoları', free: '1 Pano', pro: 'Sınırsız', business: 'Sınırsız' },
    { feature: 'Kullanıcı Feedback Sınırı', free: '100 Adet', pro: 'Sınırsız', business: 'Sınırsız' },
    { feature: 'Takım Koltuğu (Team Members)', free: '1 Kullanıcı', pro: '3 Kullanıcı', business: 'Sınırsız' },
    { feature: 'Kanban Yol Haritası', free: 'Temel', pro: 'Gelişmiş & Filtrelenebilir', business: 'Gelişmiş & Filtrelenebilir' },
    { feature: 'Gömülü Web Widget', free: false, pro: true, business: true },
    { feature: 'Özel Alan Adı (Custom Domain)', free: false, pro: false, business: true },
    { feature: 'Webhook & Slack Bildirimleri', free: false, pro: false, business: true },
    { feature: 'Öncelikli SLA Desteği', free: false, pro: true, business: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <MarketingNavbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight">
            İhtiyacınıza Uygun Planı Seçin
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Kredi kartı gerekmeden ücretsiz başlayın, istediğiniz zaman yükseltin veya iptal edin.
          </p>

          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-secondary border border-border">
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                period === 'monthly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Aylık Fatura
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                period === 'yearly' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Yıllık Fatura <span className="text-[10px] bg-emerald-500/20 text-emerald-500 font-bold px-1.5 py-0.5 rounded">%20 İndirim</span>
            </button>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mt-14 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/40 border-b border-border">
              <tr>
                <th className="p-4 font-semibold text-foreground">Özellikler</th>
                <th className="p-4 font-semibold text-foreground">Free</th>
                <th className="p-4 font-semibold text-indigo-600 dark:text-indigo-400">Pro</th>
                <th className="p-4 font-semibold text-foreground">Business</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-muted-foreground">
              {comparison.map((row, i) => (
                <tr key={i} className="hover:bg-secondary/20 transition-colors">
                  <td className="p-4 font-medium text-foreground">{row.feature}</td>
                  <td className="p-4">
                    {typeof row.free === 'boolean' ? (
                      row.free ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-muted-foreground/40" />
                    ) : (
                      row.free
                    )}
                  </td>
                  <td className="p-4 font-medium text-foreground">
                    {typeof row.pro === 'boolean' ? (
                      row.pro ? <CheckCircle2 className="w-5 h-5 text-indigo-500" /> : <XCircle className="w-5 h-5 text-muted-foreground/40" />
                    ) : (
                      row.pro
                    )}
                  </td>
                  <td className="p-4">
                    {typeof row.business === 'boolean' ? (
                      row.business ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-muted-foreground/40" />
                    ) : (
                      row.business
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/register"
            className="inline-flex px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500 shadow-lg shadow-indigo-500/25 transition-all"
          >
            Hemen Ücretsiz Deneyin
          </Link>
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
