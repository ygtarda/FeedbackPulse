import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthTokens, JwtPayload } from '@feedbackpulse/types';
import { ITokenService } from '../../application/ports/token-service.interface';

@Injectable()
export class JwtTokenService implements ITokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generateTokens(payload: JwtPayload): Promise<AuthTokens> {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'feedbackpulse_access_secret_key_change_in_production',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'feedbackpulse_refresh_secret_key_change_in_production',
    );
    const accessExpiration = this.configService.get<string>('JWT_ACCESS_EXPIRATION', '15m');
    const refreshExpiration = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');

    const cleanPayload = {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
    };

    const accessToken = await this.jwtService.signAsync(cleanPayload, {
      secret: accessSecret,
      expiresIn: accessExpiration as any,
    });

    const refreshToken = await this.jwtService.signAsync(cleanPayload, {
      secret: refreshSecret,
      expiresIn: refreshExpiration as any,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'feedbackpulse_access_secret_key_change_in_production',
    );
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: accessSecret,
    });
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'feedbackpulse_refresh_secret_key_change_in_production',
    );
    return this.jwtService.verifyAsync<JwtPayload>(token, {
      secret: refreshSecret,
    });
  }
}
