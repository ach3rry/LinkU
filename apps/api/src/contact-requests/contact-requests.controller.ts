import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { CreateContactRequestInput, createContactRequestSchema } from "./contact-requests.dto";
import { ContactRequestsService } from "./contact-requests.service";

@Controller("contact-requests")
@UseGuards(JwtAuthGuard)
export class ContactRequestsController {
  constructor(private readonly contactRequestsService: ContactRequestsService) {}

  @Get()
  listMine(@CurrentUser() user: CurrentUserPayload) {
    return this.contactRequestsService.listForUser(user.id);
  }

  @Post()
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body(new ZodValidationPipe(createContactRequestSchema)) body: CreateContactRequestInput,
  ) {
    return this.contactRequestsService.create(user.id, body);
  }
}
