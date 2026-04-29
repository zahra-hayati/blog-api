import { ApiProperty } from '@nestjs/swagger';
import { CommentResponseDto } from 'src/comment/dto/response/comment-response.dto';
import { ResponseMetaDto } from 'src/common/dto/pagination-query.dto';

export class PostResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'NestJS Guide' })
  title: string;

  @ApiProperty({ example: 'nestjs-guide' })
  slug: string;

  @ApiProperty({ example: 'Full content...' })
  content: string;

  @ApiProperty({ example: true })
  published: boolean;

  @ApiProperty({ example: 'user-id' })
  authorId: string;

  @ApiProperty({ type: [CommentResponseDto], required: false })
  comments?: CommentResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedPostResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  data: PostResponseDto[];

  @ApiProperty({ type: ResponseMetaDto })
  meta: ResponseMetaDto;
}
