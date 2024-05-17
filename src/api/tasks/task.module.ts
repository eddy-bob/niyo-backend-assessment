import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AppGateway } from 'src/app.gateway';
import { APP_GATEWAY } from 'src/constant';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'src/config/configuration';

@Module({
  imports: [UsersModule, TypeOrmModule.forFeature([Task])],
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  exports: [TaskService],
})
export class TaskModule {}
