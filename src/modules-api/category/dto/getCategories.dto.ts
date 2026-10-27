import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetCategoriesDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  keyword?: string;
}
