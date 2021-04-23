import {
  CacheModule,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatsController } from './modules/cats/cats.controller';
import { CatsModule } from './modules/cats/cats.module';
import { LoggerMiddleware, logger } from './middlewares/logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { database } from './config/database.config';
import { FileModule } from './modules/file/file.module';
import { FolderModule } from './modules/folder/folder.module';
import { LoggerModule } from './modules/logger/logger.module';
import { config } from './config/app-config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [config],
    }),
    CatsModule,
    AuthModule,
    UsersModule,
    database,
    FileModule,
    FolderModule,
    LoggerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(logger).forRoutes(CatsController);
  }
}
