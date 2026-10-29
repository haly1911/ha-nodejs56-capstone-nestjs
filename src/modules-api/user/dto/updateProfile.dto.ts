import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthday?: Date;

  @IsOptional()
  @IsIn(['Male', 'Female'])
  gender?: 'Male' | 'Female';

  @IsOptional()
  @IsString()
  @MaxLength(255)
  skill?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  certification?: string;
}
