import { z } from 'zod';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  END_CUSTOMER = 'END_CUSTOMER',
}

export const RegisterSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalıdır'),
  name: z.string().min(2, 'Ad Soyad en az 2 karakter olmalıdır'),
  tenantName: z.string().min(2, 'Şirket/Çalışma alanı adı en az 2 karakter olmalıdır'),
  tenantSlug: z
    .string()
    .min(2, 'Alt alan adı en az 2 karakter olmalıdır')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Yalnızca küçük harf, rakam ve tire içerebilir'),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(1, 'Şifre gereklidir'),
  tenantSlug: z.string().optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Yenileme tokenı gereklidir'),
});

export type RefreshTokenDto = z.infer<typeof RefreshTokenSchema>;

export interface JwtPayload {
  sub: string;
  email: string;
  tenantId?: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface UserSummary {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  planId: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: UserSummary;
  tenant?: TenantSummary | null;
  tenants: TenantSummary[];
  tokens: AuthTokens;
}
