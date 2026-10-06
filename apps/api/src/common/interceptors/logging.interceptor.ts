import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ExtendedRequest } from '../rls/tenant.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<ExtendedRequest>();
    const { method, url, tenantId, user } = req;
    const now = Date.now();
    const requestId = (req.headers['x-request-id'] as string) || `req_${Math.random().toString(36).substring(2, 9)}`;

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;
        const logPayload = {
          requestId,
          tenantId: tenantId || null,
          userId: user?.id || null,
          method,
          url,
          statusCode: response.statusCode,
          durationMs: duration,
        };
        this.logger.log(JSON.stringify(logPayload));
      }),
    );
  }
}
