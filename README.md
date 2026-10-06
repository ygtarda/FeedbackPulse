# FeedbackPulse 🚀

> **Multi-Tenant B2B SaaS Müşteri Geri Bildirim ve Yol Haritası Yönetim Platformu**

FeedbackPulse, şirketlerin kendi müşterilerinden ve kullanıcılarından geri bildirim ve özellik talebi toplayabildiği, bunları oylatabildiği, bir ürün yol haritasına (Kanban Roadmap) dönüştürüp yayınlayabildiği ve gömülü widget ile web sitelerine entegre edebildiği multi-tenant bir SaaS platformudur.

---

## 🛠️ Teknoloji Mimarisi

FeedbackPulse, **Turborepo** ve **pnpm workspaces** ile yönetilen modern bir monorepo yapısına sahiptir:

- **Monorepo:** Turborepo + pnpm workspaces (`apps/web`, `apps/api`, `packages/types`, `packages/config`)
- **Backend (`apps/api`):** NestJS (TypeScript), Clean Architecture / Hexagonal mimari, SOLID prensipleri
- **Veritabanı & ORM:** PostgreSQL 16 + Prisma ORM (Row Level Security - RLS ile tenant izolasyonu)
- **Önbellek & Asenkron İşler:** Redis 7 + BullMQ
- **Kimlik Doğrulama:** Passport.js + JWT (Access Token 15dk + Refresh Token 7 gün), RBAC (`SUPER_ADMIN`, `OWNER`, `ADMIN`, `MEMBER`, `END_CUSTOMER`)
- **API Dokümantasyonu:** Swagger / OpenAPI (`/api/docs`)
- **Frontend (`apps/web`):** Next.js 15 (App Router) + TypeScript
- **Stil & Tasarım Sistemi:** TailwindCSS + shadcn/ui prensipleri, Açık & Koyu (Dark) tema, Glassmorphism, Responsive tasarım
- **State Yönetimi:** TanStack Query (Server state) + Zustand (Client state)
- **Form & Validasyon:** React Hook Form + Zod (Paylaşılan DTO ve şemalar)
- **Altyapı & Konteyner:** Docker Compose (PostgreSQL & Redis)
- **Test:** Jest (Unit ve entegrasyon testleri)

---

## 📂 Dizin Yapısı

```text
FeedbackPulse/
├── apps/
│   ├── api/                              # NestJS Backend (Clean Architecture)
│   │   ├── prisma/
│   │   │   ├── schema.prisma             # Multi-tenant PostgreSQL şeması (RLS uyumlu)
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── common/                   # RLS Middleware, AsyncLocalStorage, Guards, Interceptors
│   │   │   ├── modules/
│   │   │   │   ├── iam/                  # Auth, Tenant, User, Membership (Domain, App, Infra, Pres)
│   │   │   │   ├── feedback/             # Board, Feedback, Vote, Comment modülleri
│   │   │   │   └── roadmap/              # Kanban Yol Haritası modülü
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   └── test/
│   └── web/                              # Next.js 15 Frontend
│       ├── src/
│       │   ├── app/
│       │   │   ├── (marketing)/          # Landing Page & /pricing
│       │   │   ├── (auth)/               # /login & /register
│       │   │   ├── (dashboard)/          # /dashboard, /boards, /roadmap, /settings
│       │   │   ├── globals.css
│       │   │   └── providers.tsx
│       │   ├── components/               # Navbar, Footer, Sidebar, Header, Modals
│       │   ├── lib/                      # api-client, utils
│       │   └── stores/                   # auth-store (Zustand)
│       └── tailwind.config.ts
├── packages/
│   ├── config/                           # Paylaşılan tsconfig ve eslint yapılandırması
│   └── types/                            # Paylaşılan Zod şemaları, DTO'lar, Role ve Status tipleri
├── docker-compose.yml                    # PostgreSQL 16 & Redis 7
├── turbo.json                            # Turborepo build pipeline
└── pnpm-workspace.yaml                   # Çalışma alanı tanımı
```

---

## 🚀 Hızlı Başlangıç

### 1. Gereksinimler
- Node.js >= 20.x
- pnpm >= 9.x veya 12.x
- Docker & Docker Compose (Opsiyonel veritabanı servisleri için)

### 2. Bağımlılıkları Yükleyin
```bash
pnpm install
```

### 3. Ortam Değişkenlerini Hazırlayın
`apps/api/.env.example` dosyasını kopyalayın:
```bash
cp apps/api/.env.example apps/api/.env
```

### 4. Veritabanını Başlatın (Docker Compose)
```bash
docker compose up -d
```
Prisma istemcisini üretin ve şemayı güncelleyin:
```bash
pnpm --filter @feedbackpulse/api prisma:generate
pnpm --filter @feedbackpulse/api prisma:migrate
```

### 5. Geliştirme Sunucularını Başlatın
Tüm monorepo'yu tek komutla ayağa kaldırın:
```bash
pnpm dev
```
Uygulamalara erişim adresleri:
- **Web Uygulaması:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **Swagger Dokümantasyonu:** [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🧪 Testleri Çalıştırma

Tüm monorepo paketlerinde birim ve entegrasyon testlerini çalıştırmak için:
```bash
pnpm test
```
Sadece API testlerini çalıştırmak için:
```bash
pnpm --filter @feedbackpulse/api test
```

---

## 🔒 Multi-Tenancy & Row-Level Security (RLS)

- **İstek Çözümleme:** `TenantMiddleware`, gelen isteklerdeki `x-tenant-id` başlığını veya subdomain'i (`acme.feedbackpulse.com`) çözümler.
- **AsyncLocalStorage:** İstek bağlamında aktif `tenantId`, Node.js `AsyncLocalStorage` üzerinde taşınır.
- **PostgreSQL RLS:** Her sorguda `SET LOCAL app.current_tenant = '<tenant_id>'` oturum anahtarı üzerinden RLS politikaları tetiklenir ve tenant verileri kesin olarak birbirinden izole edilir.

---

## 📱 Sayfalar ve Ekranlar

1. **Tanıtım Sayfası (`/`):** Hero, Canlı interaktif mockup, Sosyal kanıt, Özellikler, Nasıl Çalışır, Fiyatlandırma, SSS, Footer.
2. **Fiyatlandırma (`/pricing`):** Free, Pro ve Business planlarının özellik karşılaştırma tablosu.
3. **Kayıt Ol (`/register`):** Şirket adı, alt alan adı (subdomain) ve kullanıcı hesabı oluşturma.
4. **Giriş Yap (`/login`):** Kullanıcı oturum açma ve çalışma alanına bağlanma.
5. **Dashboard (`/dashboard`):** Toplam feedback, oy sayıları, aktif panolar ve son aktiviteler.
6. **Panolar & Geri Bildirim (`/boards`):** Çoklu pano yönetimi, oy verme, filtreleme, detay drawer ve yorumlar.
7. **Yol Haritası (`/roadmap`):** Kanban panosu (Planlandı, Geliştiriliyor, Tamamlandı sütunları).
8. **Ayarlar & Takım (`/settings`):** Çalışma alanı bilgileri, takım davetleri ve web widget entegrasyon kodu.
