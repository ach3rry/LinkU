import { Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";

@Controller("payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  @Post("mock-checkout")
  mockCheckout(@CurrentUser() user: CurrentUserPayload) {
    return {
      userId: user.id,
      status: "mock_only",
      message: "MVP 阶段不接真实支付，这里只保留未来支付接口占位。",
      checkoutUrl: null,
    };
  }
}
