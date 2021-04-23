import { Module } from '@nestjs/common';
import { MyLogger } from './custom-logger';

@Module({
  providers: [MyLogger],
  exports: [MyLogger],
})
export class LoggerModule {}
