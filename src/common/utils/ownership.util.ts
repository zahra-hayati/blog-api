import { ForbiddenException } from '@nestjs/common';
import { CurrentUserType } from '../types/current-user.type';

export function checkOwnership(
  ownerId: string,
  user: CurrentUserType,
  message = 'Access denied',
): void {
  if (ownerId !== user.sub && user.role !== 'ADMIN') {
    throw new ForbiddenException(message);
  }
}
