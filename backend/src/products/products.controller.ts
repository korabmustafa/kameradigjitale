import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';
import { ProductsService } from './products.service';
import { AdminAuthGuard } from '../common/admin-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsDto) {
    return this.productsService.list(query);
  }

  @Get(':productCode')
  byCode(@Param('productCode') productCode: string) {
    return this.productsService.byCode(productCode);
  }

  @Post()
  @UseGuards(AdminAuthGuard)
  create(@Body() payload: CreateProductDto) {
    return this.productsService.create(payload);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
