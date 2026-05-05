import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(payload: CreateOrderDto) {
    const productCodes = payload.items.map((item) => item.productCode);
    const products = await this.prisma.product.findMany({ where: { productCode: { in: productCodes } } });
    if (products.length !== productCodes.length) throw new BadRequestException('One or more products were not found.');

    const indexed = new Map(products.map((p) => [p.productCode, p]));

    const itemData = payload.items.map((item) => {
      const product = indexed.get(item.productCode)!;
      if (product.stock < item.quantity) throw new BadRequestException(`Insufficient stock for ${product.name}.`);
      return { product, quantity: item.quantity, lineTotal: Number(product.price) * item.quantity };
    });

    const total = itemData.reduce((sum, row) => sum + row.lineTotal, 0);

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          customerName: payload.customerName,
          email: payload.email,
          phone: payload.phone,
          address: payload.address,
          status: OrderStatus.NEW,
          total: new Prisma.Decimal(total),
          items: {
            create: itemData.map((row) => ({ productId: row.product.id, quantity: row.quantity, unitPrice: row.product.price }))
          }
        },
        include: { items: { include: { product: true } } }
      });

      await Promise.all(itemData.map((row) => tx.product.update({ where: { id: row.product.id }, data: { stock: { decrement: row.quantity } } })));
      return created;
    });

    return order;
  }

  list() {
    return this.prisma.order.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({ where: { id }, data: { status }, include: { items: { include: { product: true } } } });
  }
}
