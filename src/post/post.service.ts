import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import slugify from 'slugify';
import { Logger } from 'winston';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { checkOwnership } from 'src/common/utils/ownership.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  async create(dto: CreatePostDto, userId: string) {
    this.logger.info('Creating post', { userId, title: dto.title });

    const post = await this.prisma.post.create({
      data: {
        ...dto,
        slug: slugify(dto.title, { lower: true }),
        authorId: userId,
      },
    });

    this.logger.info('Post created', { postId: post.id });
    return post;
  }

  async findAll(query: PaginationQueryDto) {
    const { page, limit, search } = query;
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;

    this.logger.info('Fetching posts', { page, limit, search });

    const where: Prisma.PostWhereInput = {
      published: true,
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            content: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.post.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async findOne(slug: string) {
    this.logger.info('Fetching post by slug', { slug });

    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: { comments: true },
    });

    if (!post) {
      this.logger.warn('Post not found', { slug });
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async findOneById(id: string) {
    this.logger.info('Fetching post by id', { id });

    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      this.logger.warn('Post not found', { id });
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(id: string, dto: UpdatePostDto, user: CurrentUserType) {
    this.logger.info('Updating post', { id, userId: user.sub });

    const post = await this.findOneById(id);

    checkOwnership(post.authorId, user);

    const updated = await this.prisma.post.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.title && { slug: slugify(dto.title, { lower: true }) }),
      },
    });

    this.logger.info('Post updated', { id });
    return updated;
  }

  async delete(
    id: string,
    user: CurrentUserType,
  ): Promise<{ success: boolean }> {
    this.logger.info('Deleting post', { postId: id, userId: user.sub });

    const post = await this.findOneById(id);

    checkOwnership(post.authorId, user);

    try {
      await this.prisma.post.delete({ where: { id } });

      this.logger.info('Post deleted', { postId: id });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete post', {
        postId: id,
        error: error instanceof Error ? error.message : 'unknown',
      });

      throw error;
    }
  }

  async togglePublish(id: string) {
    this.logger.info('Toggling publish status', { postId: id });

    const post = await this.findOneById(id);

    const updated = await this.prisma.post.update({
      where: { id },
      data: { published: !post.published },
    });

    this.logger.info('Publish toggled', {
      postId: id,
      published: updated.published,
    });

    return updated;
  }
}
