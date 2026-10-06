import { Injectable } from '@nestjs/common';
import { FeedbackStatus } from '@feedbackpulse/types';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import {
  IFeedbackRepository,
  FeedbackFilterOptions,
} from '../../application/ports/feedback.repository.interface';
import { FeedbackEntity } from '../../domain/entities/feedback.entity';

@Injectable()
export class PrismaFeedbackRepository implements IFeedbackRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any, currentUserId?: string): FeedbackEntity {
    const hasVoted = currentUserId && raw.votes ? raw.votes.length > 0 : false;
    return new FeedbackEntity(
      raw.id,
      raw.tenantId,
      raw.boardId,
      raw.title,
      raw.description,
      raw.status as FeedbackStatus,
      raw.voteCount,
      raw._count?.comments || 0,
      raw.authorId,
      raw.authorName,
      hasVoted,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
    );
  }

  async create(feedback: FeedbackEntity): Promise<FeedbackEntity> {
    const raw = await this.prisma.feedback.create({
      data: {
        tenantId: feedback.tenantId,
        boardId: feedback.boardId,
        title: feedback.title,
        description: feedback.description,
        status: feedback.status as any,
        authorId: feedback.authorId,
        authorName: feedback.authorName,
      },
      include: {
        _count: { select: { comments: true } },
      },
    });
    return this.toDomain(raw);
  }

  async findById(
    id: string,
    tenantId: string,
    currentUserId?: string,
  ): Promise<FeedbackEntity | null> {
    const raw = await this.prisma.feedback.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        _count: { select: { comments: true } },
        votes: currentUserId
          ? {
              where: { voterId: currentUserId },
            }
          : false,
      },
    });
    return raw ? this.toDomain(raw, currentUserId) : null;
  }

  async list(tenantId: string, options: FeedbackFilterOptions): Promise<FeedbackEntity[]> {
    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (options.boardId) {
      where.boardId = options.boardId;
    }
    if (options.status) {
      where.status = options.status;
    }

    const orderBy: any = {};
    if (options.sortBy === 'votes') {
      orderBy.voteCount = 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const rawList = await this.prisma.feedback.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { comments: true } },
        votes: options.currentUserId
          ? {
              where: { voterId: options.currentUserId },
            }
          : false,
      },
    });

    return rawList.map((raw) => this.toDomain(raw, options.currentUserId));
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: FeedbackStatus,
  ): Promise<FeedbackEntity> {
    const raw = await this.prisma.feedback.update({
      where: { id },
      data: { status: status as any },
      include: {
        _count: { select: { comments: true } },
      },
    });
    return this.toDomain(raw);
  }

  async update(
    id: string,
    tenantId: string,
    data: Partial<FeedbackEntity>,
  ): Promise<FeedbackEntity> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;

    const raw = await this.prisma.feedback.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { comments: true } },
      },
    });
    return this.toDomain(raw);
  }

  async incrementVoteCount(id: string, tenantId: string): Promise<number> {
    const updated = await this.prisma.feedback.update({
      where: { id },
      data: { voteCount: { increment: 1 } },
      select: { voteCount: true },
    });
    return updated.voteCount;
  }

  async decrementVoteCount(id: string, tenantId: string): Promise<number> {
    const updated = await this.prisma.feedback.update({
      where: { id },
      data: { voteCount: { decrement: 1 } },
      select: { voteCount: true },
    });
    return Math.max(0, updated.voteCount);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.feedback.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() },
    });
  }
}
