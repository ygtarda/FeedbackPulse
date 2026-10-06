'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Plus,
  ThumbsUp,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  Clock,
  Zap,
  GripVertical,
  Trash2,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { RoadmapStatus, RoadmapItemSummary } from '@feedbackpulse/types';

export default function RoadmapPage() {
  const queryClient = useQueryClient();
  const currentTenant = useAuthStore((s) => s.currentTenant);

  // Modals & Search state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<RoadmapStatus>(RoadmapStatus.PLANNED);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<RoadmapItemSummary | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Drag and Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<RoadmapStatus | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below' | null>(null);

  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((prev) => (prev === message ? null : prev));
    }, 3500);
  };

  // Queries
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['roadmap', currentTenant?.id],
    queryFn: () => apiClient.listRoadmap(),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { title: string; description?: string; status: RoadmapStatus }) =>
      apiClient.createRoadmapItem({ ...data, position: 0 }),
    onSuccess: (newItem) => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      setCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      showToast(`"${newItem.title}" yol haritasına eklendi!`);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({
      id,
      status,
      position,
    }: {
      id: string;
      status?: RoadmapStatus;
      position?: number;
    }) => apiClient.updateRoadmapItem(id, { status, position }),
    onMutate: async ({ id, status, position }) => {
      await queryClient.cancelQueries({ queryKey: ['roadmap', currentTenant?.id] });
      const previousItems = queryClient.getQueryData<RoadmapItemSummary[]>([
        'roadmap',
        currentTenant?.id,
      ]);

      if (previousItems) {
        queryClient.setQueryData<RoadmapItemSummary[]>(
          ['roadmap', currentTenant?.id],
          (old = []) =>
            old.map((item) => {
              if (item.id === id) {
                return {
                  ...item,
                  status: status || item.status,
                  position: position !== undefined ? position : item.position,
                };
              }
              return item;
            }),
        );
      }

      return { previousItems };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['roadmap', currentTenant?.id], context.previousItems);
      }
      showToast('Kart güncellenirken bir hata oluştu');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      // Invalidate feedbacks as well since status might be linked
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteRoadmapItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      setSelectedItem(null);
      showToast('Kart başarıyla silindi');
    },
  });

  const columns = [
    {
      id: RoadmapStatus.PLANNED,
      title: 'Planlandı',
      subtitle: 'Sıradaki hedefler ve tasarım aşaması',
      icon: Clock,
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-500',
      activeBorder: 'border-amber-500/60 ring-2 ring-amber-500/20 bg-amber-500/[0.03]',
      accentGradient: 'from-amber-500 to-amber-600',
    },
    {
      id: RoadmapStatus.IN_PROGRESS,
      title: 'Geliştiriliyor',
      subtitle: 'Ekip tarafından aktif olarak kodlananlar',
      icon: Zap,
      badgeColor: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500',
      activeBorder: 'border-indigo-500/60 ring-2 ring-indigo-500/20 bg-indigo-500/[0.03]',
      accentGradient: 'from-indigo-500 to-indigo-600',
    },
    {
      id: RoadmapStatus.DONE,
      title: 'Tamamlandı',
      subtitle: 'Başarıyla yayına alınan özellikler',
      icon: CheckCircle2,
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500',
      activeBorder: 'border-emerald-500/60 ring-2 ring-emerald-500/20 bg-emerald-500/[0.03]',
      accentGradient: 'from-emerald-500 to-emerald-600',
    },
  ];

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverColumn(null);
    setDragOverItemId(null);
    setDropPosition(null);
  };

  const handleDragOverColumn = (e: React.DragEvent, colStatus: RoadmapStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colStatus) {
      setDragOverColumn(colStatus);
    }
  };

  const handleDragLeaveColumn = (e: React.DragEvent) => {
    // Only clear if leaving the column itself, not entering a child
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverColumn(null);
  };

  const handleDragOverCard = (e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (itemId === draggedItemId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const isAbove = e.clientY < midY;

    setDragOverItemId(itemId);
    setDropPosition(isAbove ? 'above' : 'below');
  };

  const handleDropOnColumn = (e: React.DragEvent, targetStatus: RoadmapStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!id) return;

    const draggedItem = items.find((i) => i.id === id);
    if (!draggedItem) return;

    // Check if column or position changed
    if (draggedItem.status !== targetStatus) {
      const colItems = items.filter((i) => i.status === targetStatus);
      const newPosition = colItems.length;

      updateItemMutation.mutate({
        id,
        status: targetStatus,
        position: newPosition,
      });

      const colTitle = columns.find((c) => c.id === targetStatus)?.title || targetStatus;
      showToast(`Kart "${colTitle}" aşamasına taşındı.`);
    }

    handleDragEnd();
  };

  const handleDropOnCard = (e: React.DragEvent, targetItem: RoadmapItemSummary) => {
    e.preventDefault();
    e.stopPropagation();

    const id = e.dataTransfer.getData('text/plain') || draggedItemId;
    if (!id || id === targetItem.id) {
      handleDragEnd();
      return;
    }

    const draggedItem = items.find((i) => i.id === id);
    if (!draggedItem) {
      handleDragEnd();
      return;
    }

    const targetStatus = targetItem.status;
    const colItems = items
      .filter((i) => i.status === targetStatus && i.id !== id)
      .sort((a, b) => a.position - b.position);

    const targetIdx = colItems.findIndex((i) => i.id === targetItem.id);
    const newIdx = dropPosition === 'above' ? targetIdx : targetIdx + 1;

    updateItemMutation.mutate({
      id,
      status: targetStatus,
      position: Math.max(0, newIdx),
    });

    const colTitle = columns.find((c) => c.id === targetStatus)?.title || targetStatus;
    showToast(`Kart sıralandı (${colTitle})`);

    handleDragEnd();
  };

  // Filtered items
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-card border border-indigo-500/40 text-foreground text-sm shadow-xl shadow-indigo-500/10 animate-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Ürün Yol Haritası (Roadmap)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Kanban
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Kartları sütunlar arasında <strong className="text-foreground">sürükleyip bırakarak</strong> durumlarını anında güncelleyin.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Kart ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 rounded-xl text-xs bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Yeni Kart Ekle
          </button>
        </div>
      </div>

      {/* KANBAN BOARD */}
      {isLoading ? (
        <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm">Yol haritası yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((col) => {
            const colItems = filteredItems
              .filter((i) => i.status === col.id)
              .sort((a, b) => a.position - b.position);
            const Icon = col.icon;
            const isColumnActive = dragOverColumn === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOverColumn(e, col.id)}
                onDragLeave={handleDragLeaveColumn}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
                className={`rounded-2xl border transition-all duration-200 flex flex-col min-h-[580px] p-4 relative overflow-hidden backdrop-blur-md ${
                  isColumnActive
                    ? `${col.activeBorder}`
                    : 'border-border bg-card/60 hover:border-border/80'
                }`}
              >
                {/* Column Top Accent Line */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${col.accentGradient}`}
                />

                {/* Column Header */}
                <div className="flex items-center justify-between pb-3.5 mb-3 border-b border-border/60">
                  <div className="flex items-center gap-2.5">
                    <span className={`p-2 rounded-xl border ${col.badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                        {col.title}
                      </h3>
                      <p className="text-[11px] text-muted-foreground">{col.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-secondary text-foreground/80 border border-border/50">
                    {colItems.length}
                  </span>
                </div>

                {/* Drop Zone Visual Cue when dragging over */}
                {isColumnActive && (
                  <div className="mb-3 py-2 px-3 rounded-xl border border-dashed border-indigo-500/50 bg-indigo-500/10 text-center text-xs font-medium text-indigo-400 animate-pulse">
                    Kartı buraya bırakın
                  </div>
                )}

                {/* Cards List */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {colItems.length === 0 ? (
                    <div
                      onDragOver={(e) => handleDragOverColumn(e, col.id)}
                      onDrop={(e) => handleDropOnColumn(e, col.id)}
                      className="h-44 flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground border border-dashed border-border/70 rounded-xl bg-background/30"
                    >
                      <p>Bu sütunda kart yok</p>
                      <p className="text-[11px] mt-1 opacity-70">
                        Kart sürükleyip bırakabilir veya yeni ekleyebilirsiniz.
                      </p>
                    </div>
                  ) : (
                    colItems.map((item) => {
                      const isBeingDragged = draggedItemId === item.id;
                      const isTargetHovered = dragOverItemId === item.id;

                      return (
                        <div key={item.id} className="relative group">
                          {/* Drop Indicator - Above */}
                          {isTargetHovered && dropPosition === 'above' && (
                            <div className="h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] my-1 animate-pulse" />
                          )}

                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, item.id)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleDragOverCard(e, item.id)}
                            onDrop={(e) => handleDropOnCard(e, item)}
                            onClick={() => setSelectedItem(item)}
                            className={`p-4 rounded-xl border bg-card transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
                              isBeingDragged
                                ? 'opacity-30 scale-95 border-dashed border-indigo-500 ring-2 ring-indigo-500/30'
                                : 'border-border/80 hover:border-indigo-500/50 hover:shadow-md hover:shadow-indigo-500/5'
                            }`}
                          >
                            {/* Card Header & Drag Handle */}
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm text-foreground leading-snug flex-1">
                                {item.title}
                              </h4>
                              <div className="text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0 cursor-grab">
                                <GripVertical className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Card Description */}
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                            )}

                            {/* Card Footer */}
                            <div className="mt-3.5 pt-3 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                              {item.feedback ? (
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1 font-semibold text-indigo-500">
                                    <ThumbsUp className="w-3.5 h-3.5" />
                                    {item.feedback.voteCount}
                                  </span>
                                  {item.feedback.commentCount !== undefined && (
                                    <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
                                      <MessageSquare className="w-3 h-3" />
                                      {item.feedback.commentCount}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-[11px] px-2 py-0.5 rounded-md bg-secondary/80 font-medium">
                                  Dahili Görev
                                </span>
                              )}

                              {/* Action Buttons */}
                              <div
                                className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {/* Quick Move Left */}
                                {col.id !== RoadmapStatus.PLANNED && (
                                  <button
                                    onClick={() =>
                                      updateItemMutation.mutate({
                                        id: item.id,
                                        status:
                                          col.id === RoadmapStatus.DONE
                                            ? RoadmapStatus.IN_PROGRESS
                                            : RoadmapStatus.PLANNED,
                                      })
                                    }
                                    title="Sola Taşı"
                                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <ArrowLeft className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Quick Move Right */}
                                {col.id !== RoadmapStatus.DONE && (
                                  <button
                                    onClick={() =>
                                      updateItemMutation.mutate({
                                        id: item.id,
                                        status:
                                          col.id === RoadmapStatus.PLANNED
                                            ? RoadmapStatus.IN_PROGRESS
                                            : RoadmapStatus.DONE,
                                      })
                                    }
                                    title="Sağa Taşı"
                                    className="p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                  >
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                {/* Delete */}
                                <button
                                  onClick={() => {
                                    if (confirm(`"${item.title}" kartını silmek istiyor musunuz?`)) {
                                      deleteMutation.mutate(item.id);
                                    }
                                  }}
                                  title="Sil"
                                  className="p-1 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Drop Indicator - Below */}
                          {isTargetHovered && dropPosition === 'below' && (
                            <div className="h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] my-1 animate-pulse" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  selectedItem.status === RoadmapStatus.PLANNED
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-500'
                    : selectedItem.status === RoadmapStatus.IN_PROGRESS
                      ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500'
                      : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {columns.find((c) => c.id === selectedItem.status)?.title}
              </span>
              <span className="text-xs text-muted-foreground">
                Oluşturulma: {new Date(selectedItem.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>

            <h2 className="text-xl font-bold text-foreground leading-snug">
              {selectedItem.title}
            </h2>

            {selectedItem.description && (
              <div className="p-3.5 rounded-xl bg-background/50 border border-border text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                {selectedItem.description}
              </div>
            )}

            {selectedItem.feedback && (
              <div className="p-3 rounded-xl border border-indigo-500/20 bg-indigo-500/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-indigo-500" />
                  <span className="font-semibold text-foreground">
                    Bu kart bir müşteri geri bildirimiyle bağlantılıdır
                  </span>
                </div>
                <span className="font-bold text-indigo-500">
                  {selectedItem.feedback.voteCount} Oy
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <button
                onClick={() => {
                  if (confirm('Bu kartı yol haritasından silmek istiyor musunuz?')) {
                    deleteMutation.mutate(selectedItem.id);
                  }
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Kartı Sil
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Aşama Değiştir:</span>
                <select
                  value={selectedItem.status}
                  onChange={(e) => {
                    const nextStatus = e.target.value as RoadmapStatus;
                    updateItemMutation.mutate({
                      id: selectedItem.id,
                      status: nextStatus,
                    });
                    setSelectedItem((prev) => (prev ? { ...prev, status: nextStatus } : null));
                    showToast(`Aşama "${columns.find((c) => c.id === nextStatus)?.title}" olarak güncellendi.`);
                  }}
                  className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value={RoadmapStatus.PLANNED}>Planlandı</option>
                  <option value={RoadmapStatus.IN_PROGRESS}>Geliştiriliyor</option>
                  <option value={RoadmapStatus.DONE}>Tamamlandı</option>
                </select>
              </div>
            </div>
          </div>
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
                <label className="block text-xs font-semibold text-foreground mb-1">Başlangıç Aşaması</label>
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
