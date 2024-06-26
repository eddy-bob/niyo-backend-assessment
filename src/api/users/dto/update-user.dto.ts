import {
  IsBoolean,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

import { PartialType } from '@nestjs/mapped-types';

import { CreateUserDto } from './create-user.dto';
export class UpdateUserDto extends PartialType(CreateUserDto) {}
