import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsIn(['gig', 'review', 'user'])
  target_type: 'gig' | 'review' | 'user';

  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  target_id: number;

  @IsNotEmpty()
  @IsIn(['Spam', 'Inappropriate', 'Scam', 'Fake', 'Copyright', 'Other'])
  reason: 'Spam' | 'Inappropriate' | 'Scam' | 'Fake' | 'Copyright' | 'Other';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
