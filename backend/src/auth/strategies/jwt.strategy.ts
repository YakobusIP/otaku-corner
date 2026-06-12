import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { AuthService } from "@/auth/auth.service";

import { ExtractJwt, Strategy } from "passport-jwt";

export interface JwtPayload {
  sub: number;
  type: "access" | "refresh";
  createdAt?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private readonly logger: StructuredLogger
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET")
    });
  }

  async validate(
    payload: JwtPayload
  ): Promise<{ userId: number; createdAt: string }> {
    if (payload.type !== "access") {
      this.logger.logAuth({
        level: "warn",
        event: "auth.token.invalid",
        message: "Invalid access token type",
        user_id: payload.sub,
        meta: {
          reason_code: "invalid_token_type",
          token_type: payload.type
        }
      });
      throw new UnauthorizedException("Invalid token type");
    }

    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      this.logger.logAuth({
        level: "warn",
        event: "auth.token.user_missing",
        message: "Access token user not found",
        user_id: payload.sub,
        meta: { reason_code: "user_not_found" }
      });
      throw new UnauthorizedException("User not found");
    }

    return { userId: user.id, createdAt: user.createdAt.toISOString() };
  }
}
