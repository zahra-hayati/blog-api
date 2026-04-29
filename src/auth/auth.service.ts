import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterDto } from './dto/request/register.dto';
import { AuthResponseDto } from './dto/response/auth-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    this.logger.info('User registration attempt', { email: dto.email });

    const hashed = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: { ...dto, password: hashed },
      });

      this.logger.info('User registered successfully', {
        userId: user.id,
      });

      return this.generateToken(user);
    } catch (error) {
      // Handle unique constraint
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.warn('Registration failed: email already exists', {
          email: dto.email,
        });

        throw new ConflictException('Email already exists');
      }

      this.logger.error('Failed to register', {
        error: error instanceof Error ? error.message : 'unknown',
      });

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    this.logger.info('Login attempt', {
      email: dto.email,
    });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      this.logger.warn('Login failed: user not found', {
        email: dto.email,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) {
      this.logger.warn('Login failed: invalid password', { userId: user.id });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.token.updateMany({
      where: {
        userId: user.id,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    this.logger.info('Previous tokens revoked', { userId: user.id });
    this.logger.info('Login successful', { userId: user.id });

    return this.generateToken(user);
  }

  private async generateToken(user: {
    id: string;
    role: string;
  }): Promise<AuthResponseDto> {
    const jti = randomUUID();

    const payload = {
      sub: user.id,
      role: user.role,
      jti,
    };

    const accessToken = this.jwt.sign(payload);

    await this.prisma.token.create({
      data: {
        userId: user.id,
        tokenId: jti,
      },
    });

    this.logger.info('JWT issued', { userId: user.id });

    return { accessToken };
  }

  async logout(jti: string, userId: string): Promise<{ success: boolean }> {
    this.logger.info('Logout attempt', { userId });

    const token = await this.prisma.token.findUnique({
      where: { tokenId: jti },
    });

    if (!token) {
      this.logger.warn('Logout failed: token not found', { userId });
      throw new UnauthorizedException();
    }

    if (token.isRevoked) {
      this.logger.warn('Token already revoked', { userId });
      return { success: true };
    }

    await this.prisma.token.update({
      where: { tokenId: jti },
      data: { isRevoked: true },
    });

    this.logger.info('User logged out', { userId });

    return { success: true };
  }
}
