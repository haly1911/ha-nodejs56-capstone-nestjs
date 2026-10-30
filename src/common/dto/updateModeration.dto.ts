import { IsIn } from 'class-validator';

export class UpdateModerationDto {
  @IsIn(['Active', 'UnderReview', 'Hidden'])
  moderation_status: 'Active' | 'UnderReview' | 'Hidden';
}
