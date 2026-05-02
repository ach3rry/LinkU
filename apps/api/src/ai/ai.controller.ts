import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AiService } from "./ai.service";
import {
  GenerateCardInput,
  IcebreakerInput,
  MatchReasonInput,
  ModerationInput,
  ParseDemandInput,
  generateCardInputSchema,
  icebreakerInputSchema,
  matchReasonInputSchema,
  moderationInputSchema,
  parseDemandInputSchema,
} from "./dto/ai.dto";

@Controller("ai")
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post("parse-demand")
  parseDemand(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(parseDemandInputSchema)) body: ParseDemandInput,
  ) {
    return this.aiService.parseDemand(user.id, body);
  }

  @Post("generate-card")
  generateCard(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(generateCardInputSchema)) body: GenerateCardInput,
  ) {
    return this.aiService.generateCard(user.id, body);
  }

  @Post("match-reason")
  matchReason(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(matchReasonInputSchema)) body: MatchReasonInput,
  ) {
    return this.aiService.matchReason(user.id, body);
  }

  @Post("icebreakers")
  icebreakers(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(icebreakerInputSchema)) body: IcebreakerInput,
  ) {
    return this.aiService.icebreakers(user.id, body);
  }

  @Post("moderate")
  moderate(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(moderationInputSchema)) body: ModerationInput,
  ) {
    return this.aiService.moderate(user.id, body);
  }
}
