import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { TENANT_REPOSITORY } from '../tokens';
import { ITenantRepository, TenantMemberInfo } from '../ports/tenant.repository.interface';

@Injectable()
export class ListMembersUseCase {
  constructor(
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
  ) {}

  async execute(tenantId: string): Promise<TenantMemberInfo[]> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği gereklidir');
    }
    return await this.tenantRepo.getTenantMembers(tenantId);
  }
}
