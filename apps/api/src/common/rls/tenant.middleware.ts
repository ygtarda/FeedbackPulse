import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantContextService } from './tenant-context.service';

export interface ExtendedRequest extends Request {
  tenantId?: string;
  user?: any;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: ExtendedRequest, res: Response, next: NextFunction) {
    let tenantId = req.header('x-tenant-id') as string | undefined;

    // Subdomain çözümleme: örn. acme.feedbackpulse.com veya acme.localhost:3000
    if (!tenantId) {
      const host = req.get('host') || '';
      const parts = host.split('.');
      if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'api') {
        tenantId = parts[0];
      }
    }

    req.tenantId = tenantId;

    TenantContextService.run(
      {
        tenantId,
        userId: req.user?.id,
        role: req.user?.role,
      },
      () => next(),
    );
  }
}
