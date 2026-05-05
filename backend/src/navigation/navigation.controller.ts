import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('navigation')
export class NavigationController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('menu')
  menu() {
    return this.prisma.menuItem.findMany({ where: { active: true }, orderBy: { position: 'asc' } });
  }
}
