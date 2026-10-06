import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { ICommentRepository } from '../../application/ports/comment.repository.interface';
import { CommentEntity } from '../../domain/entities/comment.entity';

@Injectable()
export class PrismaCommentRepository implements ICommentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): CommentEntity {
    return new CommentEntity(
      raw.id,
      raw.tenantId,
      raw.feedbackId,
      raw.authorId,
      raw.authorName,
      raw.body,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
    );
  }

  async create(comment: CommentEntity): Promise<CommentEntity> {
    const raw = await this.prisma.comment.create({
      data: {
        tenantId: comment.tenantId,
        feedbackId: comment.feedbackId,
        authorId: comment.authorId,
        authorName: comment.authorName,
        body: comment.body,
      },
    });
    return this.toDomain(raw);
  }

  async listByFeedback(feedbackId: string, tenantId: string): Promise<CommentEntity[]> {
    const rawList = await this.prisma.comment.findMany({
      where: {
        feedbackId,
        tenantId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'asc' },
    });
    return rawList.map((raw) => this.toDomain(raw));
  }
}
