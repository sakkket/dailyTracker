// src/users/dto/create-user.dto.ts
import { IsNumber, IsString } from 'class-validator';

export class ReviewDto {
  @IsNumber()
  rating: number;

  @IsString()
  review: string;
}
