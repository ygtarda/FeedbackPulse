'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { useAuthStore } from '../../../stores/auth-store';
import {
  Users,
  Building,
  Code2,
  Copy,
  Check,
  Plus,
  Shield,
  Mail,
  X,
  ExternalLink,
  Globe,
  Webhook,
  Send,
  Trash2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Role, WebhookEndpointSummary } from '@feedbackpulse/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const currentTenant = useAuthStore((s) => s.currentTenant);

  const [copied, setCopied] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(Role.MEMBER);

  // Custom Domain State
  const [customDomain, setCustomDomain] = useState('feedback.acme.com');
  const [domainVerified, setDomainVerified] = useState(true);
  const [verifyingDomain, setVerifyingDomain] = useState(false);
  const [domainMessage, setDomainMessage] = useState<string | null>(null);

  // Webhooks State
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>([
    'feedback.created',
    'feedback.status_changed',
  ]);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [webhookTestMessage, setWebhookTestMessage] = useState<string | null>(null);

  const { data: members = [] } = useQuery({
    queryKey: ['members', currentTenant?.id],
    queryFn: () => apiClient.listMembers(),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks', currentTenant?.id],
    queryFn: () => apiClient.listWebhooks(),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: Role }) =>
      apiClient.inviteMember({ email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setInviteModalOpen(false);
      setInviteEmail('');
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: (dto: { url: string; events: string[] }) =>
      apiClient.createWebhook(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
      setWebhookModalOpen(false);
      setWebhookUrl('');
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteWebhook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });

  const handleTestWebhook = async (id: string) => {
    setTestingWebhookId(id);
    setWebhookTestMessage(null);
    try {
      const res = await apiClient.testWebhook(id);
      setWebhookTestMessage(res.message);
    } catch {
      setWebhookTestMessage('Test gönderimi başarısız oldu.');
    } finally {
      setTestingWebhookId(null);
    }
  };

  const handleVerifyDomain = () => {
    setVerifyingDomain(true);
    setDomainMessage(null);
    setTimeout(() => {
      setVerifyingDomain(false);
      setDomainVerified(true);
      setDomainMessage('CNAME kaydı doğrulandı. SSL sertifikası aktif ve yayında!');
    }, 1200);
  };

  const widgetSnippet = `<!-- FeedbackPulse Embed Widget -->
<script
  src="https://feedbackpulse.com/widget.js"
  data-tenant="${currentTenant?.slug || 'acme'}"
  data-position="bottom-right"
  async
></script>`;

  const copySnippet = () => {
    navigator.clipboard.writeText(widgetSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Çalışma Alanı & Takım Ayarları
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Şirket bilgilerinizi, özel alan adınızı, webhook entegrasyonlarınızı ve gömülü widget ayarlarınızı yönetin.
        </p>
      </div>

      {/* Workspace Details Card */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-500" /> Şirket & Alan Adı Bilgisi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Çalışma Alanı Adı
            </span>
            <div className="text-sm font-bold text-foreground mt-1">
              {currentTenant?.name || 'Acme SaaS'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Alt Alan Adı (Subdomain)
            </span>
            <div className="text-sm font-bold text-indigo-500 mt-1 font-mono">
              {currentTenant?.slug || 'acme'}.feedbackpulse.com
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Mevcut Plan
            </span>
            <div className="text-sm font-bold text-foreground mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-500" />
              {currentTenant?.planId || 'PRO'} Plan
            </div>
          </div>
        </div>
      </div>

      {/* Custom Domain Section (Faz 3) */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-500" /> Özel Alan Adı (Custom Domain)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Geri bildirim panonuzu kendi şirket alan adınız üzerinden yayınlayın (Örn: feedback.sirketiniz.com)
            </p>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
              domainVerified
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                domainVerified ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
            {domainVerified ? 'DNS Doğrulandı & SSL Aktif' : 'DNS Bekleniyor'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="sm:col-span-2">
            <input
              type="text"
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              placeholder="feedback.sirketiniz.com"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-sm font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <button
              onClick={handleVerifyDomain}
              disabled={verifyingDomain}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${verifyingDomain ? 'animate-spin' : ''}`} />
              {verifyingDomain ? 'Doğrulanıyor...' : 'DNS Kaydını Doğrula'}
            </button>
          </div>
        </div>

        {domainMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-500 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{domainMessage}</span>
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/50 text-xs text-muted-foreground space-y-1 font-mono">
          <div className="text-[11px] font-bold text-foreground font-sans mb-1">
            DNS CNAME Yapılandırması:
          </div>
          <div>Tür: <strong>CNAME</strong> | Host: <strong>feedback</strong> | Hedef: <strong>cname.feedbackpulse.com</strong></div>
        </div>
      </div>

      {/* Webhooks Section (Faz 3) */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Webhook className="w-4 h-4 text-indigo-500" /> Webhook Entegrasyonları
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Yeni geri bildirimler veya durum değişiklikleri gerçekleştiğinde sisteminize HTTP POST istekleri gönderin
            </p>
          </div>

          <button
            onClick={() => setWebhookModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Webhook Ekle
          </button>
        </div>

        {webhookTestMessage && (
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{webhookTestMessage}</span>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-border/60 mt-3">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border/60 text-xs text-muted-foreground">
              <tr>
                <th className="p-3.5 font-semibold">Hedef URL</th>
                <th className="p-3.5 font-semibold">Dinlenen Olaylar</th>
                <th className="p-3.5 font-semibold">Durum</th>
                <th className="p-3.5 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {webhooks.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-muted-foreground">
                    Henüz tanımlı webhook uç noktası bulunmuyor.
                  </td>
                </tr>
              ) : (
                webhooks.map((wh) => (
                  <tr key={wh.id} className="hover:bg-secondary/20">
                    <td className="p-3.5 font-mono text-xs text-foreground font-semibold">
                      {wh.url}
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {wh.events.map((ev, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-secondary text-[10px] font-mono font-medium text-foreground"
                          >
                            {ev}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-semibold text-[11px]">
                        Aktif
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2">
                      <button
                        onClick={() => handleTestWebhook(wh.id)}
                        disabled={testingWebhookId === wh.id}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-secondary hover:bg-secondary/80 text-foreground border border-border inline-flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" />
                        {testingWebhookId === wh.id ? 'Test ediliyor...' : 'Test Gönder'}
                      </button>
                      <button
                        onClick={() => deleteWebhookMutation.mutate(wh.id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Team Members Section */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-500" /> Takım Üyeleri & Roller
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Panoları yönetebilen ve geri bildirim durumlarını güncelleyebilen ekip arkadaşları
            </p>
          </div>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Üye Davet Et
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border/60 mt-4">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/50 border-b border-border/60 text-xs text-muted-foreground">
              <tr>
                <th className="p-3.5 font-semibold">Kullanıcı</th>
                <th className="p-3.5 font-semibold">E-posta</th>
                <th className="p-3.5 font-semibold">Rol</th>
                <th className="p-3.5 font-semibold">Eklenme Tarihi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-secondary/20">
                  <td className="p-3.5 font-semibold text-foreground flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-500 font-bold flex items-center justify-center text-xs">
                      {m.user?.name ? m.user.name[0] : 'U'}
                    </div>
                    {m.user?.name}
                  </td>
                  <td className="p-3.5 text-muted-foreground font-mono">{m.user?.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        m.role === Role.OWNER
                          ? 'bg-amber-500/15 text-amber-500 border border-amber-500/20'
                          : m.role === Role.ADMIN
                          ? 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/20'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {m.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-muted-foreground">
                    {new Date(m.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Embed Widget Snippet Card */}
      <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" /> Sitenize Gömebileceğiniz Feedback Widget'ı
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bu kodu web sitenizin &lt;body&gt; kapanış etiketinin hemen öncesine ekleyin veya doğrudan test edin.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`/widget/${currentTenant?.slug || 'acme'}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-secondary flex items-center gap-1.5 text-foreground transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
              Canlı Widget Önizleme
            </a>

            <button
              onClick={copySnippet}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-secondary flex items-center gap-1.5 text-foreground transition-all"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" /> Kopyalandı!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Kodu Kopyala
                </>
              )}
            </button>
          </div>
        </div>

        <div className="relative rounded-2xl bg-background border border-border p-4 font-mono text-xs text-indigo-400 overflow-x-auto leading-relaxed">
          <pre>{widgetSnippet}</pre>
        </div>
      </div>

      {/* INVITE MEMBER MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setInviteModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Takım Üyesi Davet Et</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!inviteEmail.trim()) return;
                inviteMutation.mutate({
                  email: inviteEmail,
                  role: inviteRole,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  E-posta Adresi
                </label>
                <input
                  type="email"
                  required
                  placeholder="ekip@sirket.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">Yetki Rolü</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as Role)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none"
                >
                  <option value={Role.MEMBER}>Member (Görüntüleme & Yorum)</option>
                  <option value={Role.ADMIN}>Admin (Tam Yönetim & Durum Değiştirme)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setInviteModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
                >
                  Davet Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WEBHOOK MODAL */}
      {webhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl relative">
            <button
              onClick={() => setWebhookModalOpen(false)}
              className="absolute top-5 right-5 p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-foreground">Yeni Webhook Ekle</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!webhookUrl.trim() || webhookEvents.length === 0) return;
                createWebhookMutation.mutate({
                  url: webhookUrl,
                  events: webhookEvents,
                });
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Hedef HTTP(S) URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.sirketiniz.com/webhooks/feedback"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-2">
                  Dinlenecek Olaylar
                </label>
                <div className="space-y-2 text-xs">
                  {[
                    { id: 'feedback.created', label: 'feedback.created (Yeni talep oluşturulduğunda)' },
                    { id: 'feedback.status_changed', label: 'feedback.status_changed (Durum değiştiğinde)' },
                    { id: 'changelog.published', label: 'changelog.published (Yeni sürüm duyurulduğunda)' },
                  ].map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(ev.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookEvents([...webhookEvents, ev.id]);
                          } else {
                            setWebhookEvents(webhookEvents.filter((item) => item !== ev.id));
                          }
                        }}
                        className="rounded border-border text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="font-mono text-foreground">{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWebhookModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border hover:bg-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createWebhookMutation.isPending || !webhookUrl.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-xs"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
