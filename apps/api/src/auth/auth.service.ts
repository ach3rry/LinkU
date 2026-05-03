import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { createHash } from "node:crypto";
import { UsersService } from "../users/users.service";
import { MockLoginInput } from "./dto/mock-login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async mockLogin(input: MockLoginInput) {
    this.assertDatabaseConfigured();

    const email = input.email?.toLowerCase() ?? this.createMockEmail(input.nickname, input.school);
    const role = input.role === "admin" ? UserRole.ADMIN : UserRole.USER;

    const user = await this.usersService.upsertMockUser({
      email,
      nickname: input.nickname,
      school: input.school,
      city: input.city ?? "上海",
      role,
    });

    const token = await this.jwtService.signAsync(
      {
        sub: user.id,
        role: user.role,
        nickname: user.nickname,
        email: user.email,
      },
      {
        secret: this.getJwtSecret(),
        expiresIn: "7d",
      },
    );

    return {
      token,
      user,
    };
  }

  me(userId: string) {
    return this.usersService.findPublicById(userId);
  }

  private createMockEmail(nickname: string, school: string) {
    const hash = createHash("sha1").update(`${nickname}:${school}`).digest("hex").slice(0, 12);
    return `mock-${hash}@linku.local`;
  }

  private getJwtSecret() {
    return this.configService.get<string>("JWT_SECRET") ?? "linku-dev-secret-change-me";
  }

  private assertDatabaseConfigured() {
    if (!this.configService.get<string>("DATABASE_URL")) {
      throw new ServiceUnavailableException(
        "本地数据库尚未配置。请设置 DATABASE_URL，并运行 pnpm db:push && pnpm db:seed 后再测试登录和建卡。",
      );
    }
  }
}
