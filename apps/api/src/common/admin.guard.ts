import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { UserRole } from "@prisma/client";
import { CurrentUserPayload } from "./current-user.decorator";

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: CurrentUserPayload }>();

    if (request.user?.role !== UserRole.ADMIN) {
      throw new ForbiddenException("需要管理员权限");
    }

    return true;
  }
}
