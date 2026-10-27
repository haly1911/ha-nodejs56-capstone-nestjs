import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../modules-system/prisma/prisma.service';
import { CreateCategoryDto } from './dto/createCategory.dto';
import { UpdateCategoryDto } from './dto/updateCategory.dto';
import { GetCategoriesDto } from './dto/getCategories.dto';
import {
  buildMeta,
  buildPagination,
} from '../../common/helpers/pagination.helper';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetCategoriesDto) {
    const { page, pageSize, keyword } = query;
    const where = {
      is_deleted: false,
      ...(keyword && { name: { contains: keyword } }),
    };
    const { skip, take } = buildPagination(page, pageSize);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.categories.findMany({
        where,
        orderBy: { id: 'asc' },
        skip,
        take,
        select: {
          id: true,
          name: true,
          subcategory_groups: {
            where: { is_deleted: false },
            select: {
              id: true,
              name: true,
              subcategories: {
                where: { is_deleted: false },
                select: { id: true, name: true },
              },
            },
          },
        },
      }),
      this.prisma.categories.count({ where }),
    ]);

    return { items, meta: buildMeta(total, page, pageSize) };
  }

  async findOne(id: number) {
    const category = await this.prisma.categories.findFirst({
      where: { id, is_deleted: false },
      select: {
        id: true,
        name: true,
        subcategory_groups: {
          where: { is_deleted: false },
          select: {
            id: true,
            name: true,
            subcategories: {
              where: { is_deleted: false },
              select: { id: true, name: true },
            },
          },
        },
      },
    });
    if (!category) throw new NotFoundException('Category not found');

    return category;
  }

  async createCategory(dto: CreateCategoryDto) {
    const existingCategory = await this.prisma.categories.findFirst({
      where: { name: dto.name, is_deleted: false },
    });
    if (existingCategory) {
      throw new ConflictException('Category name already exists');
    }

    const newCategory = await this.prisma.categories.create({
      data: { name: dto.name },
      select: { id: true, name: true },
    });

    return newCategory;
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const existingCategory = await this.prisma.categories.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    if (dto.name) {
      const duplicate = await this.prisma.categories.findFirst({
        where: { name: dto.name, is_deleted: false, id: { not: id } },
      });
      if (duplicate) {
        throw new ConflictException('Category name already exists');
      }
    }

    const updatedCategory = await this.prisma.categories.update({
      where: { id },
      data: { name: dto.name },
      select: { id: true, name: true },
    });

    return updatedCategory;
  }

  async deleteCategory(id: number, userId: number) {
    const existingCategory = await this.prisma.categories.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existingCategory) {
      throw new NotFoundException('Category not found');
    }

    const children = await this.prisma.subcategory_groups.count({
      where: { category_id: id, is_deleted: false },
    });
    if (children > 0) {
      throw new ConflictException(
        'Category still has active subcategory groups',
      );
    }

    await this.prisma.categories.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date(), deleted_by: userId },
    });

    return true;
  }
}
