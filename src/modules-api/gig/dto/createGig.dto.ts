import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  title: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  price: number;

  @IsString()
  description: string;

  @IsString()
  @MaxLength(255)
  short_description: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  subcategory_id: number;
}
