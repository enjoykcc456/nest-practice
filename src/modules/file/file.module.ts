import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { UserEntity } from '../users/users.entity';
import { UsersModule } from '../users/users.module';
import { FileController } from './file.controller';
import { FileEntity } from './file.entity';
import { FileService } from './file.service';
import { FolderModule } from '../folder/folder.module';
import { fileFilter } from './file-upload.utils';

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.register({
      storage: diskStorage({
        destination: './files',
        // filename: editFileName,
      }),
      fileFilter: fileFilter,
    }),
    UsersModule,
  ],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
