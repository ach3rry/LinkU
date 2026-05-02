import { Module } from "@nestjs/common";
import { MatchingModule } from "../matching/matching.module";
import { SubscriptionsModule } from "../subscriptions/subscriptions.module";
import { SwipesController } from "./swipes.controller";
import { SwipesService } from "./swipes.service";

@Module({
  imports: [MatchingModule, SubscriptionsModule],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}
