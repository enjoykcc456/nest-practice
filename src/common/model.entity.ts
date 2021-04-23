import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuid } from 'uuid';

export abstract class Model {
  @PrimaryGeneratedColumn()
  id: number;

  // @Column({ type: 'uuid' })
  // uuid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // @BeforeInsert()
  // createUuid() {
  //   this.uuid = uuid();
  // }
}
