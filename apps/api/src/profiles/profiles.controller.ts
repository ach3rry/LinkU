import { Body, Controller, Get, Put, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { ProfileUpsertInput, profileUpsertSchema } from "./profiles.dto";
import { ProfilesService } from "./profiles.service";

@Controller("profiles")
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get("me")
  me(@CurrentUser() user: CurrentUserPayload) {
    return this.profilesService.findMine(user.id);
  }

  @Put("me")
  updateMe(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(profileUpsertSchema)) body: ProfileUpsertInput,
  ) {
    return this.profilesService.upsertMine(user.id, body);
  }
}
