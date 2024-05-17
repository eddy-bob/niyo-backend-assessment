import { IsEnum } from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { Status } from 'src/types/task';

export class UpdateTaskDto {
  @IsEnum(Status)
  status: Status;
}
