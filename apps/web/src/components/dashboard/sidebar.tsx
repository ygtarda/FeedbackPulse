'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '../../stores/auth-store';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Kanban,
  Settings,
  LogOut,
  Building,
} from 'lucide-react';

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, currentTenant, logout } = useAuthStore();

  const navItems = [
    { label: 'Genel Bakış', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Panolar & Geri Bildirim', href: '/boards', icon: MessageSquare },
    { label: 'Yol Haritası (Roadmap)', href: '/roadmap', icon: Kanban },
    { label: 'Ayarlar & Takım', href: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <aside className="w-64 border-r border-border/80 bg-card/60 backdrop-blur-xl flex flex-col justify-between h-screen sticky top-0 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-border/60">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-foreground block leading-tight">
                Feedback<span className="text-indigo-500">Pulse</span>
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 font-medium">
                <Building className="w-3 h-3 text-indigo-400" />
                {currentTenant?.name || 'Acme SaaS'}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="p-4 border-t border-border/60 space-y-3">
        <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-500 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-foreground truncate">
                {user?.name || 'Kullanıcı'}
              </div>
              <div className="text-[11px] text-muted-foreground truncate">
                {user?.email || 'admin@sirket.com'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Çıkış Yap"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
