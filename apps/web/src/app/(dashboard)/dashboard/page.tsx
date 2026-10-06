'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import {
  MessageSquare,
  ThumbsUp,
  Kanban,
  LayoutGrid,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FeedbackStatus } from '@feedbackpulse/types';

export default function DashboardOverviewPage() {
  const currentTenant = useAuthStore((s) => s.currentTenant);

  const { data: boards = [] } = useQuery({
    queryKey: ['boards', currentTenant?.id],
    queryFn: () => apiClient.listBoards(),
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['feedbacks', currentTenant?.id],
    queryFn: () => apiClient.listFeedbacks(),
  });

  const { data: roadmapItems = [] } = useQuery({
    queryKey: ['roadmap', currentTenant?.id],
    queryFn: () => apiClient.listRoadmap(),
  });

  const totalVotes = feedbacks.reduce((acc, f) => acc + f.voteCount, 0);

  const statusBadge = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.IN_PROGRESS:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">Geliştiriliyor</span>;
      case FeedbackStatus.PLANNED:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">Planlandı</span>;
      case FeedbackStatus.COMPLETED:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Tamamlandı</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-secondary text-muted-foreground border border-border">Açık</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-background border border-indigo-500/20 relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Multi-Tenant Dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Hoş Geldiniz, {currentTenant?.name || 'Acme SaaS'}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Müşterilerinizin en son geri bildirimlerini inceleyin, oyları takip edin ve geliştirme önceliklerinizi belirleyin.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Link
              href="/boards"
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/20 flex items-center gap-2"
            >
              Panoya Git <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/roadmap"
              className="px-4 py-2 rounded-xl text-sm font-semibold border border-border bg-card/60 hover:bg-secondary/70 transition-colors"
            >
              Yol Haritası (Kanban)
            </Link>
          </div>
        </div>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Toplam Geri Bildirim</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{feedbacks.length}</div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Müşteri talepleri aktif toplanıyor
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Toplam Kullanıcı Oyu</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
              <ThumbsUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{totalVotes}</div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Özellik bazlı oy sayısı
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Aktif Panolar</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <LayoutGrid className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{boards.length}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Kullanıcı panoları
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs font-medium uppercase tracking-wider">Yol Haritası Kartları</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
              <Kanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold text-foreground">{roadmapItems.length}</div>
          <p className="text-xs text-muted-foreground mt-2">
            Geliştirme aşamasındaki özellikler
          </p>
        </div>
      </div>

      {/* RECENT FEEDBACKS TABLE / LIST */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Son Eklenen Geri Bildirimler</h2>
            <p className="text-xs text-muted-foreground mt-0.5">En son iletilen ve oylanan kullanıcı önerileri</p>
          </div>
          <Link
            href="/boards"
            className="text-xs font-semibold text-indigo-500 hover:underline flex items-center gap-1"
          >
            Tümünü Gör <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-border/60">
          {feedbacks.slice(0, 5).map((fb) => (
            <div key={fb.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-secondary flex flex-col items-center justify-center font-bold text-xs text-foreground shrink-0 border border-border">
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-500 mb-0.5" />
                  <span>{fb.voteCount}</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground hover:text-indigo-500 transition-colors cursor-pointer">
                    {fb.title}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                    {fb.description}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-1.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(fb.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                    <span>Yazar: {fb.authorName}</span>
                  </div>
                </div>
              </div>

              <div>{statusBadge(fb.status)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
