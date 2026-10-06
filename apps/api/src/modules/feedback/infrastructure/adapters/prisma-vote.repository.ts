import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';
import { IVoteRepository } from '../../application/ports/vote.repository.interface';
import { VoteEntity } from '../../domain/entities/vote.entity';

@Injectable()
export class PrismaVoteRepository implements IVoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(vote: VoteEntity): Promise<VoteEntity> {
    const raw = await this.prisma.vote.create({
      data: {
        tenantId: vote.tenantId,
        feedbackId: vote.feedbackId,
        voterId: vote.voterId,
      },
    });
    return new VoteEntity(raw.id, raw.tenantId, raw.feedbackId, raw.voterId, raw.createdAt);
  }

  async delete(feedbackId: string, voterId: string): Promise<void> {
    await this.prisma.vote.deleteMany({
      where: {
        feedbackId,
        voterId,
      },
    });
  }

  async exists(feedbackId: string, voterId: string): Promise<boolean> {
    const count = await this.prisma.vote.count({
      where: {
        feedbackId,
        voterId,
      },
    });
    return count > 0;
  }
}
