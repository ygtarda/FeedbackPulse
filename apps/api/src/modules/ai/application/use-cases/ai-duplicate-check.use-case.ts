import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

export interface DuplicateCheckResult {
  duplicates: Array<{
    id: string;
    title: string;
    similarityScore: number;
  }>;
}

@Injectable()
export class AiDuplicateCheckUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    tenantId: string,
    title: string,
    description?: string,
  ): Promise<DuplicateCheckResult> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID gereklidir');
    }
    if (!title || !title.trim()) {
      throw new BadRequestException('Başlık gereklidir');
    }

    const queryTerms = this.tokenize(`${title} ${description || ''}`);

    const existingFeedbacks = await this.prisma.feedback.findMany({
      where: {
        tenantId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
      },
      take: 50,
    });

    const duplicates: Array<{ id: string; title: string; similarityScore: number }> = [];

    for (const fb of existingFeedbacks) {
      const fbTerms = this.tokenize(`${fb.title} ${fb.description || ''}`);
      const score = this.calculateSimilarity(queryTerms, fbTerms);

      if (score >= 35) {
        duplicates.push({
          id: fb.id,
          title: fb.title,
          similarityScore: score,
        });
      }
    }

    duplicates.sort((a, b) => b.similarityScore - a.similarityScore);

    return {
      duplicates: duplicates.slice(0, 5),
    };
  }

  private tokenize(text: string): Set<string> {
    const words = text
      .toLowerCase()
      .replace(/[^\w\sğüşıöçĞÜŞİÖÇ]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
    return new Set(words);
  }

  private calculateSimilarity(querySet: Set<string>, targetSet: Set<string>): number {
    if (querySet.size === 0 || targetSet.size === 0) return 0;
    let intersection = 0;
    for (const item of querySet) {
      if (targetSet.has(item)) {
        intersection++;
      }
    }
    const queryCoverage = intersection / querySet.size;
    const union = new Set([...querySet, ...targetSet]).size;
    const jaccard = intersection / union;
    return Math.round((queryCoverage * 0.7 + jaccard * 0.3) * 100);
  }
}
