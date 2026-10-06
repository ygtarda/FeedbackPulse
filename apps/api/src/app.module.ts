import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import { IamModule } from './modules/iam/iam.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { RoadmapModule } from './modules/roadmap/roadmap.module';

import { TenantMiddleware } from './common/rls/tenant.middleware';
import { TenantContextService } from './common/rls/tenant-context.service';
import { GlobalHttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { PrismaService } from './common/prisma/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    IamModule,
    FeedbackModule,
    RoadmapModule,
  ],
  providers: [
    PrismaService,
    TenantContextService,
    {
      provide: APP_FILTER,
      useClass: GlobalHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
