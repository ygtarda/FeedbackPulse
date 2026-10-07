'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Sparkles,
  Plus,
  Calendar,
  Tag,
  Edit2,
  Trash2,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Zap,
  Wrench,
  Bug,
  Globe,
} from 'lucide-react';
import { ChangelogEntrySummary, ChangelogCategory, Role } from '@feedbackpulse/types';

export default function ChangelogPage() {
  const queryClient = useQueryClient();
  const currentTenant = useAuthStore((s) => s.currentTenant);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChangelogEntrySummary | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [version, setVersion] = useState('');
  const [category, setCategory] = useState<ChangelogCategory>(ChangelogCategory.NEW_FEATURE);
  const [isPublished, setIsPublished] = useState(true);

  // Query
  const { data: entries = [], isLoading } = useQuery({
    queryKey: ['changelogs', currentTenant?.id],
    queryFn: () => apiClient.listChangelogs(false),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiClient.createChangelog(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelogs'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiClient.updateChangelog(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelogs'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteChangelog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['changelogs'] });
    },
  });

  const openCreateModal = () => {
    setEditingEntry(null);
    setTitle('');
    setBody('');
    setVersion('v1.0.0');
    setCategory(ChangelogCategory.NEW_FEATURE);
    setIsPublished(true);
    setCreateModalOpen(true);
  };

  const openEditModal = (entry: ChangelogEntrySummary) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setBody(entry.body);
    setVersion(entry.version || '');
    setCategory(entry.category);
    setIsPublished(entry.isPublished);
    setCreateModalOpen(true);
  };

  const closeModal = () => {
    setCreateModalOpen(false);
    setEditingEntry(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    if (editingEntry) {
      updateMutation.mutate({
        id: editingEntry.id,
        data: { title, body, version, category, isPublished },
      });
    } else {
      createMutation.mutate({
        title,
        body,
        version: version.trim() || undefined,
        category,
        isPublished,
      });
    }
  };

  const categoryBadge = (cat: ChangelogCategory) => {
    switch (cat) {
      case ChangelogCategory.NEW_FEATURE:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Zap className="w-3 h-3" /> Yeni Özellik
          </span>
        );
      case ChangelogCategory.IMPROVEMENT:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
            <Wrench className="w-3 h-3" /> İyileştirme
          </span>
        );
      case ChangelogCategory.BUG_FIX:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Bug className="w-3 h-3" /> Hata Düzeltme
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Yayın Notları & Güncellemeler (Changelog)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Faz 2
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kullanıcılarınıza ve müşterilerinize yeni özelliklerinizi ve sürümlerinizi duyurun.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`/p/${currentTenant?.slug || 'acme'}`}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border bg-card hover:bg-secondary/70 text-foreground transition-colors flex items-center gap-1.5"
          >
            <Globe className="w-3.5 h-3.5 text-indigo-500" /> Public Sayfada Gör
          </a>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Yeni Yayın Notu Ekle
          </button>
        </div>
      </div>

      {/* Changelog Timeline List */}
      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground">Yayın notları yükleniyor...</div>
      ) : entries.length === 0 ? (
        <div className="p-12 rounded-2xl border border-dashed border-border text-center bg-card/40">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-foreground">Henüz yayın notu oluşturulmadı</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Kullanıcılarınıza ürününüzdeki son yenilikleri duyurmak için ilk sürüm notunu ekleyin.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white shadow-sm"
          >
            + İlk Notu Ekle
          </button>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-border/60">
          {entries.map((entry) => (
            <div key={entry.id} className="relative pl-9 group">
              {/* Timeline indicator node */}
              <div className="absolute left-1.5 top-5 w-4 h-4 rounded-full border-2 border-indigo-500 bg-background group-hover:bg-indigo-500 transition-colors" />

              <div className="p-6 rounded-2xl border border-border bg-card hover:border-indigo-500/40 shadow-sm transition-all">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    {entry.version && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-secondary text-foreground border border-border">
                        {entry.version}
                      </span>
                    )}
                    {categoryBadge(entry.category)}
                    {entry.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                        <Eye className="w-3 h-3" /> Yayında
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <EyeOff className="w-3 h-3" /> Taslak
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(entry.publishedAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>

                    <button
                      onClick={() => openEditModal(entry)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`"${entry.title}" yayın notunu silmek istiyor musunuz?`)) {
                          deleteMutation.mutate(entry.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-bold text-foreground mt-4">{entry.title}</h2>
                <div className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {entry.body}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">
              {editingEntry ? 'Yayın Notunu Düzenle' : 'Yeni Yayın Notu / Güncelleme Ekle'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Müşterilerinize ürününüzün son değişikliklerini bildirin.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Başlık</label>
                <input
                  type="text"
                  required
                  placeholder="örn. Çoklu Dil Desteği ve Hızlı Arama"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">
                    Sürüm Kodu (Opsiyonel)
                  </label>
                  <input
                    type="text"
                    placeholder="v1.2.0"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background font-mono text-xs text-foreground focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ChangelogCategory)}
                    className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none"
                  >
                    <option value={ChangelogCategory.NEW_FEATURE}>Yeni Özellik</option>
                    <option value={ChangelogCategory.IMPROVEMENT}>İyileştirme</option>
                    <option value={ChangelogCategory.BUG_FIX}>Hata Düzeltme</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Yayın Notu Açıklaması
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="Bu sürümde neleri kullanıma aldınız? Kullanıcı deneyimi nasıl değişti?"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isPublishedCheck"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isPublishedCheck" className="text-xs font-semibold text-foreground cursor-pointer">
                  Hemen Yayına Al (Public panoda ve widget'ta gösterilsin)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Kaydediliyor...'
                    : editingEntry
                    ? 'Değişiklikleri Kaydet'
                    : 'Yayın Notunu Paylaş'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
