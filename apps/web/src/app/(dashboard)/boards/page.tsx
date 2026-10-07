'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Plus,
  ThumbsUp,
  MessageSquare,
  Clock,
  Filter,
  CheckCircle2,
  X,
  Send,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { FeedbackStatus, FeedbackSummary, BoardSummary } from '@feedbackpulse/types';

export default function BoardsPage() {
  const queryClient = useQueryClient();
  const currentTenant = useAuthStore((s) => s.currentTenant);

  // Filters & State
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'votes' | 'newest'>('votes');

  // Modals
  const [createFeedbackOpen, setCreateFeedbackOpen] = useState(false);
  const [createBoardOpen, setCreateBoardOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackSummary | null>(null);

  // Form states
  const [fbTitle, setFbTitle] = useState('');
  const [fbDescription, setFbDescription] = useState('');
  const [boardName, setBoardName] = useState('');
  const [boardSlug, setBoardSlug] = useState('');
  const [commentBody, setCommentBody] = useState('');

  // AI Duplicates State
  const [aiDuplicates, setAiDuplicates] = useState<
    Array<{ id: string; title: string; similarityScore: number }>
  >([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  React.useEffect(() => {
    if (!createFeedbackOpen || fbTitle.trim().length < 3) {
      setAiDuplicates([]);
      return;
    }
    const timer = setTimeout(async () => {
      setCheckingDuplicates(true);
      try {
        const res = await apiClient.detectAiDuplicates(fbTitle, fbDescription);
        setAiDuplicates(res.duplicates);
      } catch {
        // Fallback
      } finally {
        setCheckingDuplicates(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [fbTitle, fbDescription, createFeedbackOpen]);

  // Queries
  const { data: boards = [] } = useQuery({
    queryKey: ['boards', currentTenant?.id],
    queryFn: () => apiClient.listBoards(),
  });

  const activeBoardId = selectedBoardId || (boards[0] ? boards[0].id : undefined);

  const { data: feedbacks = [], isLoading: isLoadingFeedbacks } = useQuery({
    queryKey: ['feedbacks', currentTenant?.id, activeBoardId, statusFilter, sortBy],
    queryFn: () =>
      apiClient.listFeedbacks({
        boardId: activeBoardId,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        sortBy,
      }),
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ['comments', selectedFeedback?.id],
    queryFn: () => (selectedFeedback ? apiClient.listComments(selectedFeedback.id) : []),
    enabled: !!selectedFeedback,
  });

  // Mutations
  const voteMutation = useMutation({
    mutationFn: (feedbackId: string) => apiClient.toggleVote(feedbackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      if (selectedFeedback) {
        // update drawer
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
    mutationFn: (data: { boardId: string; title: string; description: string }) =>
      apiClient.createFeedback(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      setCreateFeedbackOpen(false);
      setFbTitle('');
      setFbDescription('');
    },
  });

  const createBoardMutation = useMutation({
    mutationFn: (data: { name: string; slug: string }) =>
      apiClient.createBoard({ ...data, isPrivate: false }),
    onSuccess: (newBoard) => {
      queryClient.invalidateQueries({ queryKey: ['boards'] });
      setCreateBoardOpen(false);
      setSelectedBoardId(newBoard.id);
      setBoardName('');
      setBoardSlug('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FeedbackStatus }) =>
      apiClient.updateFeedbackStatus(id, status),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      if (selectedFeedback) {
        setSelectedFeedback(updated);
      }
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ feedbackId, body }: { feedbackId: string; body: string }) =>
      apiClient.addComment(feedbackId, body),
    onSuccess: () => {
      refetchComments();
      setCommentBody('');
    },
  });

  const handleVote = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    voteMutation.mutate(id);
  };

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

  return (
    <div className="space-y-6">
      {/* Top Bar: Title & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Geri Bildirim Panoları
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kullanıcı taleplerini toplayın, oyları inceleyin ve önceliklendirin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateBoardOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-secondary/70 transition-colors"
          >
            + Yeni Pano
          </button>
          <button
            onClick={() => setCreateFeedbackOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Yeni Geri Bildirim
          </button>
        </div>
      </div>

      {/* Board Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/60">
        {boards.map((b) => {
          const isActive = activeBoardId === b.id;
          return (
            <button
              key={b.id}
              onClick={() => setSelectedBoardId(b.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-border'
              }`}
            >
              {b.name}
            </button>
          );
        })}
      </div>

      {/* Filters & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-card border border-border">
        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-secondary text-foreground font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tümü
          </button>
          {Object.values(FeedbackStatus).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-secondary text-foreground font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {statusLabel(status)}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">Sırala:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:outline-none"
          >
            <option value="votes">En Çok Oy Alanlar</option>
            <option value="newest">En Yeniler</option>
          </select>
        </div>
      </div>

      {/* Feedback List */}
      {isLoadingFeedbacks ? (
        <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
      ) : feedbacks.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border text-center bg-card/40">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground">Henüz geri bildirim bulunmuyor</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Kullanıcılarınızdan ilk özellik talebini toplamak için yeni bir kayıt oluşturun.
          </p>
          <button
            onClick={() => setCreateFeedbackOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm"
          >
            + İlk Feedback'i Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((fb) => (
            <div
              key={fb.id}
              onClick={() => setSelectedFeedback(fb)}
              className="p-5 rounded-2xl border border-border bg-card hover:border-indigo-500/40 shadow-sm transition-all cursor-pointer flex items-start gap-4 group"
            >
              {/* Vote button */}
              <button
                onClick={(e) => handleVote(e, fb.id)}
                className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl border shrink-0 transition-all ${
                  fb.hasVoted
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                    : 'bg-secondary/50 hover:bg-secondary text-foreground border-border group-hover:border-indigo-500/30'
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${fb.hasVoted ? 'fill-white' : ''}`} />
                <span className="text-xs font-bold mt-1">{fb.voteCount}</span>
              </button>

              {/* Info */}
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
                  <span>Gönderen: {fb.authorName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE FEEDBACK MODAL */}
      {createFeedbackOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateFeedbackOpen(false)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Yeni Geri Bildirim Talebi</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ürün için yeni bir özellik veya iyileştirme önerin.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!fbTitle.trim() || !activeBoardId) return;
                createFeedbackMutation.mutate({
                  boardId: activeBoardId,
                  title: fbTitle,
                  description: fbDescription,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Özellik / Talep Başlığı
                </label>
                <input
                  type="text"
                  required
                  placeholder="örn. Çoklu Dil (i18n) Desteği"
                  value={fbTitle}
                  onChange={(e) => setFbTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {checkingDuplicates && (
                  <span className="text-[11px] text-muted-foreground mt-1 block flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-500 animate-spin" /> Benzer talepler taranıyor...
                  </span>
                )}
                {aiDuplicates.length > 0 && (
                  <div className="mt-2.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Yapay Zeka Benzer Talepler Buldu:</span>
                    </div>
                    <div className="space-y-1">
                      {aiDuplicates.map((dup) => (
                        <div
                          key={dup.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-background/80 border border-border/50 text-xs"
                        >
                          <span className="font-semibold text-foreground truncate mr-2">{dup.title}</span>
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold shrink-0">
                            %{dup.similarityScore} Benzer
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Mükerrer açmak yerine mevcut talebe oy vererek geliştirilme şansını artırabilirsiniz.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Açıklama & Gerekçe
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Bu özelliğin kullanıcıya veya iş akışına faydası nedir?"
                  value={fbDescription}
                  onChange={(e) => setFbDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateFeedbackOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createFeedbackMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  {createFeedbackMutation.isPending ? 'Oluşturuluyor...' : 'Geri Bildirimi Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE BOARD MODAL */}
      {createBoardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateBoardOpen(false)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Yeni Geri Bildirim Panosu</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!boardName.trim()) return;
                createBoardMutation.mutate({
                  name: boardName,
                  slug: boardSlug || boardName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Pano Adı</label>
                <input
                  type="text"
                  required
                  placeholder="örn. Mobil Uygulama"
                  value={boardName}
                  onChange={(e) => {
                    setBoardName(e.target.value);
                    setBoardSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Pano Slug (URL)</label>
                <input
                  type="text"
                  required
                  placeholder="mobil-uygulama"
                  value={boardSlug}
                  onChange={(e) => setBoardSlug(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm font-mono text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateBoardOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createBoardMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  Panoyu Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FEEDBACK DETAIL DRAWER / MODAL */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl h-full bg-card border-l border-border p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl relative">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-xs font-semibold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                  Feedback Detayı
                </span>
                <button
                  onClick={() => setSelectedFeedback(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status updater for Admin/Owner */}
              <div className="mt-5 p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">Durum (Yönetici):</span>
                <select
                  value={selectedFeedback.status}
                  onChange={(e) =>
                    updateStatusMutation.mutate({
                      id: selectedFeedback.id,
                      status: e.target.value as FeedbackStatus,
                    })
                  }
                  className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-none"
                >
                  {Object.values(FeedbackStatus).map((s) => (
                    <option key={s} value={s}>
                      {statusLabel(s)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Desc */}
              <h2 className="text-2xl font-extrabold text-foreground mt-5">
                {selectedFeedback.title}
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {selectedFeedback.description}
              </p>

              {/* Vote toggle inside drawer */}
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

              {/* Comments Section */}
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

                {/* Add Comment Form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!commentBody.trim()) return;
                    addCommentMutation.mutate({
                      feedbackId: selectedFeedback.id,
                      body: commentBody,
                    });
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    placeholder="Bir yorum yazın..."
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={addCommentMutation.isPending}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Gönder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
