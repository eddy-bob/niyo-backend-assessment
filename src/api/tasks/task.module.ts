import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AppGateway } from 'src/app.gateway';
import configuration from 'src/config/configuration';
import { JwtModule } from '@nestjs/jwt';
import { APP_GATEWAY } from 'src/constant';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: configuration().jwt.secret,
      signOptions: { expiresIn: configuration().jwt.expiresIn },
    }),
    TypeOrmModule.forFeature([Task]),
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GATEWAY,
      useClass: AppGateway,
    },
  ],
})
export class TaskModule {}
