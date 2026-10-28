import { PartialType } from '@nestjs/mapped-types';
import { CreateGigDto } from './createGig.dto';

export class UpdateGigDto extends PartialType(CreateGigDto) {}
