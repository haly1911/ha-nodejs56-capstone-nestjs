import { PartialType } from '@nestjs/swagger';
import { CreateGigDto } from './createGig.dto';

export class UpdateGigDto extends PartialType(CreateGigDto) {}
