import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  amount: number;

  @IsString()
  category: string;

  @IsString()
  date: string;

  @IsString()
  type: string;

  @IsOptional()
  userId: string;

  @IsOptional()
  month: string;

  @IsOptional()
  day: string;

  @IsOptional()
  comment: string;
}
