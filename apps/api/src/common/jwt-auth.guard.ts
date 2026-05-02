import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";

type JwtPayload = {
  sub: string;
  role: UserRole;
  nickname: string;
  email?: string | null;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtPayload & { id: string };
    }>();

    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("缺少登录凭证");
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.getJwtSecret(),
      });

      request.user = {
        ...payload,
        id: payload.sub,
      };

      return true;
    } catch {
      throw new UnauthorizedException("登录凭证已失效，请重新登录");
    }
  }

  private extractBearerToken(authorization?: string) {
    const [type, token] = authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

  private getJwtSecret() {
    return this.configService.get<string>("JWT_SECRET") ?? "linku-dev-secret-change-me";
  }
}
