import { Module } from '@nestjs/common';
import { FolderService } from './folder.service';
import { FolderController } from './folder.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderEntity } from './folder.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity]), UsersModule],
  providers: [FolderService],
  controllers: [FolderController],
})
export class FolderModule {}
