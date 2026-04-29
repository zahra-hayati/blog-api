import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdatePostDto {
  @ApiProperty({ example: 'How to set the database connection' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @Transform(({ value }) => value.trim())
  title?: string;

  @ApiProperty({ example: 'Your database connection is...' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  @Transform(({ value }) => value.trim())
  content?: string;
}
