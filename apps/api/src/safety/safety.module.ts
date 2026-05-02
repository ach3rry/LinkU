import { Global, Module } from "@nestjs/common";
import { SafetyService } from "./safety.service";

@Global()
@Module({
  providers: [SafetyService],
  exports: [SafetyService],
})
export class SafetyModule {}
