import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

export const CurrentToken = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    const auth = request.headers.authorization;

    if (!auth) return undefined;

    const token = auth.split(' ')[1];

    const decoded = jwt.decode(token) as { jti?: string };

    return decoded?.jti;
  },
);
