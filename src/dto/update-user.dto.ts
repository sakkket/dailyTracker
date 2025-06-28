// src/users/dto/create-user.dto.ts
import { IsOptional, IsString, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  phone: number;

  @IsOptional()
  email: string;

  @IsOptional()
  password: string;

  @IsOptional()
  newPassword: string;

  @IsOptional()
  confirmPassword: string;

  @IsOptional()
  gender: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
