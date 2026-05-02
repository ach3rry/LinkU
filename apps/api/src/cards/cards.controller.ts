import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CardCreateInput, cardCreateSchema } from "./cards.dto";
import { CardsService } from "./cards.service";

@Controller("cards")
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get("me")
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.cardsService.listMine(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(cardCreateSchema)) body: CardCreateInput,
  ) {
    return this.cardsService.create(user.id, body);
  }
}

