import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { AiDuplicateCheckUseCase } from './ai-duplicate-check.use-case';
import { PrismaService } from '../../../../common/prisma/prisma.service';

describe('AiDuplicateCheckUseCase', () => {
  let useCase: AiDuplicateCheckUseCase;
  let prisma: jest.Mocked<any>;

  beforeEach(async () => {
    prisma = {
      feedback: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'fb-existing',
            title: 'Karanlık Mod (Dark Mode) Desteği Eklensin',
            description: 'Göz yormayan gece teması özelliği istiyoruz',
          },
        ]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiDuplicateCheckUseCase,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    useCase = module.get<AiDuplicateCheckUseCase>(AiDuplicateCheckUseCase);
  });

  it('should detect duplicate feedback when terms overlap significantly', async () => {
    const res = await useCase.execute(
      'tenant-123',
      'Karanlık Gece Modu',
      'Gece teması olsun',
    );

    expect(res.duplicates.length).toBeGreaterThan(0);
    expect(res.duplicates[0].id).toBe('fb-existing');
    expect(res.duplicates[0].similarityScore).toBeGreaterThanOrEqual(40);
  });

  it('should return empty duplicates when terms do not match', async () => {
    const res = await useCase.execute(
      'tenant-123',
      'Stripe Ödeme Fatura İndirme',
      'Faturalar PDF gelsin',
    );

    expect(res.duplicates).toHaveLength(0);
  });

  it('should throw BadRequestException if title is empty', async () => {
    await expect(useCase.execute('tenant-123', '')).rejects.toThrow(
      BadRequestException,
    );
  });
});
