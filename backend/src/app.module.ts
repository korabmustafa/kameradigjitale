import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './common/auth.controller';
import { HealthController } from './common/health.controller';
import { NavigationModule } from './navigation/navigation.module';
import { PrismaModule } from './prisma/prisma.module';
import { OrdersModule } from './orders/orders.module';
import { ProductsModule } from './products/products.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ProductsModule,
    NavigationModule,
    OrdersModule,
    UsersModule
  ],
  controllers: [HealthController, AuthController]
})
export class AppModule {}
