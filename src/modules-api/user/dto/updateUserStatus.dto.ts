import { IsIn } from 'class-validator';

export class UpdateUserStatusDto {
  @IsIn(['Active', 'Suspended', 'Banned'])
  account_status: 'Active' | 'Suspended' | 'Banned';
}
