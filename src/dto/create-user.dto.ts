// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  gender: string;

  @IsNumber()
  phone: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
