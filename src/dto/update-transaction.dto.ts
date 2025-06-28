import { IsOptional, IsString, IsNumber } from 'class-validator';

export default class UpdateTransactionDto {
  @IsNumber()
  @IsOptional()
  amount: number;

  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  date: string;

  @IsOptional()
  @IsString()
  type: string;

  @IsOptional()
  month: string;

  @IsOptional()
  year: string;

  @IsOptional()
  day: string;

  @IsOptional()
  comment: string;

  @IsOptional()
  currencyCode: string;
}
