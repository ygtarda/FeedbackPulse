import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IBoardRepository } from '../../application/ports/board.repository.interface';
import { BoardEntity } from '../../domain/entities/board.entity';

@Injectable()
export class PrismaBoardRepository implements IBoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): BoardEntity {
    return new BoardEntity(
      raw.id,
      raw.tenantId,
      raw.name,
      raw.slug,
      raw.description,
      raw.isPrivate,
      raw._count?.feedbacks || 0,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
    );
  }

  async create(board: BoardEntity): Promise<BoardEntity> {
    const raw = await this.prisma.board.create({
      data: {
        tenantId: board.tenantId,
        name: board.name,
        slug: board.slug,
        description: board.description,
        isPrivate: board.isPrivate,
      },
    });
    return this.toDomain(raw);
  }

  async findById(id: string, tenantId: string): Promise<BoardEntity | null> {
    const raw = await this.prisma.board.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { _count: { select: { feedbacks: true } } },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findBySlug(slug: string, tenantId: string): Promise<BoardEntity | null> {
    const raw = await this.prisma.board.findFirst({
      where: { slug, tenantId, deletedAt: null },
      include: { _count: { select: { feedbacks: true } } },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async listByTenant(tenantId: string): Promise<BoardEntity[]> {
    const rawList = await this.prisma.board.findMany({
      where: { tenantId, deletedAt: null },
      include: { _count: { select: { feedbacks: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rawList.map((raw) => this.toDomain(raw));
  }

  async update(id: string, tenantId: string, data: Partial<BoardEntity>): Promise<BoardEntity> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.isPrivate !== undefined) updateData.isPrivate = data.isPrivate;

    const raw = await this.prisma.board.update({
      where: { id },
      data: updateData,
    });
    return this.toDomain(raw);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.board.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }
}
