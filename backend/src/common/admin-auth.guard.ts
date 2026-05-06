import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

const getAdminToken = () => process.env.ADMIN_AUTH_TOKEN;

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const expectedToken = getAdminToken();

    if (!expectedToken) {
      throw new UnauthorizedException('Admin authentication is not configured');
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | string[] | undefined> }>();
    const authorization = request.headers.authorization;
    const headerValue = Array.isArray(authorization) ? authorization[0] : authorization;
    const token = headerValue?.startsWith('Bearer ') ? headerValue.slice('Bearer '.length) : undefined;

    if (!token || token !== expectedToken) {
      throw new UnauthorizedException('Admin authentication required');
    }

    return true;
  }
}
