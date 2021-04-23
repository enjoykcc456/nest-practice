import {
  IsInt,
  IsString,
  Length,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { FolderEntity } from 'src/modules/folder/folder.entity';

import { Status } from '../file.entity';

export class CreateFileDto {
  @IsOptional()
  @IsInt()
  parent: FolderEntity;

  @IsOptional()
  @IsBoolean()
  certified: boolean;

  @IsOptional()
  @IsString()
  datakey: string;
}

export class UpdateFileDto extends CreateFileDto {
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(Status)
  status: Status;
}
