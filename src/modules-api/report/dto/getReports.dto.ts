import { IsIn, IsOptional } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetReportsDto extends PaginationDto {
  @IsOptional()
  @IsIn(['Pending', 'Reviewing', 'Resolved', 'Rejected'])
  status?: 'Pending' | 'Reviewing' | 'Resolved' | 'Rejected';

  @IsOptional()
  @IsIn(['gig', 'review', 'user'])
  target_type?: 'gig' | 'review' | 'user';

  @IsOptional()
  @IsIn(['Spam', 'Inappropriate', 'Scam', 'Fake', 'Copyright', 'Other'])
  reason?: 'Spam' | 'Inappropriate' | 'Scam' | 'Fake' | 'Copyright' | 'Other';
}
