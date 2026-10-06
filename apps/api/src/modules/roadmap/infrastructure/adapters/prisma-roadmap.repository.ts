import { Injectable } from '@nestjs/common';
import { RoadmapStatus, FeedbackStatus } from '@feedbackpulse/types';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IRoadmapRepository } from '../../application/ports/roadmap.repository.interface';
import { RoadmapItemEntity } from '../../domain/entities/roadmap-item.entity';
import { FeedbackEntity } from '../../../feedback/domain/entities/feedback.entity';

@Injectable()
export class PrismaRoadmapRepository implements IRoadmapRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(raw: any): RoadmapItemEntity {
    const feedback = raw.feedback
      ? new FeedbackEntity(
          raw.feedback.id,
          raw.feedback.tenantId,
          raw.feedback.boardId,
          raw.feedback.title,
          raw.feedback.description,
          raw.feedback.status as FeedbackStatus,
          raw.feedback.voteCount,
          0,
          raw.feedback.authorId,
          raw.feedback.authorName,
          false,
          raw.feedback.createdAt,
          raw.feedback.updatedAt,
        )
      : null;

    return new RoadmapItemEntity(
      raw.id,
      raw.tenantId,
      raw.title,
      raw.description,
      raw.status as RoadmapStatus,
      raw.position,
      raw.feedbackId,
      feedback,
      raw.createdAt,
      raw.updatedAt,
    );
  }

  async create(item: RoadmapItemEntity): Promise<RoadmapItemEntity> {
    const raw = await this.prisma.roadmapItem.create({
      data: {
        tenantId: item.tenantId,
        title: item.title,
        description: item.description,
        status: item.status as any,
        position: item.position,
        feedbackId: item.feedbackId || null,
      },
      include: {
        feedback: true,
      },
    });
    return this.toDomain(raw);
  }

  async findById(id: string, tenantId: string): Promise<RoadmapItemEntity | null> {
    const raw = await this.prisma.roadmapItem.findFirst({
      where: { id, tenantId },
      include: {
        feedback: true,
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async listByTenant(tenantId: string): Promise<RoadmapItemEntity[]> {
    const rawList = await this.prisma.roadmapItem.findMany({
      where: { tenantId },
      orderBy: [{ status: 'asc' }, { position: 'asc' }, { createdAt: 'desc' }],
      include: {
        feedback: true,
      },
    });
    return rawList.map((raw) => this.toDomain(raw));
  }

  async update(
    id: string,
    tenantId: string,
    data: {
      title?: string;
      description?: string;
      status?: RoadmapStatus;
      position?: number;
    },
  ): Promise<RoadmapItemEntity> {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.position !== undefined) updateData.position = data.position;

    const raw = await this.prisma.roadmapItem.update({
      where: { id },
      data: updateData,
      include: {
        feedback: true,
      },
    });

    if (raw.feedbackId && data.status) {
      let feedbackStatus: FeedbackStatus | null = null;
      if (data.status === RoadmapStatus.PLANNED) feedbackStatus = FeedbackStatus.PLANNED;
      else if (data.status === RoadmapStatus.IN_PROGRESS) feedbackStatus = FeedbackStatus.IN_PROGRESS;
      else if (data.status === RoadmapStatus.DONE) feedbackStatus = FeedbackStatus.COMPLETED;

      if (feedbackStatus) {
        await this.prisma.feedback.update({
          where: { id: raw.feedbackId },
          data: { status: feedbackStatus as any },
        });
      }
    }

    return this.toDomain(raw);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await this.prisma.roadmapItem.deleteMany({
      where: { id, tenantId },
    });
  }
}
