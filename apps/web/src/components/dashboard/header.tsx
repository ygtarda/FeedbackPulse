'use client';

import React, { useState } from 'react';
import { useAuthStore } from '../../stores/auth-store';
import { Sun, Moon, ChevronDown, Check, ExternalLink, Shield } from 'lucide-react';

export function DashboardHeader() {
  const { currentTenant, tenants, setCurrentTenant, theme, toggleTheme } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 border-b border-border/80 bg-card/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Workspace Switcher */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-secondary/60 text-sm font-semibold text-foreground transition-all shadow-sm"
        >
          <div className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-500 text-xs flex items-center justify-center font-bold">
            {currentTenant?.name ? currentTenant.name[0] : 'A'}
          </div>
          <span>{currentTenant?.name || 'Acme SaaS'}</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground ml-1" />
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
            <div className="px-3 py-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Çalışma Alanları (Tenants)
            </div>
            {tenants.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setCurrentTenant(t);
                  setDropdownOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm flex items-center justify-between hover:bg-secondary/80 text-foreground transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium">{t.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">({t.slug})</span>
                </div>
                {currentTenant?.id === t.id && <Check className="w-4 h-4 text-indigo-500" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Plan badge */}
        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
          <Shield className="w-3.5 h-3.5" />
          {currentTenant?.planId || 'PRO'} Plan
        </span>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          aria-label="Tema Değiştir"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>
      </div>
    </header>
  );
}
