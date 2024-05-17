import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  description: string;
  
  @IsOptional()
  @IsUUID()
  user: string;
}
