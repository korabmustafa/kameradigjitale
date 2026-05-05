import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAdminUserDto } from './dto/create-admin-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('admin')
  listAdmin() {
    return this.prisma.adminUser.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('admin')
  createAdmin(@Body() payload: CreateAdminUserDto) {
    return this.prisma.adminUser.create({ data: { ...payload, role: payload.role as UserRole } });
  }

  @Patch('admin/:id/toggle-active')
  async toggleActive(@Param('id') id: string) {
    const user = await this.prisma.adminUser.findUniqueOrThrow({ where: { id } });
    return this.prisma.adminUser.update({ where: { id }, data: { active: !user.active } });
  }

  @Delete('admin/:id')
  removeAdmin(@Param('id') id: string) {
    return this.prisma.adminUser.delete({ where: { id } });
  }
}
