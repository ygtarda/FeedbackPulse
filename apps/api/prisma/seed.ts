import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Veritabanı tohum verileri (Seed) yükleniyor...');

  // 1. Planlar
  const freePlan = await prisma.plan.upsert({
    where: { name: 'FREE' },
    update: {},
    create: {
      name: 'FREE',
      priceMonth: 0,
      maxBoards: 1,
      maxTeamMembers: 1,
      maxCustomers: 100,
    },
  });

  const proPlan = await prisma.plan.upsert({
    where: { name: 'PRO' },
    update: {},
    create: {
      name: 'PRO',
      priceMonth: 499,
      maxBoards: 10,
      maxTeamMembers: 5,
      maxCustomers: 1000,
    },
  });

  console.log('✅ Planlar oluşturuldu:', freePlan.name, proPlan.name);

  // 2. Demo Kullanıcı
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@acmesaas.com' },
    update: {},
    create: {
      email: 'demo@acmesaas.com',
      name: 'Ahmet Yılmaz',
      passwordHash,
    },
  });
  console.log('✅ Demo kullanıcı oluşturuldu:', demoUser.email);

  // 3. Demo Tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      name: 'Acme SaaS',
      slug: 'acme',
      planId: proPlan.id,
      status: 'ACTIVE',
    },
  });
  console.log('✅ Demo çalışma alanı (Tenant) oluşturuldu:', demoTenant.name, `(${demoTenant.slug})`);

  // 4. Tenant Üyeliği (OWNER)
  await prisma.tenantMembership.upsert({
    where: {
      userId_tenantId: {
        userId: demoUser.id,
        tenantId: demoTenant.id,
      },
    },
    update: {},
    create: {
      userId: demoUser.id,
      tenantId: demoTenant.id,
      role: 'OWNER',
    },
  });
  console.log('✅ Tenant üyeliği (OWNER) oluşturuldu');

  // 5. Demo Panolar
  const defaultBoard = await prisma.board.upsert({
    where: {
      tenantId_slug: {
        tenantId: demoTenant.id,
        slug: 'ana-urun',
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      name: 'Ana Ürün Geri Bildirimleri',
      slug: 'ana-urun',
      description: 'Web uygulaması ve platform özellikleri için genel kullanıcı panosu',
      isPrivate: false,
    },
  });
  console.log('✅ Pano oluşturuldu:', defaultBoard.name);

  // 6. Örnek Geri Bildirimler
  const existingFb = await prisma.feedback.findFirst({
    where: { tenantId: demoTenant.id, boardId: defaultBoard.id },
  });

  if (!existingFb) {
    const fb1 = await prisma.feedback.create({
      data: {
        tenantId: demoTenant.id,
        boardId: defaultBoard.id,
        title: 'Koyu Tema (Dark Mode) Desteği',
        description: 'Gece çalışan ürün yöneticileri için gözü yormayan koyu renk paleti entegre edilsin.',
        status: 'IN_PROGRESS',
        voteCount: 38,
        authorId: demoUser.id,
        authorName: 'Emre Çelik',
      },
    });

    const fb2 = await prisma.feedback.create({
      data: {
        tenantId: demoTenant.id,
        boardId: defaultBoard.id,
        title: 'Slack ve Discord Bildirim Webhook Entegrasyonu',
        description: 'Yeni bir özellik talebi veya kritik feedback geldiğinde takım kanalına anlık mesaj düşsün.',
        status: 'PLANNED',
        voteCount: 29,
        authorId: demoUser.id,
        authorName: 'Selin Demir',
      },
    });

    const fb3 = await prisma.feedback.create({
      data: {
        tenantId: demoTenant.id,
        boardId: defaultBoard.id,
        title: 'Gömülü Web Widget için Özelleştirilebilir Renk Teması',
        description: 'Tenant sitelerine gömülen iframe widget rengi ana marka kimliğiyle eşleşebilmeli.',
        status: 'OPEN',
        voteCount: 15,
        authorId: demoUser.id,
        authorName: 'Kaan Acar',
      },
    });

    const fb4 = await prisma.feedback.create({
      data: {
        tenantId: demoTenant.id,
        boardId: defaultBoard.id,
        title: 'Tek Tıkla Google & GitHub ile Giriş (OAuth)',
        description: 'Kullanıcıların parola girmeden hızlıca hesap oluşturup oturum açabilmesi sağlansın.',
        status: 'COMPLETED',
        voteCount: 42,
        authorId: demoUser.id,
        authorName: 'Burak Tan',
      },
    });

    // Roadmap kartları
    await prisma.roadmapItem.create({
      data: {
        tenantId: demoTenant.id,
        feedbackId: fb2.id,
        title: 'Slack & Discord Webhook Entegrasyonu',
        description: 'Ekip içi anlık bildirim kanalları',
        status: 'PLANNED',
        position: 0,
      },
    });

    await prisma.roadmapItem.create({
      data: {
        tenantId: demoTenant.id,
        feedbackId: fb1.id,
        title: 'Koyu Tema (Dark Mode)',
        description: 'Tüm dashboard ve public panolarda koyu tema desteği',
        status: 'IN_PROGRESS',
        position: 0,
      },
    });

    await prisma.roadmapItem.create({
      data: {
        tenantId: demoTenant.id,
        feedbackId: fb4.id,
        title: 'Google & GitHub SSO',
        description: 'Hızlı sosyal kimlik doğrulama akışı',
        status: 'DONE',
        position: 0,
      },
    });

    // Yorumlar
    await prisma.comment.create({
      data: {
        tenantId: demoTenant.id,
        feedbackId: fb1.id,
        authorId: demoUser.id,
        authorName: 'Ahmet Yılmaz',
        body: 'Bu özellik üzerinde çalışmaya başladık, v1.1 sürümünde yayınlamayı hedefliyoruz.',
      },
    });

    console.log('✅ Örnek geri bildirimler, yol haritası kartları ve yorumlar eklendi');
  }

  console.log('🎉 Veritabanı tohumlama tamamlandı!');
}

main()
  .catch((e) => {
    console.error('Tohumlama hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
