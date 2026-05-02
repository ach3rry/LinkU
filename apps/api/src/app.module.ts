import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CardsModule } from "./cards/cards.module";
import { ContactRequestsModule } from "./contact-requests/contact-requests.module";
import { MatchesModule } from "./matches/matches.module";
import { MatchingModule } from "./matching/matching.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { SwipesModule } from "./swipes/swipes.module";
import { UsersModule } from "./users/users.module";
import { ZonesModule } from "./zones/zones.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    ZonesModule,
    CardsModule,
    MatchingModule,
    RecommendationsModule,
    SwipesModule,
    MatchesModule,
    ContactRequestsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
