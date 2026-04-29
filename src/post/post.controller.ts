import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UUIDParamDTO } from 'nestjs-xion/dto';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Role } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import type { CurrentUserType } from 'src/common/types/current-user.type';
import { CreatePostDto } from './dto/request/create-post.dto';
import { UpdatePostDto } from './dto/request/update-post.dto';
import { PostResponseDto } from './dto/response/post-response.dto';
import { PostService } from './post.service';

@ApiTags('Posts')
@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Get()
  @ApiOperation({
    summary: 'Get published posts with pagination and search',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of posts',
  })
  findAll(@Query() query: PaginationQueryDto) {
    return this.postService.findAll(query);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a post by slug with comments' })
  @ApiResponse({
    status: 200,
    type: PostResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Post not found' })
  findOne(@Param('slug') slug: string): Promise<PostResponseDto> {
    return this.postService.findOne(slug);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  create(
    @Body() dto: CreatePostDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<PostResponseDto> {
    return this.postService.create(dto, user.sub);
  }

  @Patch(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({
    status: 200,
    type: PostResponseDto,
  })
  update(
    @Param() { uuid }: UUIDParamDTO,
    @Body() dto: UpdatePostDto,
    @CurrentUser() user: CurrentUserType,
  ): Promise<PostResponseDto> {
    return this.postService.update(uuid, dto, user);
  }

  @Delete(':uuid')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200 })
  delete(
    @Param() { uuid }: UUIDParamDTO,
    @CurrentUser() user: CurrentUserType,
  ): Promise<{ success: boolean }> {
    return this.postService.delete(uuid, user);
  }

  @Patch(':uuid/publish')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Toggle publish status (ADMIN only)' })
  @ApiResponse({
    status: 200,
    type: PostResponseDto,
  })
  togglePublish(@Param() { uuid }: UUIDParamDTO) {
    return this.postService.togglePublish(uuid);
  }
}
