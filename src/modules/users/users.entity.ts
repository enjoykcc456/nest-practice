import { Exclude } from 'class-transformer';
import { Entity, Column, OneToMany } from 'typeorm';

import { Model } from '../../common/model.entity';
import { FileEntity } from '../file/file.entity';
import { FolderEntity } from '../folder/folder.entity';
import { Role } from '../../decorators/auth.decorator';

@Entity('users')
export class UserEntity extends Model {
  @Column({ unique: true, nullable: false })
  username: string;

  @Exclude()
  @Column({ nullable: false })
  password: string;

  @Column({ type: 'enum', enum: Object.values(Role), default: 'user' })
  role: Role;

  @Exclude()
  @Column({ nullable: true, default: null })
  refreshToken: string;

  @OneToMany(() => FileEntity, (file) => file.creator, { cascade: true })
  files: FileEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.creator, { cascade: true })
  folders: FolderEntity[];
}

/* eslint-disable @typescript-eslint/no-empty-function */
export class UsersRepositoryFake {
  public create(): void {}
  public async save(): Promise<void> {}
  public async remove(): Promise<void> {}
  public async findOne(): Promise<void> {}
}
