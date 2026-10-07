import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../common/prisma/prisma.service';

export interface AiSummaryResult {
  summary: string;
  insights: string[];
  topThemes: string[];
}

@Injectable()
export class AiSummaryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(tenantId: string, boardId?: string): Promise<AiSummaryResult> {
    if (!tenantId) {
      throw new BadRequestException('Tenant ID gereklidir');
    }

    const feedbacks = await this.prisma.feedback.findMany({
      where: {
        tenantId,
        deletedAt: null,
        ...(boardId ? { boardId } : {}),
      },
      orderBy: { voteCount: 'desc' },
      take: 20,
    });

    if (feedbacks.length === 0) {
      return {
        summary: 'Bu panoda henüz analiz edilebilecek yeterli geri bildirim bulunmuyor.',
        insights: [
          'Kullanıcılarınızdan ilk geri bildirimleri toplamak için widget\'ı veya genel panoyu paylaşın.',
        ],
        topThemes: ['Henüz veri yok'],
      };
    }

    // AI Analytical Synthesis
    const totalVotes = feedbacks.reduce((acc, f) => acc + f.voteCount, 0);
    const topFeature = feedbacks[0];

    const detectedThemes = new Set<string>();
    feedbacks.forEach((f) => {
      const text = `${f.title} ${f.description || ''}`.toLowerCase();
      if (text.includes('dark') || text.includes('tema')) detectedThemes.add('Tema & Arayüz');
      if (text.includes('slack') || text.includes('webhook') || text.includes('api'))
        detectedThemes.add('Entegrasyonlar');
      if (text.includes('sso') || text.includes('google') || text.includes('şifre'))
        detectedThemes.add('Kimlik Doğrulama & Güvenlik');
      if (text.includes('hız') || text.includes('performans')) detectedThemes.add('Performans');
      if (text.includes('mobil') || text.includes('ios') || text.includes('android'))
        detectedThemes.add('Mobil Deneyim');
    });

    if (detectedThemes.size === 0) {
      detectedThemes.add('Ürün Deneyimi');
      detectedThemes.add('Kullanılabilirlik');
    }

    const summary = `Kullanıcılar toplam ${feedbacks.length} talep ve ${totalVotes} oy ile en yoğun olarak "${Array.from(
      detectedThemes,
    ).join(', ')}" alanlarına odaklanmış durumda. En yüksek önceliğe sahip özellik "${topFeature.title}" (${topFeature.voteCount} oy).`;

    const insights = [
      `En çok arzulanan geliştirme "${topFeature.title}" olarak öne çıkıyor.`,
      `Geri bildirimlerin %${Math.min(
        90,
        Math.round((topFeature.voteCount / Math.max(totalVotes, 1)) * 100 * 2),
      )}'i doğrudan ana akış deneyimini etkiliyor.`,
      `Öne çıkan ${detectedThemes.size} ana kategori için bir sonraki çeyrek yol haritasına odaklanılması önerilir.`,
    ];

    return {
      summary,
      insights,
      topThemes: Array.from(detectedThemes),
    };
  }
}
