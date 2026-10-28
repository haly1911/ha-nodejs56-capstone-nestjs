import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoryGroupDto } from './createSubcategoryGroup.dto';

export class UpdateSubcategoryGroupDto extends PartialType(CreateSubcategoryGroupDto) {}
