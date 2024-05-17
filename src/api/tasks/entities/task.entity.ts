import * as bcrypt from 'bcryptjs';
import { User } from 'src/api/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Timestamp } from '../../../database/timestamp.entity';
import { Status } from 'src/types/task';

@Entity()
export class Task extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column()
  title: string;

  @Column({ length: 100 })
  description: string;

  @Column({ length: 50, nullable: true })
  comment: string | null;

  @Column({ type: 'enum', enum: Status, default: Status.PENDING })
  status: Status;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user: User;
}
