import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AdminModule } from "./admin/admin.module";
import { AppController } from "./app.controller";
import { AiModule } from "./ai/ai.module";
import { AuthModule } from "./auth/auth.module";
import { BlocksModule } from "./blocks/blocks.module";
import { CardsModule } from "./cards/cards.module";
import { ContactRequestsModule } from "./contact-requests/contact-requests.module";
import { MatchesModule } from "./matches/matches.module";
import { MatchingModule } from "./matching/matching.module";
import { PaymentsModule } from "./payments/payments.module";
import { PremiumModule } from "./premium/premium.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { RecommendationsModule } from "./recommendations/recommendations.module";
import { ReportsModule } from "./reports/reports.module";
import { SafetyModule } from "./safety/safety.module";
import { SubscriptionsModule } from "./subscriptions/subscriptions.module";
import { SwipesModule } from "./swipes/swipes.module";
import { UsersModule } from "./users/users.module";
import { ZonesModule } from "./zones/zones.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    SafetyModule,
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
    AiModule,
    ReportsModule,
    BlocksModule,
    AdminModule,
    SubscriptionsModule,
    PremiumModule,
    PaymentsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
