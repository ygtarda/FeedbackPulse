import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { TenantContextService } from '../rls/tenant-context.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Prisma veritabanı bağlantısı başarıyla kuruldu.');
    } catch (error) {
      this.logger.warn(`Veritabanına bağlanılamadı (Lokal/Mock modda devam ediliyor): ${(error as any)?.message}`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * PostgreSQL RLS aktifken sorguları tenant context'i ile izole çalıştırır.
   */
  async withTenantContext<T>(
    tenantId: string,
    operation: (prisma: PrismaClient) => Promise<T>,
  ): Promise<T> {
    return this.$transaction(async (tx) => {
      // PostgreSQL Row Level Security için oturum değişkenini ayarla (Postgres ortamında)
      if (tenantId && (process.env.DATABASE_URL?.includes('postgres') || process.env.DATABASE_URL?.includes('postgresql'))) {
        try {
          await tx.$executeRawUnsafe(`SET LOCAL app.current_tenant = '${tenantId}';`);
        } catch {
          // SQLite veya RLS desteklemeyen ortamlarda sessizce geç
        }
      }
      return operation(tx as unknown as PrismaClient);
    });
  }

  /**
   * Geçerli AsyncLocalStorage tenantId'sini döndürür
   */
  getCurrentTenantId(): string | undefined {
    return TenantContextService.getTenantId();
  }
}
