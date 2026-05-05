import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductCategory } from '@prisma/client';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly prisma: PrismaService) {}

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
    @Body() body: { category: ProductCategory; title: string; image: string; slug: string }
  ) {
    const maxPosition = await this.prisma.navigationSubcategory.aggregate({
      where: { category: body.category },
      _max: { position: true }
    });

    return this.prisma.navigationSubcategory.create({
      data: {
        category: body.category,
        slug: body.slug,
        title: body.title,
        image: body.image,
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
