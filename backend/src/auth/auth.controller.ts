import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger";

import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { CurrentUserPayload } from "@/common/decorators/current-user.decorator";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

import { REFRESH_TOKEN_COOKIE_NAME } from "@/auth/auth.constants";
import { AuthService } from "@/auth/auth.service";
import {
  AuthResponseDto,
  LoginDto,
  MeResponseDto,
  RefreshResponseDto
} from "@/auth/dto";

import type { CookieOptions } from "express";
import type { Request, Response } from "express";
import { decode } from "jsonwebtoken";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly logger: StructuredLogger
  ) {}

  private refreshCookieSecurity(): Pick<CookieOptions, "secure" | "sameSite"> {
    const isProd = this.configService.get<string>("NODE_ENV") === "production";
    if (isProd) {
      return { secure: true, sameSite: "none" };
    }
    return { secure: false, sameSite: "lax" };
  }

  private refreshCookieOptions(refreshJwt: string): CookieOptions {
    const decoded = decode(refreshJwt);
    if (
      decoded === null ||
      typeof decoded === "string" ||
      typeof decoded.exp !== "number"
    ) {
      throw new Error("Invalid refresh token payload");
    }
    const maxAge = Math.max(0, decoded.exp * 1000 - Date.now());
    return {
      httpOnly: true,
      path: "/",
      maxAge,
      ...this.refreshCookieSecurity()
    };
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      httpOnly: true,
      path: "/",
      ...this.refreshCookieSecurity()
    });
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with pins" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description:
      "Login successful; access token in body, refresh token in HttpOnly cookie",
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<AuthResponseDto> {
    try {
      const { accessToken, refreshToken, userId } =
        await this.authService.login(loginDto);
      res.cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refreshToken,
        this.refreshCookieOptions(refreshToken)
      );
      this.logger.logAuth({
        level: "info",
        event: "auth.login.succeeded",
        message: "Login succeeded",
        user_id: userId,
        meta: { reason_code: "login_ok" }
      });
      return { accessToken };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        this.logger.logAuth({
          level: "warn",
          event: "auth.login.failed",
          message: "Login failed",
          meta: { reason_code: "invalid_credentials" }
        });
      }
      throw error;
    }
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and clear refresh cookie" })
  @ApiResponse({
    status: 200,
    description: "Logged out successfully"
  })
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    this.clearRefreshCookie(res);
    this.logger.logAuth({
      level: "info",
      event: "auth.logout.succeeded",
      message: "Logout succeeded",
      meta: { reason_code: "logout_ok" }
    });
    return { message: "Logged out successfully" };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Get current authenticated user" })
  @ApiOkResponse({
    description: "Returns current user info",
    type: MeResponseDto
  })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  me(@CurrentUser() user: CurrentUserPayload): MeResponseDto {
    return { id: user.userId, createdAt: user.createdAt };
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "Refresh access token (refresh token from HttpOnly cookie)"
  })
  @ApiResponse({
    status: 200,
    description: "New access token generated",
    type: RefreshResponseDto
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(@Req() req: Request): Promise<RefreshResponseDto> {
    const rawRefresh = req.cookies[REFRESH_TOKEN_COOKIE_NAME] as unknown;
    if (typeof rawRefresh !== "string" || !rawRefresh) {
      this.logger.logAuth({
        level: "warn",
        event: "auth.refresh.failed",
        message: "Refresh failed",
        meta: { reason_code: "missing_refresh_token" }
      });
      throw new UnauthorizedException("Missing refresh token");
    }

    try {
      const result = await this.authService.refresh(rawRefresh);
      this.logger.logAuth({
        level: "info",
        event: "auth.refresh.succeeded",
        message: "Refresh succeeded",
        user_id: result.userId,
        meta: { reason_code: "refresh_ok" }
      });
      return { accessToken: result.accessToken };
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        this.logger.logAuth({
          level: "warn",
          event: "auth.refresh.failed",
          message: "Refresh failed",
          meta: { reason_code: "invalid_refresh_token" }
        });
      }
      throw error;
    }
  }
}
