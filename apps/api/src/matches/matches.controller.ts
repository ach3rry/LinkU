import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { MatchesService } from "./matches.service";

@Controller("matches")
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.matchesService.listForUser(user.id);
  }

  @Get(":id")
  detail(@CurrentUser() user: CurrentUserPayload, @Param("id") id: string) {
    return this.matchesService.findForUser(user.id, id);
  }
}
