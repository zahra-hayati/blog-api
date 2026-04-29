import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; jti: string }) {
    const token = await this.prisma.token.findUnique({
      where: { tokenId: payload.jti },
    });

    if (!token || token.isRevoked) {
      throw new UnauthorizedException('Token revoked');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
      },
    });

    if (!user) throw new UnauthorizedException();

    return {
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      isAdmin: user.role === 'ADMIN',
    };
  }
}
