import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import { AuthService } from "@/auth/auth.service";

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
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("ACCESS_TOKEN_SECRET"),
    });
  }

  async validate(
    payload: JwtPayload,
  ): Promise<{ userId: number; createdAt: string }> {
    if (payload.type !== "access") {
      throw new UnauthorizedException("Invalid token type");
    }

    const user = await this.authService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    return { userId: user.id, createdAt: user.createdAt.toISOString() };
  }
}
