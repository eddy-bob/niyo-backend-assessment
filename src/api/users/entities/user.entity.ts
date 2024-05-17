import * as bcrypt from 'bcryptjs';
import { Role } from 'src/types/user';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  OneToOne,
} from 'typeorm';

import { Task } from 'src/api/tasks/entities/task.entity';
import { Timestamp } from '../../../database/timestamp.entity';
import { CapitalizeTransformer } from '../../../utils/transformers/capitalize';

@Entity()
export class User extends Timestamp {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({
    transformer: new CapitalizeTransformer(),
  })
  firstName: string;

  @Column({
    transformer: new CapitalizeTransformer(),
  })
  lastName: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true })
  phoneNumber: string | null;

  @Column({ unique: true })
  username: string;

  @Column({ select: false, type: 'varchar' })
  password: string;

  @OneToMany(() => Task, (task) => task.user)
  tasks: Task[];

  @BeforeInsert()
  @BeforeUpdate()
  private async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = bcrypt.hashSync(this.password, salt);
    }
  }

  public async matchPassword(enteredPassword: string) {
    return await bcrypt.compare(enteredPassword, this.password);
  }
}
