import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { FileEntity } from 'src/modules/file/file.entity';
import { FolderEntity } from 'src/modules/folder/folder.entity';
import { UserEntity } from 'src/modules/users/users.entity';

interface DatabaseConfig {
  host: string;
  database: string;
  username: string;
  password: string;
  port: number;
}

export const database = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const dbConfig = configService.get<DatabaseConfig>('db');
    return {
      type: 'mysql',
      host: dbConfig?.host,
      port: dbConfig?.port,
      username: dbConfig?.username,
      password: dbConfig?.password,
      database: dbConfig?.database,
      entities: [UserEntity, FileEntity, FolderEntity],
      synchronize: true,
    };
  },
});
