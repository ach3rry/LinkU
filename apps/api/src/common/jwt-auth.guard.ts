import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { AuthService } from "../auth/auth.service";

type JwtPayload = {
  id: string;
  role: UserRole;
  nickname: string;
  email?: string | null;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      user?: JwtPayload & { id: string };
    }>();

    const token = this.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException("缺少登录凭证");
    }

    request.user = await this.authService.authenticateBearerToken(token);
    return true;
  }

  private extractBearerToken(authorization?: string) {
    const [type, token] = authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : undefined;
  }

}
