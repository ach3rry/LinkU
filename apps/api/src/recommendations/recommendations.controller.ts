import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { RecommendationQuery, recommendationQuerySchema } from "./recommendations.dto";
import { RecommendationsService } from "./recommendations.service";

@Controller("recommendations")
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get()
  list(
    @CurrentUser() user: CurrentUserPayload,
    @Query(new ZodValidationPipe(recommendationQuerySchema)) query: RecommendationQuery,
  ) {
    return this.recommendationsService.listForUser(user.id, query);
  }
}
