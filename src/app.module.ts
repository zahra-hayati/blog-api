import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { APP_INTERCEPTOR } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { winstonConfig } from './common/logger/winston.config';
import configuration from './config/configuration';
import { validationSchema } from './config/validation';
import { PostModule } from './post/post.module';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    WinstonModule.forRoot(winstonConfig),

    PrismaModule,
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
