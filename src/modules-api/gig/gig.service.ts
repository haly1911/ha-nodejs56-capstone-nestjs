import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../modules-system/prisma/prisma.service';
import { GetGigsDto } from './dto/getGigs.dto';
import { Prisma } from '../../modules-system/prisma/generated/prisma/client';
import {
  buildMeta,
  buildPagination,
} from '../../common/helpers/pagination.helper';

@Injectable()
export class GigService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: GetGigsDto) {
    const {
      page,
      pageSize,
      keyword,
      categoryId,
      subcategoryId,
      minPrice,
      maxPrice,
      sortBy,
      order,
    } = query;
    const where: Prisma.gigsWhereInput = {
      is_deleted: false,
      moderation_status: 'Active',
      title: keyword ? { contains: keyword } : undefined,
      subcategory_id: subcategoryId,
      price: { gte: minPrice, lte: maxPrice },
      subcategories: categoryId
        ? { subcategory_groups: { category_id: categoryId } }
        : undefined,
      users_gigs_seller_idTousers: {
        is_deleted: false,
        account_status: 'Active',
      },
    };

    const { skip, take } = buildPagination(page, pageSize);

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.gigs.findMany({
        where,
        skip,
        take,
        orderBy: [{ [sortBy]: order }, { id: 'asc' }],
        select: {
          id: true,
          title: true,
          price: true,
          rating: true,
          review: true,
          image: true,
          short_description: true,
          users_gigs_seller_idTousers: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      this.prisma.gigs.count({ where }),
    ]);

    const items = rows.map(
      ({ users_gigs_seller_idTousers: seller, ...gig }) => ({
        ...gig,
        seller,
      }),
    );

    return { items, meta: buildMeta(total, page, pageSize) };
  }

  async findOne(id: number) {
    const gig = await this.prisma.gigs.findFirst({
      where: {
        id,
        is_deleted: false,
        moderation_status: 'Active',
        users_gigs_seller_idTousers: {
          is_deleted: false,
          account_status: 'Active',
        },
      },
      select: {
        id: true,
        title: true,
        price: true,
        rating: true,
        review: true,
        image: true,
        description: true,
        short_description: true,
        users_gigs_seller_idTousers: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });
    if (!gig) throw new NotFoundException('Gig not found');

    const { users_gigs_seller_idTousers: seller, ...rest } = gig;
    return { ...rest, seller };
  }
}
