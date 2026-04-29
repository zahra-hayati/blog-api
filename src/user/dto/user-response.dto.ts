import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty({ example: 'uuid' })
  sub: string;

  @ApiProperty({ example: 'user@test.com' })
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;
}
