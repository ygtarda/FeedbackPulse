'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { apiClient } from '../../../lib/api-client';
import {
  FeedbackSummary,
  BoardSummary,
} from '@feedbackpulse/types';
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Send,
  CheckCircle2,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';

export default function PublicWidgetPage() {
  const params = useParams();
  const slug = (params.slug as string) || 'acme';

  const [activeTab, setActiveTab] = useState<'feed' | 'new'>('feed');
  const [feedbacks, setFeedbacks] = useState<FeedbackSummary[]>([]);
  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    loadWidgetData();
  }, [slug]);

  const loadWidgetData = async () => {
    try {
      const bList = await apiClient.listBoards();
      setBoards(bList);
      if (bList.length > 0) {
        setSelectedBoardId(bList[0].id);
        const fList = await apiClient.listFeedbacks({ boardId: bList[0].id });
        setFeedbacks(fList);
      }
    } catch {
      // Mock fallback
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (feedbackId: string) => {
    try {
      const res = await apiClient.toggleVote(feedbackId);
      setFeedbacks((prev) =>
        prev.map((f) =>
          f.id === feedbackId
            ? { ...f, voteCount: res.voteCount, hasVoted: res.voted }
            : f
        )
      );
    } catch {
      // Handled
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedBoardId) return;

    setSubmitting(true);
    try {
      const created = await apiClient.createFeedback({
        boardId: selectedBoardId,
        title,
        description,
      });

      setFeedbacks((prev) => [created, ...prev]);
      setSubmitted(true);
      setTitle('');
      setDescription('');
      setTimeout(() => {
        setSubmitted(false);
        setActiveTab('feed');
      }, 1500);
    } catch {
      // Handled
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter((f) =>
    f.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen bg-background text-foreground flex flex-col font-sans select-none antialiased">
      {/* Widget Header */}
      <div className="bg-card/90 backdrop-blur-md border-b border-border p-4 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              Geri Bildirim Paylaş
            </h1>
            <span className="text-[10px] text-muted-foreground block font-medium">
              @{slug} Topluluk Panosu
            </span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-secondary rounded-lg p-0.5 border border-border/60">
          <button
            onClick={() => setActiveTab('feed')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
              activeTab === 'feed'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Talepler
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'new'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Plus className="w-3 h-3" />
            Öneri Yaz
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto">
        {activeTab === 'feed' ? (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Özelliklerde ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-border bg-card placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Talepler yükleniyor...
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="py-12 text-center">
                <MessageSquare className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-xs text-muted-foreground">
                  {search ? 'Aramanıza uygun sonuç bulunamadı.' : 'Henüz geri bildirim bulunmuyor.'}
                </p>
                <button
                  onClick={() => setActiveTab('new')}
                  className="mt-3 text-xs text-indigo-500 font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" /> İlk öneriyi sen yap!
                </button>
              </div>
            ) : (
              filteredFeedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border/80 bg-card/70 hover:border-border transition-all flex items-start justify-between gap-3 shadow-xs"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-bold text-foreground leading-snug break-words">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground uppercase tracking-wider">
                        {item.status.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {item.commentCount || 0} yorum
                      </span>
                    </div>
                  </div>

                  {/* Vote Button */}
                  <button
                    onClick={() => handleVote(item.id)}
                    className={`flex flex-col items-center justify-center min-w-[38px] px-2 py-1.5 rounded-lg border text-xs font-bold transition-all shrink-0 ${
                      item.hasVoted
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-secondary/70 border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 mb-0.5 ${item.hasVoted ? 'fill-current' : ''}`} />
                    <span>{item.voteCount}</span>
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* New Feedback Form */
          <div className="max-w-md mx-auto">
            {submitted ? (
              <div className="py-12 text-center animate-in zoom-in-95">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-foreground">Geri Bildiriminiz Alındı!</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Öneriniz ürün ekibine başarıyla iletildi.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    Öneri veya Talep Başlığı
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Google ile Tek Tıkla Giriş Desteği"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-foreground mb-1">
                    Açıklama (Detaylar)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Bu özellik neden faydalı olurdu? Nasıl çalışmasını istersiniz?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                  />
                </div>

                {boards.length > 1 && (
                  <div>
                    <label className="block text-[11px] font-bold text-foreground mb-1">
                      İlgili Pano
                    </label>
                    <select
                      value={selectedBoardId}
                      onChange={(e) => setSelectedBoardId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-border bg-card text-foreground focus:outline-none"
                    >
                      {boards.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !title.trim()}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? 'Gönderiliyor...' : 'Geri Bildirimi Gönder'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Widget Footer */}
      <div className="p-2.5 bg-card/60 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground px-4">
        <span>Görüşleriniz ürünümüzü şekillendiriyor.</span>
        <a
          href="https://feedbackpulse.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 font-semibold text-indigo-500 hover:underline"
        >
          Feedback<span className="text-foreground">Pulse</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </a>
      </div>
    </div>
  );
}
