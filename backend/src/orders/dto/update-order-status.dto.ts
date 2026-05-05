import { IsIn } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsIn(['NEW', 'PAID', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status!: 'NEW' | 'PAID' | 'PACKED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}
