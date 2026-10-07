'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import {
  Sparkles,
  ThumbsUp,
  MessageSquare,
  Clock,
  Plus,
  X,
  Search,
  Kanban,
  CheckCircle2,
  Zap,
  ArrowRight,
  Send,
  Megaphone,
  Calendar,
} from 'lucide-react';
import { FeedbackStatus, RoadmapStatus, FeedbackSummary, RoadmapItemSummary, ChangelogCategory } from '@feedbackpulse/types';

export default function PublicBoardPage() {
  const params = useParams();
  const slug = (params?.slug as string) || 'acme';
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'feedbacks' | 'roadmap' | 'changelog'>('feedbacks');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSummary | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [fbTitle, setFbTitle] = useState('');
  const [fbDescription, setFbDescription] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commenterName, setCommenterName] = useState('');

  // Queries
  const { data: boards = [] } = useQuery({
    queryKey: ['public-boards', slug],
    queryFn: () => apiClient.listBoards(),
  });

  const activeBoard = boards[0];

  const { data: feedbacks = [], isLoading: loadingFeedbacks } = useQuery({
    queryKey: ['public-feedbacks', slug, activeBoard?.id, selectedStatus],
    queryFn: () =>
      apiClient.listFeedbacks({
        boardId: activeBoard?.id,
        status: selectedStatus === 'ALL' ? undefined : selectedStatus,
        sortBy: 'votes',
      }),
  });

  const { data: roadmapItems = [], isLoading: loadingRoadmap } = useQuery({
    queryKey: ['public-roadmap', slug],
    queryFn: () => apiClient.listRoadmap(),
  });

  const { data: changelogs = [], isLoading: loadingChangelogs } = useQuery({
    queryKey: ['public-changelogs', slug],
    queryFn: () => apiClient.listPublicChangelogs(slug),
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['public-comments', selectedFeedback?.id],
    queryFn: () => (selectedFeedback ? apiClient.listComments(selectedFeedback.id) : []),
    enabled: !!selectedFeedback,
  });

  // Mutations
  const voteMutation = useMutation({
    mutationFn: (feedbackId: string) => apiClient.toggleVote(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-feedbacks'] });
      if (selectedFeedback) {
        setSelectedFeedback((prev) =>
          prev
            ? {
                ...prev,
                hasVoted: !prev.hasVoted,
                voteCount: prev.hasVoted ? prev.voteCount - 1 : prev.voteCount + 1,
              }
            : null,
        );
      }
    },
  });

  const createFeedbackMutation = useMutation({
    mutationFn: (data: { title: string; description: string; authorName: string }) =>
      apiClient.createFeedback({
        boardId: activeBoard?.id || 'b-1',
        title: data.title,
        description: data.description,
        authorName: data.authorName,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['public-feedbacks'] });
      setCreateModalOpen(false);
      setFbTitle('');
      setFbDescription('');
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ feedbackId, body, name }: { feedbackId: string; body: string; name: string }) =>
      apiClient.addComment(feedbackId, body),
    onSuccess: () => {
      refetchComments();
      setCommentBody('');
    },
  });

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return fb.title.toLowerCase().includes(q) || fb.description.toLowerCase().includes(q);
  });

  const statusLabel = (status: FeedbackStatus) => {
    switch (status) {
      case FeedbackStatus.OPEN:
        return 'Açık';
      case FeedbackStatus.UNDER_REVIEW:
        return 'İnceleniyor';
      case FeedbackStatus.PLANNED:
        return 'Planlandı';
      case FeedbackStatus.IN_PROGRESS:
        return 'Geliştiriliyor';
      case FeedbackStatus.COMPLETED:
        return 'Tamamlandı';
      case FeedbackStatus.CLOSED:
        return 'Kapatıldı';
      default:
        return status;
    }
  };

  const roadmapColumns = [
    {
      id: RoadmapStatus.PLANNED,
      title: 'Planlandı',
      icon: Clock,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    },
    {
      id: RoadmapStatus.IN_PROGRESS,
      title: 'Geliştiriliyor',
      icon: Zap,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      id: RoadmapStatus.DONE,
      title: 'Tamamlandı',
      icon: CheckCircle2,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-indigo-500 selection:text-white">
      {/* Public Header */}
      <header className="border-b border-border/70 bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-foreground">
                {slug.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground ml-2 hidden sm:inline">
                Topluluk Geri Bildirim Panosu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Talep Gönder
            </button>
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors hidden sm:inline-block"
            >
              Yönetici Girişi
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('feedbacks')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'feedbacks'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" /> Geri Bildirimler
            </button>
            <button
              onClick={() => setActiveTab('roadmap')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'roadmap'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Ürün Yol Haritası
            </button>
            <button
              onClick={() => setActiveTab('changelog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeTab === 'changelog'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" /> Yayın Notları
            </button>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Öneri ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-border bg-card text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 w-36 sm:w-52"
            />
          </div>
        </div>

        {/* FEEDBACKS TAB */}
        {activeTab === 'feedbacks' && (
          <div className="space-y-4">
            {/* Status pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  selectedStatus === 'ALL'
                    ? 'bg-secondary text-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Tümü ({feedbacks.length})
              </button>
              {Object.values(FeedbackStatus).map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStatus(s)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    selectedStatus === s
                      ? 'bg-secondary text-foreground font-bold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {statusLabel(s)}
                </button>
              ))}
            </div>

            {loadingFeedbacks ? (
              <div className="p-12 text-center text-muted-foreground text-xs">Yükleniyor...</div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="p-12 rounded-2xl border border-dashed border-border text-center bg-card/40">
                <p className="text-sm font-semibold text-foreground">Henüz kayıtlı öneri bulunamadı.</p>
                <button
                  onClick={() => setCreateModalOpen(true)}
                  className="mt-3 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm"
                >
                  İlk Öneriyi Siz Bırakın
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFeedbacks.map((fb) => (
                  <div
                    key={fb.id}
                    onClick={() => setSelectedFeedback(fb)}
                    className="p-5 rounded-2xl border border-border bg-card hover:border-indigo-500/40 shadow-sm transition-all cursor-pointer flex items-start gap-4 group"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        voteMutation.mutate(fb.id);
                      }}
                      className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border shrink-0 transition-all ${
                        fb.hasVoted
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                          : 'bg-secondary/50 hover:bg-secondary text-foreground border-border'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${fb.hasVoted ? 'fill-white' : ''}`} />
                      <span className="text-xs font-bold mt-1">{fb.voteCount}</span>
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-bold text-foreground group-hover:text-indigo-500 transition-colors">
                          {fb.title}
                        </h3>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground shrink-0">
                          {statusLabel(fb.status)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {fb.description}
                      </p>

                      <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground pt-3 border-t border-border/40">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(fb.createdAt).toLocaleDateString('tr-TR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {fb.commentCount} Yorum
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ROADMAP TAB */}
        {activeTab === 'roadmap' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmapColumns.map((col) => {
              const items = roadmapItems.filter((i) => i.status === col.id);
              const Icon = col.icon;
              return (
                <div
                  key={col.id}
                  className="rounded-2xl border border-border bg-card p-4 flex flex-col min-h-[450px]"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-lg border ${col.color}`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      <h3 className="font-bold text-sm text-foreground">{col.title}</h3>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-foreground">
                      {items.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {items.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-10">Bu aşamada kart yok</p>
                    ) : (
                      items.map((item) => (
                        <div
                          key={item.id}
                          className="p-4 rounded-xl border border-border bg-background/50 hover:border-indigo-500/40 transition-all shadow-sm"
                        >
                          <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                          {item.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          {item.feedback && (
                            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span className="flex items-center gap-1 text-indigo-500 font-semibold">
                                <ThumbsUp className="w-3 h-3" /> {item.feedback.voteCount} Oy
                              </span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CHANGELOG TAB */}
        {activeTab === 'changelog' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            {loadingChangelogs ? (
              <div className="p-12 text-center text-muted-foreground text-xs">Yayın notları yükleniyor...</div>
            ) : changelogs.length === 0 ? (
              <div className="p-12 rounded-2xl border border-dashed border-border text-center bg-card/40">
                <p className="text-sm font-semibold text-foreground">Henüz yayınlanmış bir sürüm notu bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
                {changelogs.map((item) => (
                  <div key={item.id} className="relative pl-9 group">
                    <div className="absolute left-1.5 top-5 w-4 h-4 rounded-full border-2 border-indigo-500 bg-background group-hover:bg-indigo-500 transition-colors" />

                    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-3">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {item.version && (
                            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-secondary text-foreground border border-border">
                              {item.version}
                            </span>
                          )}
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                            {item.category === ChangelogCategory.NEW_FEATURE
                              ? 'Yeni Özellik'
                              : item.category === ChangelogCategory.IMPROVEMENT
                              ? 'İyileştirme'
                              : 'Hata Düzeltme'}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.publishedAt).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {item.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* CREATE FEEDBACK MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Geri Bildirim / Özellik Talebi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Geliştirme ekibine yeni bir özellik veya iyileştirme önerisinde bulunun.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!fbTitle.trim()) return;
                createFeedbackMutation.mutate({
                  title: fbTitle,
                  description: fbDescription,
                  authorName: authorName.trim() || 'Misafir Kullanıcı',
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Öneri Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="örn. CSV Olarak Dışa Aktar"
                  value={fbTitle}
                  onChange={(e) => setFbTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Detaylı Açıklama
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Bu özellik ne işe yarayacak? Nasıl bir fayda sağlayacak?"
                  value={fbDescription}
                  onChange={(e) => setFbDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Adınız (İsteğe bağlı)
                  </label>
                  <input
                    type="text"
                    placeholder="Adınız"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    E-posta (Bilgilendirme için)
                  </label>
                  <input
                    type="email"
                    placeholder="posta@ornek.com"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createFeedbackMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  {createFeedbackMutation.isPending ? 'Gönderiliyor...' : 'Talebi İlet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK DETAIL DRAWER */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-card border-l border-border p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                  {statusLabel(selectedFeedback.status)}
                </span>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-extrabold text-foreground mt-5">
                {selectedFeedback.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedFeedback.description}
              </p>

              {/* Vote button */}
              <div className="mt-6">
                <button
                  onClick={() => voteMutation.mutate(selectedFeedback.id)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                    selectedFeedback.hasVoted
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                      : 'bg-secondary text-foreground border-border hover:bg-secondary/80'
                  }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${selectedFeedback.hasVoted ? 'fill-white' : ''}`} />
                  {selectedFeedback.hasVoted ? 'Oyunuz Kaydedildi' : 'Bu Talebe Oy Ver'} (
                  {selectedFeedback.voteCount})
                </button>
              </div>

              {/* Comments section */}
              <div className="mt-10 pt-6 border-t border-border">
                <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Yorumlar ({comments.length})
                </h4>

                <div className="space-y-3 mb-6">
                  {comments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Henüz yorum yapılmamış.</p>
                  ) : (
                    comments.map((c) => (
                      <div key={c.id} className="p-3.5 rounded-xl bg-secondary/40 border border-border/60">
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                          <span className="font-semibold text-foreground">{c.authorName}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString('tr-TR')}</span>
                        </div>
                        <p className="text-xs text-foreground/90 leading-relaxed">{c.body}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add comment */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentBody.trim()) return;
                    addCommentMutation.mutate({
                      feedbackId: selectedFeedback.id,
                      body: commentBody,
                      name: commenterName || 'Misafir',
                    });
                  }}
                  className="space-y-2"
                >
                  <input
                    type="text"
                    placeholder="Adınız (İsteğe bağlı)"
                    value={commenterName}
                    onChange={(e) => setCommenterName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Bir yorum ekleyin..."
                      value={commentBody}
                      onChange={(e) => setCommentBody(e.target.value)}
                      className="flex-1 px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={addCommentMutation.isPending}
                      className="px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Gönder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Powered by FeedbackPulse Footer Badge (Prompt Free Plan watermark requirement) */}
      <footer className="border-t border-border/60 py-6 text-center text-xs text-muted-foreground">
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 font-medium hover:text-indigo-500 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Powered by <strong>FeedbackPulse</strong></span>
        </Link>
      </footer>
    </div>
  );
}
