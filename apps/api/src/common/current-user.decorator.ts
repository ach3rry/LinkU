import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserRole } from "@prisma/client";

export type CurrentUserPayload = {
  id: string;
  role: UserRole;
  nickname: string;
  email?: string | null;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUserPayload => {
    const request = context.switchToHttp().getRequest<{ user: CurrentUserPayload }>();
    return request.user;
  },
);

