import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UUIDParamDTO } from 'nestjs-xion/dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import type { CurrentUserType } from 'src/common/types/current-user.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/request/create-comment.dto';
import {
  CommentResponseDto,
  PaginatedCommentsResponseDto,
} from './dto/response/comment-response.dto';

@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private commentService: CommentService) {}

  @Get(':uuid')
  @ApiOperation({ summary: 'Get comments by post' })
  @ApiResponse({
    status: 200,
    type: PaginatedCommentsResponseDto,
    isArray: true,
  })
  findByPost(
    @Param() { uuid: postId }: UUIDParamDTO,
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedCommentsResponseDto> {
    return this.commentService.findByPost(postId, query);
  }

  @Post(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create comment for a post' })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponse({ status: 201, type: CommentResponseDto })
  create(
    @Param() { uuid: postId }: UUIDParamDTO,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.commentService.create(postId, dto, user.sub);
  }

  @Delete(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiResponse({ status: 200 })
  delete(
    @Param() { uuid }: UUIDParamDTO,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ success: boolean }> {
    return this.commentService.delete(uuid, user);
  }
}
