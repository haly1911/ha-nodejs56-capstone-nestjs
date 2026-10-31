import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/createOrder.dto';
import { CurrentUser } from '../../common/decorators/currentUser.decorator';
import { ResponseMessage } from '../../common/decorators/responseMessage.decorator';
import { GetOrdersDto } from './dto/getOrders.dto';
import { Role } from '../../common/decorators/role.decorator';
import { UpdateOrderStatusDto } from './dto/updateOrderStatus.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Order')
@Controller('order')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @ResponseMessage('Create order successfully')
  async createOrder(
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.orderService.createOrder(dto, user.id);
  }

  @Get('my-orders')
  @ResponseMessage('Get my orders successfully')
  async findMyOrders(
    @Query() query: GetOrdersDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.orderService.findMyOrders(query, user.id);
  }

  @Get('my-sales')
  @ResponseMessage('Get my sales successfully')
  async findMySales(
    @Query() query: GetOrdersDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.orderService.findMySales(query, user.id);
  }

  @Get()
  @Role('SuperAdmin', 'Admin')
  @ResponseMessage('Get orders successfully')
  async findAll(@Query() query: GetOrdersDto) {
    return this.orderService.findAll(query);
  }

  @Get(':id')
  @ResponseMessage('Get order by id successfully')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.orderService.findOne(id, user);
  }

  @Patch(':id/status')
  @ResponseMessage('Update order status successfully')
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
    @CurrentUser() user: { id: number; role: string },
  ) {
    return this.orderService.updateOrderStatus(id, dto, user);
  }
}
