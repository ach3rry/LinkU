import { Module } from "@nestjs/common";
import { AiController } from "./ai.controller";
import { AiService } from "./ai.service";
import { OpenAICompatibleProvider } from "./provider/openai-compatible.provider";

@Module({
  controllers: [AiController],
  providers: [AiService, OpenAICompatibleProvider],
  exports: [AiService],
})
export class AiModule {}
