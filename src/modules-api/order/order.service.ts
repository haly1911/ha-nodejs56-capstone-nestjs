import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../modules-system/prisma/prisma.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { Prisma } from '../../modules-system/prisma/generated/prisma/client';
import { GetOrdersDto } from './dto/getOrders.dto';
import {
  buildMeta,
  buildPagination,
} from '../../common/helpers/pagination.helper';
import { UpdateOrderStatusDto } from './dto/updateOrderStatus.dto';

type OrderRole = 'buyer' | 'seller';

const TRANSITIONS: Record<string, Record<string, OrderRole[]>> = {
  Pending: { InProgress: ['seller'], Cancelled: ['buyer', 'seller'] },
  InProgress: { Completed: ['buyer'], Cancelled: ['seller'] },
};

const ORDER_SELECT = {
  id: true,
  price: true,
  status: true,
  ordered_at: true,
  gigs: {
    select: {
      id: true,
      title: true,
      image: true,
      users_gigs_seller_idTousers: {
        select: { id: true, name: true, avatar: true },
      },
    },
  },
  users_orders_buyer_idTousers: {
    select: { id: true, name: true, avatar: true },
  },
} satisfies Prisma.ordersSelect;

@Injectable()
export class OrderService {
  constructor(private prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto, userId: number) {
    const gig = await this.prisma.gigs.findFirst({
      where: {
        id: dto.gig_id,
        is_deleted: false,
        moderation_status: 'Active',
        users_gigs_seller_idTousers: {
          account_status: 'Active',
          is_deleted: false,
        },
      },
    });
    if (!gig) throw new NotFoundException('Gig not found');
    if (gig.seller_id === userId)
      throw new ForbiddenException('You can not order your own gigs');

    const processingOrders = await this.prisma.orders.count({
      where: {
        gig_id: dto.gig_id,
        buyer_id: userId,
        is_deleted: false,
        status: { in: ['Pending', 'InProgress'] },
      },
    });
    if (processingOrders > 0)
      throw new ConflictException(
        'You still have processing orders of this gig',
      );

    const newOrder = await this.prisma.orders.create({
      data: { ...dto, buyer_id: userId, price: gig.price },
      select: ORDER_SELECT,
    });

    return newOrder;
  }

  async findMyOrders(query: GetOrdersDto, userId: number) {
    const { page, pageSize } = query;
    const where: Prisma.ordersWhereInput = {
      is_deleted: false,
      buyer_id: userId,
      status: query.status,
    };

    const { skip, take } = buildPagination(page, pageSize);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        where,
        skip,
        take,
        orderBy: [{ ordered_at: 'desc' }, { id: 'desc' }],
        select: ORDER_SELECT,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { items, meta: buildMeta(total, page, pageSize) };
  }

  async findMySales(query: GetOrdersDto, userId: number) {
    const { page, pageSize } = query;
    const where: Prisma.ordersWhereInput = {
      is_deleted: false,
      gigs: { seller_id: userId },
      status: query.status,
    };

    const { skip, take } = buildPagination(page, pageSize);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        where,
        skip,
        take,
        orderBy: [{ ordered_at: 'desc' }, { id: 'desc' }],
        select: ORDER_SELECT,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { items, meta: buildMeta(total, page, pageSize) };
  }

  async findAll(query: GetOrdersDto) {
    const { page, pageSize } = query;
    const where = {
      is_deleted: false,
      status: query.status,
    };

    const { skip, take } = buildPagination(page, pageSize);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.orders.findMany({
        where,
        skip,
        take,
        orderBy: [{ ordered_at: 'desc' }, { id: 'desc' }],
        select: ORDER_SELECT,
      }),
      this.prisma.orders.count({ where }),
    ]);

    return { items, meta: buildMeta(total, page, pageSize) };
  }

  async findOne(id: number, user: { id: number; role: string }) {
    const order = await this.prisma.orders.findFirst({
      where: { id, is_deleted: false },
      select: ORDER_SELECT,
    });
    if (!order) throw new NotFoundException('Order not found');

    const isBuyer = order.users_orders_buyer_idTousers.id === user.id;
    const isSeller = order.gigs.users_gigs_seller_idTousers.id === user.id;
    const isAdmin = ['Admin', 'SuperAdmin'].includes(user.role);
    if (!isBuyer && !isSeller && !isAdmin) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(
    id: number,
    dto: UpdateOrderStatusDto,
    user: { id: number; role: string },
  ) {
    const order = await this.prisma.orders.findFirst({
      where: { id, is_deleted: false },
      select: {
        id: true,
        status: true,
        buyer_id: true,
        gigs: { select: { seller_id: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');

    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.gigs.seller_id === user.id;
    if (!isBuyer && !isSeller) throw new NotFoundException('Order not found');

    const role: OrderRole = isBuyer ? 'buyer' : 'seller';

    const allowedRoles = TRANSITIONS[order.status]?.[dto.status];
    if (!allowedRoles) {
      throw new ConflictException(
        `Cannot change order from ${order.status} to ${dto.status}`,
      );
    }

    if (!allowedRoles.includes(role)) {
      throw new ForbiddenException('You are not allowed to make this change');
    }

    const result = await this.prisma.orders.updateMany({
      where: { id, status: order.status },
      data: { status: dto.status },
    });
    if (result.count === 0) {
      throw new ConflictException('Order status has changed, please reload');
    }

    return true;
  }
}
