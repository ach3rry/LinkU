import { Controller, Get } from "@nestjs/common";
import { PremiumService } from "./premium.service";

@Controller("premium")
export class PremiumController {
  constructor(private readonly premiumService: PremiumService) {}

  @Get("entries")
  entries() {
    return this.premiumService.listEntries();
  }
}
