# FeedbackPulse — Multi-Tenant SaaS Geliştirme Promptu

> Bu doküman, bir yazılım geliştirme agent'ına (Claude Code, Cursor vb.) doğrudan verilebilecek, uçtan uca kapsamlı bir geliştirme talimatıdır. Agent bu dosyayı okuyup projeyi sıfırdan kurmalı, aşağıdaki mimariye, modül yapısına ve kısıtlara birebir uymalıdır.

---

## 1. Proje Özeti

**Ürün adı:** FeedbackPulse
**Tanım:** B2B SaaS — şirketlerin kendi müşterilerinden/kullanıcılarından geri bildirim ve özellik talebi toplayabildiği, bunları oylatabildiği, bir ürün yol haritasına (roadmap) dönüştürüp yayınlayabildiği ve yapılan değişiklikleri bir changelog ile duyurabildiği multi-tenant bir platform.

**Hedef kitle:** Ürün yöneticileri, startup'lar, SaaS şirketleri (B2B2C modeli — her tenant kendi müşterilerine hizmet veriyor).

**Neden bu fikir uygun:** Kapsamı net sınırlarla tanımlanabiliyor (aşırı büyümeye kapalı), doğal olarak modüllere ayrılıyor (auth, feedback, roadmap, changelog, billing, bildirim, public widget), multi-tenancy gerçek bir iş problemi olarak ortaya çıkıyor, ve klasik "landing page + header'da giriş/kayıt + dashboard" yapısına tam oturuyor.

---

## 2. Teknoloji Yığını (Kesin Kararlar — Değiştirme)

### Monorepo
- **Turborepo** + **pnpm workspaces**
- Yapı: `apps/web` (Next.js), `apps/api` (NestJS), `packages/ui`, `packages/types` (paylaşılan DTO/tip tanımları), `packages/config` (eslint/tsconfig paylaşımı)

### Backend
- **NestJS (TypeScript)** — modüler, Dependency Injection tabanlı, SOLID prensiplerini doğal olarak destekliyor
- **PostgreSQL** + **Prisma ORM**
- **Redis** — cache + session + rate limiting
- **BullMQ** — asenkron işler (e-posta, bildirim, webhook gönderimi)
- **Passport.js + JWT** (access + refresh token) — kimlik doğrulama
- **Swagger/OpenAPI** — otomatik API dokümantasyonu
- **class-validator / class-transformer** — DTO validasyonu

### Frontend
- **Next.js 15 (App Router) + TypeScript**
- **TailwindCSS + shadcn/ui** — tutarlı tasarım sistemi
- **TanStack Query** — server state yönetimi
- **Zustand** — client state (UI state, tema vb.)
- **React Hook Form + Zod** — form validasyonu (frontend ve backend'de aynı Zod şemaları paylaşılabilir)

### Altyapı / DevOps
- **Docker + Docker Compose** (lokal geliştirme: postgres, redis, api, web)
- **GitHub Actions** — CI/CD (lint, test, build, deploy)
- **Vercel** (frontend) + **Railway veya Fly.io** (backend + DB) — MVP için; ileride AWS ECS'e taşınabilir
- **Sentry** — hata izleme
- **OpenTelemetry + Grafana/Loki (opsiyonel faz 2)** — loglama/izleme
- **Stripe** — abonelik/faturalandırma
- **Resend** — transactional e-posta
- **Cloudflare R2 (S3 uyumlu)** — dosya/görsel depolama

### Test
- **Jest** — unit/integration test (backend)
- **Playwright** — e2e test (kritik akışlar: kayıt, giriş, feedback oluşturma, oy verme, ödeme)

---

## 3. Mimari Prensipler

### 3.1 Genel Mimari
- **Modüler monolit** (mikroservis DEĞİL — aşırı kapsamlı olmaması için bilinçli tercih). Her iş alanı NestJS modülü olarak izole edilir, ama tek bir deploy edilebilir API uygulaması olarak kalır. İleride mikroservise bölünebilecek şekilde modüller arası iletişim **sadece** tanımlı servis arayüzleri üzerinden yapılır, doğrudan başka modülün repository'sine erişilmez.
- Her modül içinde **Clean Architecture / Hexagonal** katmanları:
  - `domain/` — entity'ler, iş kuralları, value object'ler (framework'ten bağımsız, saf TypeScript)
  - `application/` — use-case'ler (servisler), DTO'lar, port (interface) tanımları
  - `infrastructure/` — Prisma repository implementasyonları, dış servis adaptörleri (Stripe, Resend vb.)
  - `presentation/` — NestJS controller'ları, guard'lar, pipe'lar

### 3.2 SOLID Uygulaması (Her Modülde Zorunlu)
- **S (Single Responsibility):** Her servis sınıfı tek bir iş kuralından sorumlu olmalı (örn. `CreateFeedbackUseCase`, `VoteFeedbackUseCase` ayrı sınıflar — tek bir "god service" yasak).
- **O (Open/Closed):** Bildirim kanalları (e-posta, webhook, in-app) `NotificationChannel` interface'i üzerinden eklenebilir olmalı; yeni kanal eklerken mevcut kod değişmemeli.
- **L (Liskov Substitution):** Repository interface'leri (`IFeedbackRepository`) Prisma dışında bir implementasyonla (örn. test için in-memory) değiştirilebilir olmalı.
- **I (Interface Segregation):** Büyük, her şeyi yapan interface'ler yerine küçük, amaca özel interface'ler (`IReadFeedbackPort`, `IWriteFeedbackPort`).
- **D (Dependency Inversion):** Use-case'ler somut Prisma sınıflarına değil, `application/ports` altında tanımlı interface'lere bağımlı olmalı; NestJS DI container'ı bu bağımlılıkları inject etmeli.

### 3.3 Modül Listesi (Backend)
1. `iam` — kullanıcı, tenant, rol/izin yönetimi, auth
2. `billing` — Stripe abonelik, plan, kullanım limitleri
3. `feedback` — geri bildirim/özellik talebi, oylama, yorum
4. `roadmap` — roadmap kartları, durum (planned/in-progress/done)
5. `changelog` — duyuru/yayın notları
6. `notification` — e-posta/in-app bildirim orkestrasyonu
7. `public-widget` — tenant'ların kendi sitelerine gömebileceği embed widget API'si
8. `analytics` — tenant bazlı temel kullanım metrikleri
9. `admin` — platform süper-admin paneli (tenant yönetimi, destek)

---

## 4. Multi-Tenancy Stratejisi

**Seçilen yöntem: Paylaşımlı veritabanı, paylaşımlı şema + `tenant_id` kolonu + PostgreSQL Row Level Security (RLS)**

**Gerekçe:** Schema-per-tenant veya database-per-tenant, tenant sayısı arttıkça operasyonel karmaşıklığı katlanarak artırır (migration'ları her şemaya ayrı ayrı uygulama, connection pool şişmesi). Paylaşımlı şema + RLS, hem maliyet hem yönetilebilirlik açısından MVP ve orta ölçek için en sağlam seçenektir; ileride büyük/kurumsal müşteriler için izole DB opsiyonu (hybrid) sonradan eklenebilir.

**Uygulama detayları:**
- Tenant'a ait her tabloda `tenant_id UUID NOT NULL` kolonu bulunur.
- Postgres'te her tenant'lı tablo için RLS policy'si tanımlanır: `USING (tenant_id = current_setting('app.current_tenant')::uuid)`.
- İstek bazında tenant context'i, bir NestJS **middleware**'i tarafından çözülür:
  - Subdomain bazlı: `acme.feedbackpulse.com` → tenant = `acme`
  - Veya custom domain mapping tablosu üzerinden.
- Tenant ID, `AsyncLocalStorage` (request-scoped context) içine yazılır ve her Prisma sorgusundan önce `SET LOCAL app.current_tenant = '<tenant_id>'` çalıştırılır (bir Prisma middleware/extension ile otomatikleştirilir — her repository'de manuel tekrar yazılmaz).
- Süper-admin (platform sahibi) rolü RLS'i bypass edebilen ayrı bir DB rolü/bağlantısı kullanır.

---

## 5. Veri Modeli (Taslak — Prisma ile Genişletilecek)

Ana tablolar (hepsinde `tenant_id`, `created_at`, `updated_at`, `deleted_at` — soft delete):

- `Tenant` (id, name, slug/subdomain, custom_domain, plan_id, status)
- `User` (id, email, password_hash, name, avatar_url) — bir kullanıcı birden fazla tenant'a üye olabilir
- `TenantMembership` (user_id, tenant_id, role: OWNER/ADMIN/MEMBER)
- `EndCustomer` — tenant'ın kendi müşterisi (feedback veren public kullanıcı), tenant_id ile izole
- `Board` — feedback panosu (tenant başına birden fazla olabilir, örn. "Mobil App", "Web")
- `Feedback` (id, board_id, title, description, status, author_id, vote_count)
- `Vote` (feedback_id, end_customer_id) — unique constraint
- `Comment` (feedback_id, author_id, body)
- `RoadmapItem` (feedback_id nullable, title, status: PLANNED/IN_PROGRESS/DONE, position)
- `ChangelogEntry` (title, body, published_at)
- `Plan` (name, price, limits: boards, team_members, end_customers)
- `Subscription` (tenant_id, stripe_subscription_id, status, current_period_end)
- `NotificationLog`, `WebhookEndpoint`

---

## 6. Kimlik Doğrulama & Yetkilendirme

- **İki ayrı kullanıcı evreni:** (1) Tenant tarafı kullanıcıları (`User` — ürünü yöneten ekip), (2) Tenant'ın müşterileri (`EndCustomer` — feedback veren public kullanıcılar, magic-link veya basit e-posta/OTP ile giriş yapar).
- JWT access token (kısa ömürlü, 15dk) + refresh token (httpOnly cookie, 7 gün).
- RBAC rolleri: `SUPER_ADMIN` (platform), `OWNER`, `ADMIN`, `MEMBER` (tenant içi), `END_CUSTOMER` (public).
- Her endpoint NestJS `@Roles()` decorator + `RolesGuard` ile korunur.
- Şifre sıfırlama, e-posta doğrulama, (faz 2'de) SSO/Google OAuth.

---

## 7. API Tasarımı

- REST, versiyonlu: `/api/v1/...`
- Standart hata formatı: `{ statusCode, message, errorCode, timestamp, path }`
- Pagination: cursor-based (`?cursor=...&limit=20`)
- Rate limiting: Redis tabanlı, plan bazlı farklı limitler
- Tüm endpoint'ler Swagger'da dokümante edilir (`/api/docs`)
- Public widget için ayrı, API-key tabanlı, CORS'a açık bir endpoint seti (`/api/v1/public/...`)

---

## 8. Billing / Abonelik

- Stripe Checkout + Customer Portal entegrasyonu
- Planlar: **Free** (1 board, 100 end-customer, watermark'lı widget), **Pro** (sınırsız board, 3 takım üyesi), **Business** (sınırsız her şey, custom domain, SSO)
- Kullanım limitleri her kritik işlemde (board oluşturma, üye davet etme) `UsageGuard` ile kontrol edilir.
- Stripe webhook'ları (`invoice.paid`, `customer.subscription.deleted` vb.) `billing` modülünde işlenir, tenant durumu senkron tutulur.

---

## 9. UI/UX Gereksinimleri

### 9.1 Genel Tasarım Sistemi
- shadcn/ui bileşenleri + Tailwind design token'ları (renk, spacing, tipografi tek bir `tailwind.config` üzerinden yönetilir)
- Açık/koyu tema desteği (sistem tercihine duyarlı + manuel switch)
- Tüm sayfalarda responsive tasarım (mobile-first), WCAG AA erişilebilirlik standardı
- Her veri listesi için: loading skeleton, boş durum (empty state) illüstrasyonu + CTA, hata durumu (retry butonlu)
- Form validasyon hataları alan bazında, anlık (Zod + react-hook-form)
- Toast bildirimleri (başarı/hata) tutarlı bir bileşenle

### 9.2 Public (Tanıtım) Sitesi — Giriş Yapmamış Kullanıcı
- **Header:** sol üstte logo, orta kısımda nav (Özellikler, Fiyatlandırma, SSS), **sağ üstte "Giriş Yap" (outline button) ve "Ücretsiz Başla" (dolu/primary button)**
- **Landing page bölümleri:** Hero (başlık + alt başlık + CTA + ürün görseli/mockup), Sosyal kanıt (logo şeridi), Özellikler (3-4 kart, ikon + başlık + açıklama), Nasıl Çalışır (3 adım), Fiyatlandırma (3 plan kartı, aylık/yıllık toggle), Müşteri yorumları, SSS (accordion), Alt CTA, Footer (linkler, sosyal medya, legal sayfalar)
- Ayrıca: `/pricing`, `/changelog` (public, tenant'ların kendi changelog'larını keşfedebileceği), `/login`, `/register`, `/forgot-password` sayfaları

### 9.3 Uygulama (Dashboard) — Giriş Yapmış Kullanıcı
- Sol sabit sidebar navigasyon (Boards, Roadmap, Changelog, Members, Settings, Billing)
- Üstte tenant/workspace switcher (kullanıcı birden fazla tenant'a üyeyse)
- Her board içinde: feedback listesi (filtre: status, sıralama: en çok oy/en yeni), feedback detay sayfası (yorumlar, durum değiştirme — sadece ADMIN/OWNER)
- Roadmap: kanban görünümü (Planned / In Progress / Done sütunları, sürükle-bırak)
- Settings: profil, takım üyeleri davet etme, API key, custom domain, widget gömme kodu, billing

### 9.4 Public Widget
- Tenant'ın kendi sitesine `<script>` ile gömülebilen, iframe tabanlı hafif bir feedback formu + oylama widget'ı

---

## 10. Non-Functional Gereksinimler

- **Güvenlik:** OWASP Top 10 kontrolleri, input sanitization, CSRF koruması, rate limiting, şifreler bcrypt/argon2 ile hashlenir, tüm trafik HTTPS.
- **Performans:** API p95 yanıt süresi < 300ms (basit sorgular), frontend Lighthouse skoru > 90.
- **Test kapsamı:** Backend use-case'lerinde minimum %70 unit test coverage; kritik akışlarda (auth, feedback oluşturma, ödeme) e2e test zorunlu.
- **CI/CD:** Her PR'da lint + test + type-check otomatik çalışır; `main` branch'e merge otomatik deploy tetikler.
- **Loglama:** Yapılandırılmış (JSON) loglar, tenant_id ve request_id her log satırında bulunur.
- **i18n:** MVP'de sadece Türkçe + İngilizce (en azından altyapı `next-intl` ile hazır olmalı, içerik önce TR).

---

## 11. Geliştirme Fazları

**Faz 1 — MVP (öncelik bu):**
Auth + tenant oluşturma, tek board, feedback oluşturma/oylama/yorum, basit roadmap (durum güncelleme), landing page, Free plan, temel dashboard.

**Faz 2:**
Çoklu board, changelog, Stripe billing (Pro/Business), takım üyesi davet/rol yönetimi, public widget, temel analytics.

**Faz 3:**
Custom domain, SSO, webhook entegrasyonları, gelişmiş analytics, AI destekli feedback özetleme/duplicate tespiti (opsiyonel, kapsamı şişirmemek için en sona bırakılır).

---

## 12. Kapsam Sınırları (BUNLARI YAPMA)

- Mikroservis mimarisine geçme — modüler monolit yeterli.
- Çok dilli (i18n) içerik üretimine MVP'de zaman harcama — sadece altyapıyı hazırla.
- Faz 1'de AI özelliklerine girme.
- Özel bir state machine kütüphanesi kurma — roadmap durumları basit enum + guard mantığıyla yönetilsin.
- Gereksiz üçüncü parti servis entegrasyonu ekleme (yukarıda listelenmeyen hiçbir servisi onay almadan ekleme).

---

## 13. Agent İçin Çalışma Talimatı

1. Önce monorepo iskeletini (Turborepo + pnpm) kur, boş `apps/web` ve `apps/api` projelerini oluştur.
2. `packages/types` içinde paylaşılan DTO/Zod şemalarını tanımla.
3. Backend'de önce `iam` modülünü (tenant + user + auth + RLS altyapısı) eksiksiz bitir, test yaz.
4. Ardından `feedback` ve `roadmap` modüllerini Clean Architecture katmanlarıyla kur.
5. Frontend'de önce landing page + auth sayfalarını, sonra dashboard layout'unu, sonra board/feedback ekranlarını yap.
6. Her modül bittiğinde: unit test + Swagger dokümantasyonu + README güncellemesi zorunlu adımdır, atlama.
7. Faz 1 tamamlanmadan Faz 2/3 kapsamına geçme.
8. Belirsiz bir karar noktasında (örn. ek bir kütüphane gerekiyorsa) varsayım yapmadan önce bu dokümandaki prensiplerle (SOLID, modülerlik, kapsam sınırları) çelişip çelişmediğini kontrol et.

---

**Bu prompt'u olduğu gibi agent'a verebilirsin. Agent'tan önce Faz 1 kapsamında bir klasör yapısı + ilk modül planı çıkarmasını isteyerek başlamanı öneririm.**
