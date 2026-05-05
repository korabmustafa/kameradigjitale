import { BadRequestException, Body, ConflictException, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCategory } from '@prisma/client';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly prisma: PrismaService) {}

  private toSlug(value: string) {
    return value
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  @Get('menu')
  menu() {
    return this.prisma.menuItem.findMany({ where: { active: true }, orderBy: { position: 'asc' } });
  }

  @Get('subcategories')
  async subcategories() {
    const items = await this.prisma.navigationSubcategory.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { position: 'asc' }, { createdAt: 'asc' }]
    });

    return items.map((item) => ({
      id: item.id,
      slug: item.slug,
      title: item.title,
      image: item.image,
      category: item.category
    }));
  }

  @Post('subcategories')
  async createSubcategory(
    @Body() body: { category: ProductCategory; title: string; image: string; slug?: string }
  ) {
    const title = body.title?.trim();
    const image = body.image?.trim();

    if (!title || !image) {
      throw new BadRequestException('title and image are required');
    }

    const slug = this.toSlug(body.slug?.trim() || title);
    if (!slug) {
      throw new BadRequestException('invalid subcategory slug');
    }

    const duplicate = await this.prisma.navigationSubcategory.findFirst({
      where: { category: body.category, slug }
    });

    if (duplicate) {
      throw new ConflictException('Subcategory already exists in this category');
    }

    const maxPosition = await this.prisma.navigationSubcategory.aggregate({
      where: { category: body.category },
      _max: { position: true }
    });

    return this.prisma.navigationSubcategory.create({
      data: {
        category: body.category,
        slug,
        title,
        image,
        position: (maxPosition._max.position ?? -1) + 1,
        active: true
      }
    });
  }

  @Delete('subcategories/:id')
  deleteSubcategory(@Param('id') id: string) {
    return this.prisma.navigationSubcategory.delete({ where: { id } });
  }
}
