import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './config/app.config';

async function bootstrap() {
  const logger = new Logger('Blog API');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  configureApp(app);

  const port = process.env.PORT ?? 3000;
  await app.listen(port, () =>
    logger.log(
      `Server running at port: ${port} in ${process.env.NODE_ENV} environment`,
    ),
  );
}
bootstrap();
