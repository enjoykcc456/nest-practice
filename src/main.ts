import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { MyLogger } from './modules/logger/custom-logger';
import { config } from './config/app-config';
// import { ValidationPipe } from './pipes/validation.pipe';

async function bootstrap() {
  const port = config().port;
  const app = await NestFactory.create(AppModule);
  app.useLogger(app.get(MyLogger));
  app.enableCors({ origin: true });
  app.use(cookieParser());
  // app.setGlobalPrefix('api/v1'),
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transform the JSON into a class instance
      whitelist: true, // Pass only those stated in Dto to handler
      forbidNonWhitelisted: true, // Throw error when user enter additional key
      forbidUnknownValues: true,
    }),
  );
  await app.listen(port);
}
bootstrap();
