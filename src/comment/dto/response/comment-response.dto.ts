import { ApiProperty } from '@nestjs/swagger';
import { ResponseMetaDto } from 'src/common/dto/pagination-query.dto';

export class CommentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Nice article!' })
  content: string;

  @ApiProperty({ example: 'post-id' })
  postId: string;

  @ApiProperty({ example: 'user-id' })
  authorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedCommentsResponseDto {
  @ApiProperty({ type: [CommentResponseDto] })
  data: CommentResponseDto[];

  @ApiProperty({ type: ResponseMetaDto })
  meta: ResponseMetaDto;
}
