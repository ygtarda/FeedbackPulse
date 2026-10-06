import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'FeedbackPulse — B2B SaaS Müşteri Geri Bildirim ve Yol Haritası Platformu',
  description:
    'Müşterilerinizden geri bildirim ve özellik talepleri toplayın, oylatın, şeffaf bir ürün yol haritası (roadmap) ile paylaşın.',
  keywords: ['feedback', 'roadmap', 'saas', 'ürün yönetimi', 'özellik talepleri', 'b2b'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-indigo-500 selection:text-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
