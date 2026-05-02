import { Body, Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { BlocksService } from "./blocks.service";
import { CreateBlockInput, createBlockSchema } from "./blocks.dto";

@Controller("blocks")
@UseGuards(JwtAuthGuard)
export class BlocksController {
  constructor(private readonly blocksService: BlocksService) {}

  @Get()
  list(@CurrentUser() user: CurrentUserPayload) {
    return this.blocksService.list(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createBlockSchema)) body: CreateBlockInput,
  ) {
    return this.blocksService.create(user.id, body);
  }

  @Delete(":blockedUserId")
  remove(@CurrentUser() user: CurrentUserPayload, @Param("blockedUserId") blockedUserId: string) {
    return this.blocksService.remove(user.id, blockedUserId);
  }
}
