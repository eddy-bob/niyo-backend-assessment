import {
  Controller,
  Post,
  HttpCode,
  Get,
  Patch,
  Param,
  HttpStatus,
  ParseUUIDPipe,
  Query,
  Delete,
  Put,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';

import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskAsAdminDto } from './dto/update-task-as-admin.dto';
import { Role } from 'src/types/user';
import { Roles } from 'src/decorators/roles.decorator';
import { CurrentUser } from 'src/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { Status } from 'src/types/task';
import { ConfigService } from '@nestjs/config';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly configService: ConfigService,
  ) {}

  @Roles(Role.ADMIN)
  @Post('create-task')
  @HttpCode(HttpStatus.CREATED)
  createTask(payload: CreateTaskDto) {
    return this.taskService.createTask(payload);
  }

  @Roles(Role.ADMIN)
  @Patch('assign-task/:id')
  @HttpCode(HttpStatus.OK)
  assignTask(
    payload: UpdateTaskAsAdminDto,
    @Param('id', ParseUUIDPipe) userId: string,
  ) {
    return this.taskService.assignTask(payload.user, userId);
  }

  @Roles(Role.ADMIN)
  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  updateTask(
    payload: UpdateTaskAsAdminDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taskService.updateTask(id, payload);
  }

  @Patch('status/:id')
  @HttpCode(HttpStatus.OK)
  updateTaskStatus(
    payload: UpdateTaskDto,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.taskService.updateTaskStatus(id, payload);
  }

  @Roles(Role.ADMIN)
  @Delete('/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  removeTask(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.removeTask(id);
  }

  @Get('')
  @HttpCode(HttpStatus.FOUND)
  findAll(
    @Query('status') status: Status,
    @Query('user', ParseUUIDPipe) user: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
  ) {
    return this.taskService.findAll(
      { status, user },
      {
        page,
        limit,
        route: `${this.configService.get<string>('appUrl')}/tasks/me`,
      },
    );
  }

  @Get('me')
  @HttpCode(HttpStatus.FOUND)
  fetchMyTasks(
    @Query('status') status: Status,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit = 10,
    @CurrentUser() user: User,
  ) {
    return this.taskService.fetchMyTasks(user, status, {
      page,
      limit,
      route: `${this.configService.get<string>('appUrl')}/tasks/me`,
    });
  }

  @Get('/:id')
  @HttpCode(HttpStatus.FOUND)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.taskService.findOne(id);
  }
}
