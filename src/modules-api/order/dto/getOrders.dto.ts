import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetOrdersDto extends PaginationDto {
  @IsOptional()
  @IsIn(['Pending', 'InProgress', 'Cancelled', 'Completed'])
  status?: 'Pending' | 'InProgress' | 'Cancelled' | 'Completed';
}
