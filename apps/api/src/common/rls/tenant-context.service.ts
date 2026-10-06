import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';

export interface TenantContext {
  tenantId?: string;
  userId?: string;
  role?: string;
  isSuperAdmin?: boolean;
}

@Injectable()
export class TenantContextService {
  private static readonly storage = new AsyncLocalStorage<TenantContext>();

  static run<T>(context: TenantContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  static get(): TenantContext | undefined {
    return this.storage.getStore();
  }

  static getTenantId(): string | undefined {
    return this.storage.getStore()?.tenantId;
  }

  static getUserId(): string | undefined {
    return this.storage.getStore()?.userId;
  }

  static getRole(): string | undefined {
    return this.storage.getStore()?.role;
  }

  getTenantId(): string | undefined {
    return TenantContextService.getTenantId();
  }

  getUserId(): string | undefined {
    return TenantContextService.getUserId();
  }

  getContext(): TenantContext | undefined {
    return TenantContextService.get();
  }
}
