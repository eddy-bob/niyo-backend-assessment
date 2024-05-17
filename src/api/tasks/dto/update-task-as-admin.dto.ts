import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { Status } from 'src/types/task';

export class UpdateTaskAsAdminDto extends PartialType(CreateTaskDto) {
  @IsString()
  @IsOptional()
  comment: string;
}
