import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards
} from "@nestjs/common";
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

import { AuthService } from "@/auth/auth.service";
import {
  AuthResponseDto,
  LoginDto,
  MeResponseDto,
  RefreshDto,
  RefreshResponseDto
} from "@/auth/dto";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with pins" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: "Login successful, returns access and refresh tokens",
    type: AuthResponseDto
  })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout (client-side token disposal)" })
  @ApiResponse({
    status: 200,
    description: "Logged out successfully"
  })
  logout(): { message: string } {
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
  @ApiOperation({ summary: "Refresh access token using refresh token" })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: "New access token generated",
    type: RefreshResponseDto
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }
}
