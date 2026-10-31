import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../modules-system/prisma/prisma.service';
import { GetGigsDto } from './dto/getGigs.dto';
import { Prisma } from '../../modules-system/prisma/generated/prisma/client';
import {
  buildMeta,
  buildPagination,
} from '../../common/helpers/pagination.helper';
import { CreateGigDto } from './dto/createGig.dto';
import { UpdateGigDto } from './dto/updateGig.dto';
import { UpdateModerationDto } from '../../common/dto/updateModeration.dto';
import { CloudinaryService } from '../../modules-system/cloudinary/cloudinary.service';

@Injectable()
export class GigService {
  constructor(
    private prisma: PrismaService,
    private cloudinary: CloudinaryService,
  ) {}

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

  async findMyGigs(query: GetGigsDto, userId: number) {
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
      seller_id: userId,
      is_deleted: false,
      title: keyword ? { contains: keyword } : undefined,
      subcategory_id: subcategoryId,
      price: { gte: minPrice, lte: maxPrice },
      subcategories: categoryId
        ? { subcategory_groups: { category_id: categoryId } }
        : undefined,
    };

    const { skip, take } = buildPagination(page, pageSize);

    const [items, total] = await this.prisma.$transaction([
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
          moderation_status: true,
        },
      }),
      this.prisma.gigs.count({ where }),
    ]);

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

  async createGig(dto: CreateGigDto, userId: number) {
    const parent = await this.prisma.subcategories.findFirst({
      where: { id: dto.subcategory_id, is_deleted: false },
    });
    if (!parent) throw new NotFoundException('Subcategory not found');

    const newGig = await this.prisma.gigs.create({
      data: {
        ...dto,
        seller_id: userId,
      },
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        short_description: true,
        subcategory_id: true,
        moderation_status: true,
      },
    });

    return newGig;
  }

  async updateGig(
    id: number,
    dto: UpdateGigDto,
    user: { id: number; role: string },
  ) {
    const existingGig = await this.prisma.gigs.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existingGig) {
      throw new NotFoundException('Gig not found');
    } else if (existingGig.seller_id !== user.id) {
      throw new ForbiddenException('You can only edit your own gigs');
    }

    if (dto.subcategory_id !== undefined) {
      const parent = await this.prisma.subcategories.findFirst({
        where: { id: dto.subcategory_id, is_deleted: false },
      });
      if (!parent) throw new NotFoundException('Subcategory not found');
    }

    const updatedGig = await this.prisma.gigs.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        title: true,
        price: true,
        description: true,
        short_description: true,
        subcategory_id: true,
        moderation_status: true,
      },
    });

    return updatedGig;
  }

  async uploadGigImage(
    id: number,
    userId: number,
    file: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname: string;
    },
  ) {
    const gig = await this.prisma.gigs.findUnique({
      where: { id, is_deleted: false },
    });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.seller_id !== userId)
      throw new ForbiddenException('You can only update your own gigs');

    const uploaded = await this.cloudinary.uploadImage(
      file.buffer,
      'capstone_nodejs',
    );

    try {
      await this.prisma.gigs.update({
        where: { id },
        data: {
          image: uploaded.secure_url,
          image_public_id: uploaded.public_id,
        },
      });
    } catch (error) {
      await this.cloudinary.deleteImage(uploaded.public_id);
      throw error;
    }

    await this.cloudinary.deleteImage(gig?.image_public_id);
    return { image: uploaded.secure_url };
  }

  async updateModerationStatus(id: number, dto: UpdateModerationDto) {
    const existingGig = await this.prisma.gigs.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existingGig) throw new NotFoundException('Gig not found');

    await this.prisma.gigs.update({
      where: { id },
      data: { moderation_status: dto.moderation_status },
    });

    return true;
  }

  async deleteGig(id: number, user: { id: number; role: string }) {
    const existingGig = await this.prisma.gigs.findFirst({
      where: { id, is_deleted: false },
    });
    if (!existingGig) throw new NotFoundException('Gig not found');
    const isOwner = existingGig.seller_id === user.id;
    const isAdmin = ['Admin', 'SuperAdmin'].includes(user.role);
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this gig',
      );
    }

    const activeOrders = await this.prisma.orders.count({
      where: {
        gig_id: id,
        is_deleted: false,
        status: { in: ['Pending', 'InProgress'] },
      },
    });
    if (activeOrders > 0)
      throw new ConflictException('Gig still has active orders');

    await this.prisma.gigs.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date(), deleted_by: user.id },
    });

    return true;
  }
}
