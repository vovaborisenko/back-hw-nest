import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';

export function appSetup(app: INestApplication) {
  app.enableCors();
  pipesSetup(app);
  app.setGlobalPrefix('api');
}
