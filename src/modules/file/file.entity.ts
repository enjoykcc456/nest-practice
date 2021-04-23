import { Entity, Column, ManyToOne } from 'typeorm';

import { Model } from '../../common/model.entity';
import { FolderEntity } from '../folder/folder.entity';
import { UserEntity } from '../users/users.entity';

export enum Status {
  PENDING = 'pending',
  VERIFIED = 'verified',
  HOLDING = 'holding',
  VIRUS = 'virus',
}

@Entity('files')
export class FileEntity extends Model {
  @Column()
  name: string;

  @ManyToOne(() => UserEntity, (user) => user.files, { onDelete: 'CASCADE' })
  creator: UserEntity;

  @ManyToOne(() => FolderEntity, (folder) => folder.files, {
    onDelete: 'CASCADE',
  })
  parent: FolderEntity;

  @Column({ nullable: true, default: false })
  certified: boolean;

  @Column({ type: 'enum', enum: Object.values(Status), default: 'pending' })
  status: Status;

  @Column({ nullable: true }) // nullable for testing
  datakey: string;

  @Column()
  filepath: string;

  @Column({ type: 'json' })
  metadata: any;
}
