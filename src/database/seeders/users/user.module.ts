import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSeederService } from './user.service';
import { User } from 'src/api/users/entities/user.entity';
import { Task } from 'src/api/tasks/entities/task.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User, Task])],
  providers: [UserSeederService],
  exports: [UserSeederService],
})
export class UserSeederModule {}
