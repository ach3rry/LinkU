import { Module } from "@nestjs/common";
import { SafetyModule } from "../safety/safety.module";
import { ContactRequestsController } from "./contact-requests.controller";
import { ContactRequestsService } from "./contact-requests.service";

@Module({
  imports: [SafetyModule],
  controllers: [ContactRequestsController],
  providers: [ContactRequestsService],
  exports: [ContactRequestsService],
})
export class ContactRequestsModule {}
