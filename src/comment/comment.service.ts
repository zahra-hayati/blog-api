import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CurrentUserType } from 'src/common/types/current-user.type';
import { checkOwnership } from 'src/common/utils/ownership.util';
import { Logger } from 'winston';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import { PaginatedCommentsResponseDto } from './dto/response/comment-response.dto';

@Injectable()
export class CommentService {
  constructor(
    private prisma: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async create(postId: string, dto: CreateCommentDto, userId: string) {
    this.logger.info('Creating comment', { userId, postId });

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || !post.published) {
      this.logger.warn('Post not found or unpublished', { postId });
      throw new NotFoundException('Post not found or not published');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        postId,
        authorId: userId,
      },
    });

    this.logger.info('Comment created', { userId, postId });
    return comment;
  }

  async findByPost(
    postId: string,
    query: PaginationQueryDto,
  ): Promise<PaginatedCommentsResponseDto> {
    const { page, limit, search } = query;
    const pageNumber = Number(page) || 1;
    const limitNumber = Number(limit) || 10;
    this.logger.info('Fetching comments', { postId, page });

    const where: Prisma.CommentWhereInput = {
      postId,
      ...(search?.trim()
        ? {
            content: {
              contains: search,
              mode: 'insensitive',
            },
          }
        : {}),
    };

    const [data, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip: (pageNumber - 1) * limitNumber,
        take: limitNumber,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total },
    };
  }

  async delete(
    commentId: string,
    user: CurrentUserType,
  ): Promise<{ success: boolean }> {
    this.logger.info('Deleting comment', { commentId, userId: user.sub });

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      this.logger.warn('Comment not found', { commentId });
      throw new NotFoundException('Comment not found');
    }

    checkOwnership(comment.authorId, user);

    try {
      await this.prisma.comment.delete({
        where: { id: commentId },
      });

      this.logger.info('Comment deleted', { commentId });

      return { success: true };
    } catch (error) {
      this.logger.error('Failed to delete comment', {
        commentId,
        error: error instanceof Error ? error.message : 'unknown',
      });

      throw error;
    }
  }
}
