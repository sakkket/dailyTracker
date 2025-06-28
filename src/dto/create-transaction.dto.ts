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

  @IsString()
  month: string;

  @IsString()
  year: string;

  @IsString()
  day: string;

  @IsOptional()
  comment: string;

  @IsString()
  currencyCode: string;
}
