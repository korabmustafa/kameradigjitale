import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductCategory } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsDto } from './dto/list-products.dto';

const categoryMap: Record<string, ProductCategory> = {
  'Film Cameras': ProductCategory.FILM_CAMERAS,
  FILM_CAMERAS: ProductCategory.FILM_CAMERAS,
  'Digital Cameras': ProductCategory.DIGITAL_CAMERAS,
  DIGITAL_CAMERAS: ProductCategory.DIGITAL_CAMERAS,
  Lenses: ProductCategory.LENSES,
  LENSES: ProductCategory.LENSES,
  Film: ProductCategory.FILM,
  FILM: ProductCategory.FILM,
  Accessories: ProductCategory.ACCESSORIES,
  ACCESSORIES: ProductCategory.ACCESSORIES,
  Supplies: ProductCategory.SUPPLIES,
  SUPPLIES: ProductCategory.SUPPLIES
};

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListProductsDto) { /* unchanged */
    const where = {
      ...(query.category ? { category: categoryMap[query.category] } : {}),
      ...(query.q ? { OR: [{ name: { contains: query.q, mode: 'insensitive' as const } }, { description: { contains: query.q, mode: 'insensitive' as const } }, { productCode: { contains: query.q, mode: 'insensitive' as const } }, { subcategory: { contains: query.q, mode: 'insensitive' as const } }] } : {})
    };
    const [total, items] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({ where, include: { gallery: true }, skip: (query.page - 1) * query.limit, take: query.limit, orderBy: { createdAt: 'desc' } })
    ]);
    return { items, meta: { total, page: query.page, limit: query.limit } };
  }

  async byCode(productCode: string) {
    const product = await this.prisma.product.findUnique({ where: { productCode }, include: { gallery: true } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(payload: CreateProductDto) {
    const category = categoryMap[payload.category];
    if (!category) throw new BadRequestException('Invalid product category');

    const { gallery, ...productData } = payload;

    return this.prisma.product.create({
      data: {
        ...productData,
        category,
        gallery: gallery?.length
          ? {
              createMany: {
                data: gallery.map((imageUrl) => ({ imageUrl }))
              }
            }
          : undefined
      },
      include: { gallery: true }
    });
  }

  async remove(id: string) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }
}
