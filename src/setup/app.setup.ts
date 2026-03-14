import { INestApplication } from '@nestjs/common';
import { pipesSetup } from './pipes.setup';
import { PATH } from '../core/constants/paths';

export function appSetup(app: INestApplication) {
  app.enableCors();
  pipesSetup(app);
  app.setGlobalPrefix(PATH.PREFIX);
}
