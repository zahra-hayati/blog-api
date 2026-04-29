import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: 'Great post!' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  @Transform(({ value }) => value.trim())
  content: string;
}
