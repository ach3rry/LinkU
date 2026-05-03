import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserRole } from "@prisma/client";
import { createRemoteJWKSet, jwtVerify, type JWTPayload, type JWTVerifyOptions } from "jose";
import { createHash } from "node:crypto";
import { UsersService } from "../users/users.service";
import { MockLoginInput } from "./dto/mock-login.dto";

type LocalJwtPayload = {
  sub: string;
  role: UserRole;
  nickname: string;
  email?: string | null;
};

type SupabaseMetadata = {
  name?: unknown;
  nickname?: unknown;
  full_name?: unknown;
  linku_role?: unknown;
};

@Injectable()
export class AuthService {
  private supabaseJwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async mockLogin(input: MockLoginInput) {
    this.assertMockLoginAllowed();
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

  async authenticateBearerToken(token: string) {
    if (this.isSupabaseAuthConfigured()) {
      try {
        return await this.authenticateSupabaseToken(token);
      } catch {
        // Keep the local development token path available while the app is migrating.
      }
    }

    try {
      const payload = await this.jwtService.verifyAsync<LocalJwtPayload>(token, {
        secret: this.getJwtSecret(),
      });

      return {
        id: payload.sub,
        role: payload.role,
        nickname: payload.nickname,
        email: payload.email,
      };
    } catch {
      throw new UnauthorizedException("登录已过期，请重新登录");
    }
  }

  private async authenticateSupabaseToken(token: string) {
    this.assertDatabaseConfigured();

    const { payload } = await this.verifySupabaseJwt(token);
    const supabaseUserId = this.readRequiredSubject(payload);
    const email = this.readEmail(payload);
    const role = this.resolveUserRole(email, payload);
    const nickname = this.resolveNickname(email, payload);

    const user = await this.usersService.upsertAuthUser({
      id: supabaseUserId,
      email,
      nickname,
      role,
    });

    return {
      id: user.id,
      role: user.role,
      nickname: user.nickname,
      email: user.email,
    };
  }

  private verifySupabaseJwt(token: string) {
    const options = this.getSupabaseVerifyOptions();
    const legacySecret = this.configService.get<string>("SUPABASE_JWT_SECRET");

    if (legacySecret) {
      return jwtVerify(token, new TextEncoder().encode(legacySecret), options);
    }

    return jwtVerify(token, this.getSupabaseJwks(), options);
  }

  private getSupabaseJwks() {
    const jwksUrl = this.getSupabaseJwksUrl();

    if (!this.supabaseJwks) {
      this.supabaseJwks = createRemoteJWKSet(new URL(jwksUrl));
    }

    return this.supabaseJwks;
  }

  private getSupabaseVerifyOptions(): JWTVerifyOptions {
    const options: JWTVerifyOptions = {};
    const issuer = this.configService.get<string>("SUPABASE_AUTH_ISSUER") ?? this.getDefaultSupabaseIssuer();
    const audience = this.configService.get<string>("SUPABASE_AUTH_AUDIENCE") ?? "authenticated";

    if (issuer) {
      options.issuer = issuer;
    }

    if (audience) {
      options.audience = audience;
    }

    return options;
  }

  private getSupabaseJwksUrl() {
    const explicitUrl = this.configService.get<string>("SUPABASE_JWKS_URL");

    if (explicitUrl) {
      return explicitUrl;
    }

    const supabaseUrl = this.getSupabaseUrl();

    if (!supabaseUrl) {
      throw new UnauthorizedException("登录配置尚未完成");
    }

    return `${supabaseUrl}/auth/v1/.well-known/jwks.json`;
  }

  private getDefaultSupabaseIssuer() {
    const supabaseUrl = this.getSupabaseUrl();
    return supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined;
  }

  private getSupabaseUrl() {
    return this.configService.get<string>("SUPABASE_URL")?.replace(/\/$/, "");
  }

  private readRequiredSubject(payload: JWTPayload) {
    if (!payload.sub) {
      throw new UnauthorizedException("登录信息不完整");
    }

    return payload.sub;
  }

  private readEmail(payload: JWTPayload) {
    return typeof payload.email === "string" ? payload.email.toLowerCase() : undefined;
  }

  private resolveNickname(email: string | undefined, payload: JWTPayload) {
    const metadata = this.readMetadata(payload.user_metadata);
    const nickname = [metadata.nickname, metadata.full_name, metadata.name].find(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );

    return nickname?.trim().slice(0, 24) ?? email?.split("@")[0] ?? "LinkU 用户";
  }

  private resolveUserRole(email: string | undefined, payload: JWTPayload) {
    const appMetadata = this.readMetadata(payload.app_metadata);
    const userMetadata = this.readMetadata(payload.user_metadata);
    const metadataRole = appMetadata.linku_role ?? userMetadata.linku_role;

    if (metadataRole === "admin") {
      return UserRole.ADMIN;
    }

    const adminEmails = (this.configService.get<string>("SUPABASE_ADMIN_EMAILS") ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    return email && adminEmails.includes(email) ? UserRole.ADMIN : UserRole.USER;
  }

  private readMetadata(value: unknown): SupabaseMetadata {
    return value && typeof value === "object" ? (value as SupabaseMetadata) : {};
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

  private assertMockLoginAllowed() {
    const isProduction = this.configService.get<string>("NODE_ENV") === "production";
    const allowInProduction = this.configService.get<string>("ALLOW_MOCK_LOGIN") === "true";

    if (isProduction && !allowInProduction) {
      throw new ForbiddenException("演示登录已关闭");
    }
  }

  private isSupabaseAuthConfigured() {
    return Boolean(
      this.configService.get<string>("SUPABASE_JWT_SECRET") ||
        this.configService.get<string>("SUPABASE_JWKS_URL") ||
        this.configService.get<string>("SUPABASE_URL"),
    );
  }
}
