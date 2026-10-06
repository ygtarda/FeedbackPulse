import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg">
                Feedback<span className="text-indigo-500">Pulse</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Müşterilerinizin sesini dinleyin, en çok talep edilen özellikleri hayata geçirin ve şeffaf yol haritanızla güven inşa edin.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Ürün</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Geri Bildirim Panoları</Link></li>
              <li><Link href="/#features" className="hover:text-foreground transition-colors">Yol Haritası (Roadmap)</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Fiyatlandırma</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">Gömülü Web Widget</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Şirket</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">Hakkımızda</Link></li>
              <li><Link href="/#testimonials" className="hover:text-foreground transition-colors">Müşteri Yorumları</Link></li>
              <li><a href="https://github.com/ygtarda/FeedbackPulse" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub Repository</a></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">İletişim & Destek</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-foreground">Yasal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><span className="cursor-pointer hover:text-foreground transition-colors">Kullanım Koşulları</span></li>
              <li><span className="cursor-pointer hover:text-foreground transition-colors">Gizlilik Politikası</span></li>
              <li><span className="cursor-pointer hover:text-foreground transition-colors">KVKK & Çerezler</span></li>
              <li><span className="cursor-pointer hover:text-foreground transition-colors">Güvenlik Politikası</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} FeedbackPulse SaaS. Tüm hakları saklıdır.</p>
          <p className="flex items-center gap-1">
            Modern SaaS standartlarıyla özenle geliştirildi <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
