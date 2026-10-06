import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TenantContextService } from '../rls/tenant-context.service';

export const CurrentTenant = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.tenantId || TenantContextService.getTenantId() || request.user?.tenantId;
  },
);
