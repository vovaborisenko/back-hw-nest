import { INestApplication, ValidationPipe } from '@nestjs/common';

export function appSetup(app: INestApplication) {
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
}
