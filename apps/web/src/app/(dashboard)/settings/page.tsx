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
} from 'lucide-react';
import { Role } from '@feedbackpulse/types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const currentTenant = useAuthStore((s) => s.currentTenant);

  const [copied, setCopied] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<Role>(Role.MEMBER);

  const { data: members = [] } = useQuery({
    queryKey: ['members', currentTenant?.id],
    queryFn: () => apiClient.listMembers(),
  });

  const inviteMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: Role }) =>
      apiClient.inviteMember(email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      setInviteModalOpen(false);
      setInviteEmail('');
    },
  });

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
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Çalışma Alanı & Takım Ayarları
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Şirket bilgilerinizi, takım üyelerinizi ve gömülü web widget ayarlarınızı yönetin.
        </p>
      </div>

      {/* Workspace Details Card */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <h2 className="text-base font-bold text-foreground flex items-center gap-2">
          <Building className="w-4 h-4 text-indigo-500" /> Şirket & Alan Adı Bilgisi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-secondary/50 border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Çalışma Alanı Adı
            </span>
            <div className="text-sm font-bold text-foreground mt-1">
              {currentTenant?.name || 'Acme SaaS'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/60">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase">
              Alt Alan Adı (Subdomain)
            </span>
            <div className="text-sm font-bold text-indigo-500 mt-1 font-mono">
              {currentTenant?.slug || 'acme'}.feedbackpulse.com
            </div>
          </div>

          <div className="p-4 rounded-xl bg-secondary/50 border border-border/60">
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

      {/* Team Members Section */}
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
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
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Üye Davet Et
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border/60 mt-4">
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
      <div className="p-6 rounded-2xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-500" /> Sitenize Gömebileceğiniz Feedback Widget'ı
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Bu kodu web sitenizin &lt;body&gt; kapanış etiketinin hemen öncesine ekleyin.
            </p>
          </div>

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

        <div className="relative rounded-xl bg-background border border-border p-4 font-mono text-xs text-indigo-400 overflow-x-auto leading-relaxed">
          <pre>{widgetSnippet}</pre>
        </div>
      </div>

      {/* INVITE MEMBER MODAL */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl relative">
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
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
                >
                  Davet Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
