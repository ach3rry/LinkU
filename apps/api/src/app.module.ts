import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import { CardsModule } from "./cards/cards.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ProfilesModule } from "./profiles/profiles.module";
import { UsersModule } from "./users/users.module";
import { ZonesModule } from "./zones/zones.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    ZonesModule,
    CardsModule
  ],
  controllers: [AppController]
})
export class AppModule {}

