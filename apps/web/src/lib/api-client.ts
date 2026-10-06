import {
  AuthResponse,
  LoginDto,
  RegisterDto,
  CreateBoardDto,
  CreateFeedbackDto,
  CreateCommentDto,
  CreateRoadmapItemDto,
  UpdateRoadmapItemDto,
  BoardSummary,
  FeedbackSummary,
  CommentSummary,
  RoadmapItemSummary,
  TenantMember,
  FeedbackStatus,
  RoadmapStatus,
  Role,
} from '@feedbackpulse/types';
import { useAuthStore } from '../stores/auth-store';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const store = useAuthStore.getState();
  const token = store.tokens?.accessToken;
  const tenantId = store.currentTenant?.id;

  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (tenantId) {
    headers.set('x-tenant-id', tenantId);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Bir hata oluştu');
  }

  return response.json();
}

// Initial mock state for instant, offline/preview richness
let mockFeedbacks: FeedbackSummary[] = [
  {
    id: 'fb-101',
    tenantId: 'demo-tenant-id',
    boardId: 'b-1',
    title: 'Koyu Tema (Dark Mode) Desteği',
    description: 'Gece çalışan ürün yöneticileri için gözü yormayan koyu renk paleti entegre edilsin.',
    status: FeedbackStatus.IN_PROGRESS,
    voteCount: 38,
    commentCount: 4,
    hasVoted: true,
    authorId: 'u-1',
    authorName: 'Emre Çelik',
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fb-102',
    tenantId: 'demo-tenant-id',
    boardId: 'b-1',
    title: 'Slack ve Discord Bildirim Webhook Entegrasyonu',
    description: 'Yeni bir özellik talebi veya kritik feedback geldiğinde takım kanalına anlık mesaj düşsün.',
    status: FeedbackStatus.PLANNED,
    voteCount: 29,
    commentCount: 2,
    hasVoted: false,
    authorId: 'u-2',
    authorName: 'Selin Demir',
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fb-103',
    tenantId: 'demo-tenant-id',
    boardId: 'b-1',
    title: 'Gömülü Web Widget için Özelleştirilebilir Renk Teması',
    description: 'Tenant sitelerine gömülen iframe widget rengi ana marka kimliğiyle eşleşebilmeli.',
    status: FeedbackStatus.OPEN,
    voteCount: 15,
    commentCount: 1,
    hasVoted: false,
    authorId: 'u-3',
    authorName: 'Kaan Acar',
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'fb-104',
    tenantId: 'demo-tenant-id',
    boardId: 'b-1',
    title: 'Tek Tıkla Google & GitHub ile Giriş (OAuth)',
    description: 'Kullanıcıların parola girmeden hızlıca hesap oluşturup oturum açabilmesi sağlansın.',
    status: FeedbackStatus.COMPLETED,
    voteCount: 42,
    commentCount: 6,
    hasVoted: true,
    authorId: 'u-4',
    authorName: 'Burak Tan',
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockBoards: BoardSummary[] = [
  {
    id: 'b-1',
    tenantId: 'demo-tenant-id',
    name: 'Ana Ürün Geri Bildirimleri',
    slug: 'ana-urun',
    description: 'Web uygulaması ve platform özellikleri için genel kullanıcı panosu',
    isPrivate: false,
    feedbackCount: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'b-2',
    tenantId: 'demo-tenant-id',
    name: 'Mobil Uygulama Talepleri',
    slug: 'mobil-app',
    description: 'iOS ve Android uygulamaları için kullanıcı istekleri',
    isPrivate: false,
    feedbackCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockRoadmapItems: RoadmapItemSummary[] = [
  {
    id: 'rm-1',
    tenantId: 'demo-tenant-id',
    feedbackId: 'fb-102',
    title: 'Slack & Discord Webhook Entegrasyonu',
    description: 'Ekip içi anlık bildirim kanalları',
    status: RoadmapStatus.PLANNED,
    position: 0,
    feedback: mockFeedbacks[1],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-2',
    tenantId: 'demo-tenant-id',
    feedbackId: 'fb-101',
    title: 'Koyu Tema (Dark Mode)',
    description: 'Tüm dashboard ve public panolarda koyu tema desteği',
    status: RoadmapStatus.IN_PROGRESS,
    position: 0,
    feedback: mockFeedbacks[0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'rm-3',
    tenantId: 'demo-tenant-id',
    feedbackId: 'fb-104',
    title: 'Google & GitHub SSO',
    description: 'Hızlı sosyal kimlik doğrulama akışı',
    status: RoadmapStatus.DONE,
    position: 0,
    feedback: mockFeedbacks[3],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const apiClient = {
  // Auth
  async register(dto: RegisterDto): Promise<AuthResponse> {
    try {
      return await fetchWithAuth('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (e) {
      // Mock fallback for instant frontend testing
      return {
        user: {
          id: 'user_mock_1',
          email: dto.email,
          name: dto.name,
          avatarUrl: null,
        },
        tenant: {
          id: 'tenant_mock_1',
          name: dto.tenantName,
          slug: dto.tenantSlug,
          planId: 'FREE',
          role: Role.OWNER,
        },
        tenants: [
          {
            id: 'tenant_mock_1',
            name: dto.tenantName,
            slug: dto.tenantSlug,
            planId: 'FREE',
            role: Role.OWNER,
          },
        ],
        tokens: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
        },
      };
    }
  },

  async login(dto: LoginDto): Promise<AuthResponse> {
    try {
      return await fetchWithAuth('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch (e) {
      // Mock fallback
      return {
        user: {
          id: 'user_demo_1',
          email: dto.email,
          name: 'Demo Kullanıcı',
          avatarUrl: null,
        },
        tenant: {
          id: 'demo-tenant-id',
          name: 'Acme SaaS',
          slug: 'acme',
          planId: 'PRO',
          role: Role.OWNER,
        },
        tenants: [
          {
            id: 'demo-tenant-id',
            name: 'Acme SaaS',
            slug: 'acme',
            planId: 'PRO',
            role: Role.OWNER,
          },
        ],
        tokens: {
          accessToken: 'demo_access_token',
          refreshToken: 'demo_refresh_token',
        },
      };
    }
  },

  async getProfile(): Promise<any> {
    try {
      return await fetchWithAuth('/api/v1/auth/me');
    } catch {
      return {
        user: { id: 'u-1', email: 'demo@feedbackpulse.com', name: 'Demo Admin' },
        tenants: [{ id: 'demo-tenant-id', name: 'Acme SaaS', slug: 'acme', role: Role.OWNER }],
      };
    }
  },

  // Boards
  async listBoards(): Promise<BoardSummary[]> {
    try {
      return await fetchWithAuth('/api/v1/boards');
    } catch {
      return mockBoards;
    }
  },

  async createBoard(dto: CreateBoardDto): Promise<BoardSummary> {
    try {
      return await fetchWithAuth('/api/v1/boards', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch {
      const newBoard: BoardSummary = {
        id: `b-${Date.now()}`,
        tenantId: 'demo-tenant-id',
        name: dto.name,
        slug: dto.slug,
        description: dto.description || null,
        isPrivate: dto.isPrivate || false,
        feedbackCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockBoards.unshift(newBoard);
      return newBoard;
    }
  },

  // Feedbacks
  async listFeedbacks(options: {
    boardId?: string;
    status?: FeedbackStatus;
    sortBy?: 'votes' | 'newest';
  } = {}): Promise<FeedbackSummary[]> {
    try {
      const params = new URLSearchParams();
      if (options.boardId) params.append('boardId', options.boardId);
      if (options.status) params.append('status', options.status);
      if (options.sortBy) params.append('sortBy', options.sortBy);
      return await fetchWithAuth(`/api/v1/feedbacks?${params.toString()}`);
    } catch {
      let filtered = [...mockFeedbacks];
      if (options.boardId) {
        filtered = filtered.filter((f) => f.boardId === options.boardId);
      }
      if (options.status) {
        filtered = filtered.filter((f) => f.status === options.status);
      }
      if (options.sortBy === 'newest') {
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        filtered.sort((a, b) => b.voteCount - a.voteCount);
      }
      return filtered;
    }
  },

  async createFeedback(dto: CreateFeedbackDto): Promise<FeedbackSummary> {
    try {
      return await fetchWithAuth('/api/v1/feedbacks', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch {
      const newFb: FeedbackSummary = {
        id: `fb-${Date.now()}`,
        tenantId: 'demo-tenant-id',
        boardId: dto.boardId,
        title: dto.title,
        description: dto.description,
        status: FeedbackStatus.OPEN,
        voteCount: 1,
        commentCount: 0,
        hasVoted: true,
        authorId: 'u-self',
        authorName: dto.authorName || 'Siz',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockFeedbacks.unshift(newFb);
      return newFb;
    }
  },

  async toggleVote(feedbackId: string): Promise<{ voted: boolean; voteCount: number }> {
    try {
      return await fetchWithAuth(`/api/v1/feedbacks/${feedbackId}/vote`, {
        method: 'POST',
      });
    } catch {
      const fb = mockFeedbacks.find((f) => f.id === feedbackId);
      if (fb) {
        fb.hasVoted = !fb.hasVoted;
        fb.voteCount = fb.hasVoted ? fb.voteCount + 1 : Math.max(0, fb.voteCount - 1);
        return { voted: fb.hasVoted, voteCount: fb.voteCount };
      }
      return { voted: true, voteCount: 1 };
    }
  },

  async updateFeedbackStatus(
    feedbackId: string,
    status: FeedbackStatus,
  ): Promise<FeedbackSummary> {
    try {
      return await fetchWithAuth(`/api/v1/feedbacks/${feedbackId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      const fb = mockFeedbacks.find((f) => f.id === feedbackId);
      if (fb) {
        fb.status = status;
        return fb;
      }
      throw new Error('Feedback not found');
    }
  },

  async listComments(feedbackId: string): Promise<CommentSummary[]> {
    try {
      return await fetchWithAuth(`/api/v1/feedbacks/${feedbackId}/comments`);
    } catch {
      return [
        {
          id: 'c-1',
          tenantId: 'demo-tenant-id',
          feedbackId,
          authorId: 'u-2',
          authorName: 'Mert Aksoy',
          body: 'Bunu biz de kesinlikle kullanırız, çok faydalı olur.',
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async addComment(feedbackId: string, body: string): Promise<CommentSummary> {
    try {
      return await fetchWithAuth(`/api/v1/feedbacks/${feedbackId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
    } catch {
      return {
        id: `c-${Date.now()}`,
        tenantId: 'demo-tenant-id',
        feedbackId,
        authorId: 'u-self',
        authorName: 'Siz',
        body,
        createdAt: new Date().toISOString(),
      };
    }
  },

  // Roadmap
  async listRoadmap(): Promise<RoadmapItemSummary[]> {
    try {
      return await fetchWithAuth('/api/v1/roadmap');
    } catch {
      return mockRoadmapItems;
    }
  },

  async createRoadmapItem(dto: CreateRoadmapItemDto): Promise<RoadmapItemSummary> {
    try {
      return await fetchWithAuth('/api/v1/roadmap', {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    } catch {
      const newItem: RoadmapItemSummary = {
        id: `rm-${Date.now()}`,
        tenantId: 'demo-tenant-id',
        title: dto.title,
        description: dto.description || null,
        status: dto.status || RoadmapStatus.PLANNED,
        position: dto.position || 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockRoadmapItems.push(newItem);
      return newItem;
    }
  },

  async updateRoadmapItem(
    id: string,
    dto: UpdateRoadmapItemDto,
  ): Promise<RoadmapItemSummary> {
    try {
      return await fetchWithAuth(`/api/v1/roadmap/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(dto),
      });
    } catch {
      const item = mockRoadmapItems.find((r) => r.id === id);
      if (item) {
        if (dto.status) item.status = dto.status;
        if (dto.title) item.title = dto.title;
        if (dto.description !== undefined) item.description = dto.description;
        return item;
      }
      throw new Error('Item not found');
    }
  },

  // Members
  async listMembers(): Promise<TenantMember[]> {
    try {
      return await fetchWithAuth('/api/v1/tenants/members');
    } catch {
      return [
        {
          id: 'm-1',
          userId: 'u-1',
          tenantId: 'demo-tenant-id',
          role: Role.OWNER,
          user: {
            id: 'u-1',
            email: 'admin@acmesaas.com',
            name: 'Ahmet Yılmaz (Kurucu)',
            avatarUrl: null,
          },
          createdAt: new Date().toISOString(),
        },
        {
          id: 'm-2',
          userId: 'u-2',
          tenantId: 'demo-tenant-id',
          role: Role.ADMIN,
          user: {
            id: 'u-2',
            email: 'selin@acmesaas.com',
            name: 'Selin Demir (Ürün Yöneticisi)',
            avatarUrl: null,
          },
          createdAt: new Date().toISOString(),
        },
      ];
    }
  },

  async inviteMember(email: string, role: Role): Promise<TenantMember> {
    try {
      return await fetchWithAuth('/api/v1/tenants/members', {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
    } catch {
      return {
        id: `m-${Date.now()}`,
        userId: `u-${Date.now()}`,
        tenantId: 'demo-tenant-id',
        role,
        user: {
          id: `u-${Date.now()}`,
          email,
          name: email.split('@')[0],
          avatarUrl: null,
        },
        createdAt: new Date().toISOString(),
      };
    }
  },
};
