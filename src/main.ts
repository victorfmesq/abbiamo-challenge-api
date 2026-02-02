import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

const logger = new Logger('Main');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API de Entregas Abbiamo')
    .setDescription(
      'API Mock para o Desafio Técnico Frontend da Abbiamo. Esta API simula um sistema de monitoramento de entregas com atualizações em tempo real via WebSocket.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/swagger', app, document);

  const { apiReference } = await import('@scalar/nestjs-api-reference');
  app.use(
    '/api/docs',
    apiReference({
      content: document,
    }),
  );

  const port = process.env.PORT || 4000;
  await app.listen(port);

  logger.log(`Server is running on: http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
}
void bootstrap();
