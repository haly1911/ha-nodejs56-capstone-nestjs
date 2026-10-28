import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { Public } from '../../common/decorators/public.decorator';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { Role } from '../../common/decorators/role.decorator';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { GetCategoriesDto } from './dto/getCategories.dto';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @Get()
  @Public()
  @ResponseMessage('Get categories successfully')
  async findAll(@Query() query: GetCategoriesDto) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  @Public()
  @ResponseMessage('Get category by id successfully')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Create category successfully')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.categoryService.createCategory(dto);
  }

  @Patch(':id')
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Update category successfully')
  async updateCategory(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.updateCategory(id, dto);
  }

  @Delete(':id')
  @Role('Admin', 'SuperAdmin')
  @ResponseMessage('Delete category successfully')
  removeCategory(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number },
  ) {
    return this.categoryService.deleteCategory(id, user.id);
  }
}
