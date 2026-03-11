import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiOkResponse,
} from "@nestjs/swagger";
import { AuthService } from "@/auth/auth.service";
import {
  LoginDto,
  RefreshDto,
  AuthResponseDto,
  RefreshResponseDto,
  MeResponseDto,
} from "@/auth/dto";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { CurrentUser } from "@/common/decorators/current-user.decorator";
import type { CurrentUserPayload } from "@/common/decorators/current-user.decorator";

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
    type: AuthResponseDto,
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
    description: "Logged out successfully",
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
    type: MeResponseDto,
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
    type: RefreshResponseDto,
  })
  @ApiResponse({ status: 401, description: "Invalid refresh token" })
  async refresh(@Body() refreshDto: RefreshDto): Promise<RefreshResponseDto> {
    return this.authService.refresh(refreshDto.refreshToken);
  }
}
