import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class HandleReportDto {
  @IsNotEmpty()
  @IsIn(['Reviewing', 'Resolved', 'Rejected'])
  status: 'Reviewing' | 'Resolved' | 'Rejected';

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  resolution_note?: string;

  @IsOptional()
  @IsIn(['Hide', 'Suspend', 'Ban'])
  action?: 'Hide' | 'Suspend' | 'Ban';
}
