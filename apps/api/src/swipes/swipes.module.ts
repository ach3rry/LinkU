import { Module } from "@nestjs/common";
import { MatchingModule } from "../matching/matching.module";
import { SwipesController } from "./swipes.controller";
import { SwipesService } from "./swipes.service";

@Module({
  imports: [MatchingModule],
  controllers: [SwipesController],
  providers: [SwipesService],
  exports: [SwipesService],
})
export class SwipesModule {}
