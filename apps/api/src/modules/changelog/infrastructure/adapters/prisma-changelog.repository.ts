import { Injectable } from '@nestjs/common';
import { ChangelogCategory } from '@feedbackpulse/types';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IChangelogRepository } from '../../application/ports/changelog.repository.interface';
import { ChangelogEntity } from '../../domain/entities/changelog.entity';

@Injectable()
export class PrismaChangelogRepository implements IChangelogRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): ChangelogEntity {
    return new ChangelogEntity(
      raw.id,
      raw.tenantId,
      raw.title,
      raw.body,
      raw.version,
      raw.category as ChangelogCategory,
      raw.isPublished,
      raw.publishedAt,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async create(entry: ChangelogEntity): Promise<ChangelogEntity> {
    const raw = await this.prisma.changelogEntry.create({
      data: {
        tenantId: entry.tenantId,
        title: entry.title,
        body: entry.body,
        version: entry.version,
        category: entry.category,
        isPublished: entry.isPublished,
        publishedAt: entry.publishedAt,
      },
    });
    return this.toDomain(raw);
  }

  async findById(id: string, tenantId: string): Promise<ChangelogEntity | null> {
    const raw = await this.prisma.changelogEntry.findFirst({
      where: { id, tenantId },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async listByTenant(tenantId: string, onlyPublished: boolean = false): Promise<ChangelogEntity[]> {
    const where: any = { tenantId };
    if (onlyPublished) {
      where.isPublished = true;
    }
    const rawList = await this.prisma.changelogEntry.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
    });
    return rawList.map((r) => this.toDomain(r));
  }

  async update(id: string, tenantId: string, data: Partial<ChangelogEntity>): Promise<ChangelogEntity> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.body !== undefined) updateData.body = data.body;
    if (data.version !== undefined) updateData.version = data.version;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished;
    if (data.publishedAt !== undefined) updateData.publishedAt = data.publishedAt;

    const raw = await this.prisma.changelogEntry.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(raw);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.changelogEntry.deleteMany({
      where: { id, tenantId },
    });
  }
}
