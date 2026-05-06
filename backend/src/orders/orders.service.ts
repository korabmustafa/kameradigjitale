import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { EmailService } from './email.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService
  ) {}

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
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          orderNumber,
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

    void this.sendConfirmationEmail(order);

    return order;
  }

  list() {
    return this.prisma.order.findMany({ include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } });
  }

  async lookup(orderNumber: string, email: string) {
    const order = await this.prisma.order.findFirst({
      where: { orderNumber: orderNumber.trim().toUpperCase(), email: { equals: email.trim(), mode: 'insensitive' } },
      include: { items: { include: { product: true } } }
    });

    if (!order) {
      throw new NotFoundException('No order was found for that order number and email address.');
    }

    return order;
  }

  updateStatus(id: string, status: OrderStatus) {
    return this.prisma.order.update({ where: { id }, data: { status }, include: { items: { include: { product: true } } } });
  }

  private async generateOrderNumber() {
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const candidate = `KD-${today}-${randomBytes(3).toString('hex').toUpperCase()}`;
      const existing = await this.prisma.order.findUnique({ where: { orderNumber: candidate }, select: { id: true } });
      if (!existing) return candidate;
    }

    throw new BadRequestException('Could not generate a unique order number. Please try again.');
  }

  private async sendConfirmationEmail(order: { orderNumber: string; customerName: string; email: string; total: Prisma.Decimal; status: OrderStatus }) {
    try {
      await this.emailService.sendOrderConfirmation(order);
    } catch (error) {
      this.logger.error(`Order ${order.orderNumber} was created but confirmation email failed.`, error instanceof Error ? error.stack : undefined);
    }
  }
}
