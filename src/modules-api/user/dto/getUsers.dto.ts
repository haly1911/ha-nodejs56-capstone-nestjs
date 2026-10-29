import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetUsersDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  keyword?: string;

  @IsOptional()
  @IsIn(['SuperAdmin', 'Admin', 'User'])
  role?: 'SuperAdmin' | 'Admin' | 'User';

  @IsOptional()
  @IsIn(['Active', 'Suspended', 'Banned'])
  accountStatus?: 'Active' | 'Suspended' | 'Banned';
}
