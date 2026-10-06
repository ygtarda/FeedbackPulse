import { Inject, Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { InviteMemberDto, Role } from '@feedbackpulse/types';
import { USER_REPOSITORY, TENANT_REPOSITORY, PASSWORD_HASHER } from '../tokens';
import { IUserRepository } from '../ports/user.repository.interface';
import { ITenantRepository, TenantMemberInfo } from '../ports/tenant.repository.interface';
import { IPasswordHasher } from '../ports/password-hasher.interface';
import { UserEntity } from '../../domain/entities/user.entity';
import { MembershipEntity } from '../../domain/entities/membership.entity';

@Injectable()
export class InviteMemberUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(TENANT_REPOSITORY) private readonly tenantRepo: ITenantRepository,
    @Inject(PASSWORD_HASHER) private readonly hasher: IPasswordHasher,
  ) {}

  async execute(tenantId: string, dto: InviteMemberDto): Promise<TenantMemberInfo> {
    if (!tenantId) {
      throw new BadRequestException('Çalışma alanı kimliği gereklidir');
    }

    let user = await this.userRepo.findByEmail(dto.email);
    if (!user) {
      const tempPasswordHash = await this.hasher.hash('FeedbackPulse123!');
      user = await this.userRepo.create(
        UserEntity.create({
          email: dto.email,
          name: dto.email.split('@')[0],
          passwordHash: tempPasswordHash,
        }),
      );
    }

    const existingMembership = await this.tenantRepo.getMembership(user.id, tenantId);
    if (existingMembership) {
      throw new ConflictException('Bu kullanıcı zaten bu çalışma alanının bir üyesi');
    }

    const membership = await this.tenantRepo.addMembership(
      MembershipEntity.create({
        userId: user.id,
        tenantId,
        role: dto.role || Role.MEMBER,
      }),
    );

    return {
      id: membership.id,
      userId: user.id,
      tenantId,
      role: membership.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
      createdAt: membership.createdAt || new Date(),
    };
  }
}
