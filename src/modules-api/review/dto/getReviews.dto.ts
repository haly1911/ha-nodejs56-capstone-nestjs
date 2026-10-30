import { IsInt, IsNotEmpty, Min } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';
import { Type } from 'class-transformer';

export class GetReviewsDto extends PaginationDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gig_id: number;
}
