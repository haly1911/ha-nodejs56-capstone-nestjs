import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class CreateOrderDto {
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  gig_id: number;
}
