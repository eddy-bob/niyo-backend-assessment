import { IsEnum, IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskAsAdminDto extends PartialType(CreateTaskDto) {
  @IsString()
  @IsOptional()
  comment: string;
}
