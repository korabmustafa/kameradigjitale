import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { EmailService } from './email.service';
import { OrdersService } from './orders.service';

@Module({ controllers: [OrdersController], providers: [OrdersService, EmailService] })
export class OrdersModule {}
