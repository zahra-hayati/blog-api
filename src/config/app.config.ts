import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from 'src/common/filters/global-exception.filter';

export function configureApp(app: NestExpressApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  // Global filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.enableVersioning({
    type: VersioningType.URI,
  });

  const config = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('Backend API for Blog System')
    .setVersion('1.0.0')
    .addBearerAuth({
      name: 'authorization',
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger/api/document', app, document, {
    swaggerOptions: {
      tagsSorter: 'alpha',
    },
  });
}
