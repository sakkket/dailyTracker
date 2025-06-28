// src/users/dto/create-user.dto.ts
import {
  IsEmail,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsObject,
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

  @IsString()
  currencyCode: string;

  @IsObject()
  country: any;

  @IsOptional()
  confirmPassword?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
