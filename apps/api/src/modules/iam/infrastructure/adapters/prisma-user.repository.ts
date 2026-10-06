import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IUserRepository } from '../../application/ports/user.repository.interface';
import { UserEntity } from '../../domain/entities/user.entity';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): UserEntity {
    return new UserEntity(
      raw.id,
      raw.email,
      raw.passwordHash,
      raw.name,
      raw.avatarUrl,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const raw = await this.prisma.user.create({
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        avatarUrl: user.avatarUrl,
      },
    });
    return this.toDomain(raw);
  }

  async update(id: string, user: Partial<UserEntity>): Promise<UserEntity> {
    const data: any = {};
    if (user.name !== undefined) data.name = user.name;
    if (user.avatarUrl !== undefined) data.avatarUrl = user.avatarUrl;
    if (user.passwordHash !== undefined) data.passwordHash = user.passwordHash;

    const raw = await this.prisma.user.update({
      where: { id },
      data,
    });
    return this.toDomain(raw);
  }
}
