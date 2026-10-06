import { AuthTokens, JwtPayload } from '@feedbackpulse/types';

export interface ITokenService {
  generateTokens(payload: JwtPayload): Promise<AuthTokens>;
  verifyAccessToken(token: string): Promise<JwtPayload>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
}
