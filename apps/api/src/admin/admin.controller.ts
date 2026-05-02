import { Body, Controller, Get, Param, Patch, Query, UseGuards } from "@nestjs/common";
import { ReportStatus } from "@prisma/client";
import { AdminGuard } from "../common/admin.guard";
import { CurrentUser, CurrentUserPayload } from "../common/current-user.decorator";
import { JwtAuthGuard } from "../common/jwt-auth.guard";
import { ZodValidationPipe } from "../common/zod-validation.pipe";
import { AdminService } from "./admin.service";
import {
  ReviewCardInput,
  ReviewReportInput,
  UpdateUserStatusInput,
  reviewCardSchema,
  reviewReportSchema,
  updateUserStatusSchema,
} from "./admin.dto";

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("reports")
  listReports(@Query("status") status?: ReportStatus) {
    return this.adminService.listReports(status);
  }

  @Patch("reports/:id")
  reviewReport(
    @CurrentUser() admin: CurrentUserPayload,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reviewReportSchema)) body: ReviewReportInput,
  ) {
    return this.adminService.reviewReport(admin.id, id, body);
  }

  @Get("cards/pending")
  listPendingCards() {
    return this.adminService.listPendingCards();
  }

  @Patch("cards/:id/review")
  reviewCard(
    @CurrentUser() admin: CurrentUserPayload,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(reviewCardSchema)) body: ReviewCardInput,
  ) {
    return this.adminService.reviewCard(admin.id, id, body);
  }

  @Patch("users/:id/status")
  updateUserStatus(
    @CurrentUser() admin: CurrentUserPayload,
    @Param("id") id: string,
    @Body(new ZodValidationPipe(updateUserStatusSchema)) body: UpdateUserStatusInput,
  ) {
    return this.adminService.updateUserStatus(admin.id, id, body);
  }

  @Get("moderation-results")
  listModerationResults() {
    return this.adminService.listModerationResults();
  }
}
