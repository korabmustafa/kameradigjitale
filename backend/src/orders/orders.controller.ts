import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { LookupOrderDto } from './dto/lookup-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(AdminAuthGuard)
  list() {
    return this.ordersService.list();
  }

  @Post()
  create(@Body() payload: CreateOrderDto) {
    return this.ordersService.create(payload);
  }

  @Post('lookup')
  lookup(@Body() payload: LookupOrderDto) {
    return this.ordersService.lookup(payload.orderNumber, payload.email);
  }

  @Patch(':id/status')
  @UseGuards(AdminAuthGuard)
  updateStatus(@Param('id') id: string, @Body() payload: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, payload.status);
  }
}
