import { Body, Controller, Post, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { IsString } from 'class-validator';

class AdminLoginDto {
  @IsString()
  password!: string;
}

@Controller('auth')
export class AuthController {
  @Post('admin-login')
  adminLogin(@Body() payload: AdminLoginDto) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_AUTH_TOKEN;

    if (!adminPassword || !adminToken) {
      throw new ServiceUnavailableException('Admin authentication is not configured');
    }

    if (payload.password !== adminPassword) {
      throw new UnauthorizedException('Invalid admin password');
    }

    return { token: adminToken };
  }
}
