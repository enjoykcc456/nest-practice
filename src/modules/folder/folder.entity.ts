import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';

import { Model } from '../../common/model.entity';
import { FileEntity } from '../file/file.entity';
import { UserEntity } from '../users/users.entity';

@Entity('folders')
export class FolderEntity extends Model {
  @Column()
  name: string;

  @ManyToOne(() => UserEntity, (user) => user.files, { onDelete: 'CASCADE' })
  creator: UserEntity;

  @ManyToOne(() => FolderEntity, { onDelete: 'CASCADE' })
  parent: FolderEntity;

  @OneToMany(() => FileEntity, (file) => file.parent, { cascade: true })
  files: FileEntity[];
}
