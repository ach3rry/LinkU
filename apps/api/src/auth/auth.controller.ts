import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AuthService } from "./auth.service";
import { mockLoginSchema, MockLoginInput } from "./dto/mock-login.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("mock-login")
  mockLogin(@Body(new ZodValidationPipe(mockLoginSchema)) body: MockLoginInput) {
    return this.authService.mockLogin(body);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.authService.me(user.id);
  }
}
