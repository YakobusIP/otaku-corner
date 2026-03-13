import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";

import { AuthService } from "@/auth/auth.service";
import { JwtPayload } from "@/auth/strategies/jwt.strategy";

import { ExtractJwt, Strategy } from "passport-jwt";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  "jwt-refresh"
) {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("REFRESH_TOKEN_SECRET")
    });
  }

  async validate(payload: JwtPayload): Promise<{ userId: number }> {
    if (payload.type !== "refresh") {
      throw new UnauthorizedException("Invalid token type");
    }

    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return { userId: payload.sub };
  }
}
