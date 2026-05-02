import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CreateSwipeInput, createSwipeSchema } from "./swipes.dto";
import { SwipesService } from "./swipes.service";

@Controller("swipes")
@UseGuards(JwtAuthGuard)
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createSwipeSchema)) body: CreateSwipeInput,
  ) {
    return this.swipesService.swipe(user.id, body);
  }
}
