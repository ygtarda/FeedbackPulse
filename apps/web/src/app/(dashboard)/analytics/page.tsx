'use client';

import React, { useState, useEffect } from 'react';
import { apiClient } from '../../../lib/api-client';
import { AnalyticsOverview } from '@feedbackpulse/types';
import {
  BarChart3,
  TrendingUp,
  ThumbsUp,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowUpRight,
  Clock,
  Flame,
  BrainCircuit,
  Filter,
} from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<{ summary: string; insights: string[]; topThemes: string[] } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const res = await apiClient.getAnalytics();
      setData(res);
    } catch {
      // Mock fallback in api-client
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAiSummary = async () => {
    setAiLoading(true);
    try {
      const res = await apiClient.getAiSummary();
      setAiInsights(res);
    } catch {
      // Handled
    } finally {
      setAiLoading(false);
    }
  };

  const maxWeeklyVotes = data
    ? Math.max(...data.weeklyActivity.map((d) => d.votes), 1)
    : 100;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-500" />
            Ürün Analitiği & İçgörüler
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Müşteri geri bildirim trendleri, oylama yoğunluğu ve özellik talep dağılımları.
          </p>
        </div>

        <button
          onClick={handleGenerateAiSummary}
          disabled={aiLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-md shadow-indigo-600/20 hover:opacity-95 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          {aiLoading ? 'Yapay Zeka Analiz Ediyor...' : 'AI ile Trendleri Özetle'}
        </button>
      </div>

      {/* AI Executive Summary Banner */}
      {aiInsights && (
        <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-background border border-indigo-500/30 shadow-lg relative overflow-hidden animate-in fade-in slide-in-from-top-4">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div className="space-y-3 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  Yapay Zeka Ürün Özeti & Tavsiyeleri
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono">
                    GPT-4o Engine
                  </span>
                </h3>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                {aiInsights.summary}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {aiInsights.insights.map((ins, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-background/50 border border-border/50 text-xs text-foreground/80 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-xs font-semibold text-muted-foreground">Öne Çıkan Temalar:</span>
                {aiInsights.topThemes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  >
                    #{theme}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-card/70 border border-border/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-2">
              <span>Toplam Geri Bildirim</span>
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {data.totalFeedbacks}
            </div>
            <div className="text-xs text-emerald-500 flex items-center gap-1 mt-2 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Geçen aya göre +%24 artış</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card/70 border border-border/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-2">
              <span>Toplam Verilen Oylar</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                <ThumbsUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {data.totalVotes}
            </div>
            <div className="text-xs text-emerald-500 flex items-center gap-1 mt-2 font-medium">
              <Flame className="w-3.5 h-3.5" />
              <span>Geri bildirim başına ort. 6.5 oy</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card/70 border border-border/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-2">
              <span>Kullanıcı Yorumları</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              {data.totalComments}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-2 font-medium">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Aktif tartışma oranı %78</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-card/70 border border-border/80 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-medium mb-2">
              <span>Çözüme Ulaşma Oranı</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-foreground tracking-tight">
              %{data.resolvedRatio}
            </div>
            <div className="text-xs text-muted-foreground mt-2 font-medium">
              Tamamlanan & Kapatılan talepler
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Activity Bar Chart */}
          <div className="lg:col-span-2 p-6 rounded-3xl bg-card/70 border border-border/80 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-base text-foreground">Haftalık Etkileşim Trendi</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Haftanın günlerine göre yeni feedback ve oylama yoğunluğu
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block" />
                    <span>Oylar</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-md bg-purple-400 inline-block" />
                    <span>Feedbackler</span>
                  </div>
                </div>
              </div>

              {/* Bar visualization */}
              <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-border/60">
                {data.weeklyActivity.map((item, idx) => {
                  const voteHeight = (item.votes / maxWeeklyVotes) * 100;
                  const fbHeight = (item.feedbacks / maxWeeklyVotes) * 100 * 3;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1.5 h-full">
                        {/* Vote bar */}
                        <div
                          style={{ height: `${Math.max(12, voteHeight)}%` }}
                          className="w-1/2 bg-indigo-600 rounded-t-lg transition-all duration-300 group-hover:bg-indigo-500 relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-popover text-popover-foreground px-1.5 py-0.5 rounded shadow pointer-events-none font-bold">
                            {item.votes}
                          </span>
                        </div>
                        {/* Feedback bar */}
                        <div
                          style={{ height: `${Math.max(8, fbHeight)}%` }}
                          className="w-1/2 bg-purple-400 dark:bg-purple-500/70 rounded-t-lg transition-all duration-300 group-hover:bg-purple-300 relative"
                        >
                          <span className="opacity-0 group-hover:opacity-100 absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] bg-popover text-popover-foreground px-1.5 py-0.5 rounded shadow pointer-events-none font-bold">
                            {item.feedbacks}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4">
              <span>En yoğun gün: <strong>Cuma (140 Oy)</strong></span>
              <span>Veriler son 7 güne aittir</span>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="p-6 rounded-3xl bg-card/70 border border-border/80 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-foreground mb-1">Durum Dağılımı</h3>
              <p className="text-xs text-muted-foreground mb-6">
                İşlem gören tüm geri bildirimlerin yaşam döngüsü
              </p>

              <div className="space-y-3.5">
                {[
                  { label: 'Açık (Yeni)', count: data.statusBreakdown.open, color: 'bg-blue-500', text: 'text-blue-500' },
                  { label: 'İncelemede', count: data.statusBreakdown.underReview, color: 'bg-amber-500', text: 'text-amber-500' },
                  { label: 'Planlandı', count: data.statusBreakdown.planned, color: 'bg-purple-500', text: 'text-purple-500' },
                  { label: 'Geliştiriliyor', count: data.statusBreakdown.inProgress, color: 'bg-indigo-500', text: 'text-indigo-500' },
                  { label: 'Tamamlandı', count: data.statusBreakdown.completed, color: 'bg-emerald-500', text: 'text-emerald-500' },
                  { label: 'Kapatıldı', count: data.statusBreakdown.closed, color: 'bg-zinc-500', text: 'text-zinc-500' },
                ].map((item, i) => {
                  const percentage =
                    data.totalFeedbacks > 0
                      ? Math.round((item.count / data.totalFeedbacks) * 100)
                      : 0;

                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${item.color}`} />
                          {item.label}
                        </span>
                        <span className="text-foreground">
                          {item.count} <span className="text-[11px] text-muted-foreground font-normal">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
              <span>Toplam Talep:</span>
              <strong className="text-foreground">{data.totalFeedbacks} Adet</strong>
            </div>
          </div>
        </div>
      )}

      {/* Top Requested Features Table */}
      {data && (
        <div className="p-6 rounded-3xl bg-card/70 border border-border/80 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                En Çok Talep Edilen Özellikler
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kullanıcılar tarafından en yüksek oy alan ilk 5 özellik talebi
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/60 text-xs text-muted-foreground uppercase">
                  <th className="pb-3 font-semibold">Sıra</th>
                  <th className="pb-3 font-semibold">Özellik / Talep</th>
                  <th className="pb-3 font-semibold">Toplam Oy</th>
                  <th className="pb-3 font-semibold">Mevcut Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {data.topRequestedFeatures.map((f, index) => (
                  <tr key={f.id} className="hover:bg-secondary/40 transition-colors">
                    <td className="py-3.5 font-bold text-xs text-muted-foreground">
                      <span className="w-6 h-6 rounded-full bg-secondary text-foreground inline-flex items-center justify-center font-mono">
                        #{index + 1}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-foreground text-sm">
                      {f.title}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-bold text-sm text-indigo-500 bg-indigo-500/10 px-2.5 py-1 rounded-xl">
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {f.voteCount} Oy
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-secondary text-muted-foreground">
                        {f.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
