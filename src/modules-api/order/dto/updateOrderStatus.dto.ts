import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['InProgress', 'Completed', 'Cancelled'])
  status: 'InProgress' | 'Completed' | 'Cancelled';
}
