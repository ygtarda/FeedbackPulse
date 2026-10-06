'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Kanban,
  Plus,
  ThumbsUp,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { RoadmapStatus, RoadmapItemSummary } from '@feedbackpulse/types';

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const currentTenant = useAuthStore((s) => s.currentTenant);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<RoadmapStatus>(RoadmapStatus.PLANNED);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['roadmap', currentTenant?.id],
    queryFn: () => apiClient.listRoadmap(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; status: RoadmapStatus }) =>
      apiClient.createRoadmapItem({ ...data, position: 0 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RoadmapStatus }) =>
      apiClient.updateRoadmapItem(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
    },
  });

  const columns = [
    {
      id: RoadmapStatus.PLANNED,
      title: 'Planlandı',
      subtitle: 'Gelecek çeyrek planları',
      icon: Clock,
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
    },
    {
      id: RoadmapStatus.IN_PROGRESS,
      title: 'Geliştiriliyor',
      subtitle: 'Aktif olarak kodlananlar',
      icon: Zap,
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500',
    },
    {
      id: RoadmapStatus.DONE,
      title: 'Tamamlandı',
      subtitle: 'Yayına alınan özellikler',
      icon: CheckCircle2,
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Ürün Yol Haritası (Roadmap)
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Geliştirme hedeflerinizi Kanban panosu üzerinde takip edin ve müşterilerinizle paylaşın.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Yeni Kart Ekle
        </button>
      </div>

      {/* KANBAN BOARD */}
      {isLoading ? (
        <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colItems = items.filter((i) => i.status === col.id);
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                className="rounded-2xl border border-border bg-card/60 backdrop-blur-md p-4 flex flex-col min-h-[550px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className={`p-1.5 rounded-lg border ${col.color}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{col.title}</h3>
                      <p className="text-[11px] text-muted-foreground">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                    {colItems.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colItems.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground border border-dashed border-border/80 rounded-xl">
                      Bu sütunda kart yok
                    </div>
                  ) : (
                    colItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 rounded-xl border border-border bg-card hover:border-indigo-500/40 shadow-sm transition-all group"
                      >
                        <h4 className="font-bold text-sm text-foreground">{item.title}</h4>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}

                        <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                          {item.feedback ? (
                            <span className="flex items-center gap-1 font-semibold text-indigo-500">
                              <ThumbsUp className="w-3.5 h-3.5" />
                              {item.feedback.voteCount} Oy
                            </span>
                          ) : (
                            <span className="text-[11px]">Dahili Görev</span>
                          )}

                          {/* Quick move buttons */}
                          <div className="flex items-center gap-1">
                            {col.id !== RoadmapStatus.PLANNED && (
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: item.id,
                                    status:
                                      col.id === RoadmapStatus.DONE
                                        ? RoadmapStatus.IN_PROGRESS
                                        : RoadmapStatus.PLANNED,
                                  })
                                }
                                title="Geriye Taşı"
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                              >
                                <ArrowLeft className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {col.id !== RoadmapStatus.DONE && (
                              <button
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: item.id,
                                    status:
                                      col.id === RoadmapStatus.PLANNED
                                        ? RoadmapStatus.IN_PROGRESS
                                        : RoadmapStatus.DONE,
                                  })
                                }
                                title="İleriye Taşı"
                                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                              >
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE ROADMAP ITEM MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Yeni Yol Haritası Kartı</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newTitle.trim()) return;
                createMutation.mutate({
                  title: newTitle,
                  description: newDescription,
                  status: newStatus,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Kart Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="örn. Çok Faktörlü Doğrulama (2FA)"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Açıklama</label>
                <textarea
                  rows={3}
                  placeholder="Kullanıcı güvenliği için SMS ve Authenticator desteği"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Aşama</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as RoadmapStatus)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                >
                  <option value={RoadmapStatus.PLANNED}>Planlandı (Planned)</option>
                  <option value={RoadmapStatus.IN_PROGRESS}>Geliştiriliyor (In Progress)</option>
                  <option value={RoadmapStatus.DONE}>Tamamlandı (Done)</option>
                </select>
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
                  disabled={createMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  Kartı Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
