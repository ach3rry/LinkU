import { Controller, Get, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { SubscriptionsService } from "./subscriptions.service";

@Controller("subscriptions")
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionsService.getMembership(user.id);
  }

  @Get("usage")
  usage(@CurrentUser() user: CurrentUserPayload) {
    return this.subscriptionsService.getUsage(user.id);
  }
}
