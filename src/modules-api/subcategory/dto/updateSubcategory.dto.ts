import { PartialType } from '@nestjs/mapped-types';
import { CreateSubcategoryDto } from './createSubcategory.dto';

export class UpdateSubcategoryDto extends PartialType(CreateSubcategoryDto) {}
