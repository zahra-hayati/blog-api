import { Role } from '@prisma/client';

export interface CurrentUserType {
  sub: string;
  email: string;
  role: Role;
}
