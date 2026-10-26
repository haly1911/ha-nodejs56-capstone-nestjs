import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../modules-system/prisma/prisma.service';
import { TokenService } from '../../modules-system/token/token.service';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class ProtectGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private tokenService: TokenService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true; // 💡 See this condition

    const req = context.switchToHttp().getRequest();
    const { accessToken } = req.cookies;
    if (!accessToken) {
      throw new UnauthorizedException('AccessToken is not available');
    }

    const decode = this.tokenService.verifyAccessToken(accessToken);
    const userExist = await this.prisma.users.findUnique({
      where: { id: decode.userId },
    });
    if (
      !userExist ||
      userExist.is_deleted ||
      userExist.account_status !== 'Active'
    ) {
      throw new UnauthorizedException('Invalid token');
    }

    //xử lý phân quyền role nếu có (db) -> phát triển thêm

    req.user = userExist;

    return true;
  }
}
