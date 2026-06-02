import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";

import { PrismaService } from "@/prisma/prisma.service";

import { LoginDto } from "@/auth/dto";
import { JwtPayload } from "@/auth/strategies/jwt.strategy";

import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async login(
    loginDto: LoginDto
  ): Promise<{ accessToken: string; refreshToken: string; userId: number }> {
    const storedPins = await this.prisma.adminPin.findFirst();

    if (!storedPins) {
      throw new UnauthorizedException("Pins not found");
    }

    const isPin1Valid = await bcrypt.compare(loginDto.pin1, storedPins.pin1);
    const isPin2Valid = await bcrypt.compare(loginDto.pin2, storedPins.pin2);

    if (!isPin1Valid || !isPin2Valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const accessToken = await this.generateAccessToken(
      storedPins.id,
      storedPins.createdAt
    );
    const refreshToken = await this.generateRefreshToken(storedPins.id);

    return { accessToken, refreshToken, userId: storedPins.id };
  }

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    userId: number;
  }> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(
        refreshToken,
        {
          secret: this.configService.get<string>("REFRESH_TOKEN_SECRET")
        }
      );

      if (payload.type !== "refresh") {
        throw new UnauthorizedException("Invalid token type");
      }

      const accessToken = await this.generateAccessToken(payload.sub);

      return {
        accessToken,
        userId: payload.sub
      };
    } catch {
      throw new UnauthorizedException("Invalid refresh token");
    }
  }

  async validateUser(userId: number): Promise<boolean> {
    const storedPins = await this.prisma.adminPin.findUnique({
      where: { id: userId }
    });

    return storedPins !== null;
  }

  async getUserById(
    userId: number
  ): Promise<{ id: number; createdAt: Date } | null> {
    return this.prisma.adminPin.findUnique({
      where: { id: userId },
      select: { id: true, createdAt: true }
    });
  }

  private async generateAccessToken(
    userId: number,
    createdAt?: Date
  ): Promise<string> {
    const user =
      createdAt !== undefined
        ? { id: userId, createdAt }
        : await this.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const payload: JwtPayload = {
      sub: userId,
      type: "access",
      createdAt: user.createdAt.toISOString()
    };

    const secret = this.configService.get<string>("ACCESS_TOKEN_SECRET");
    const expiresIn = this.configService.get<string>(
      "ACCESS_TOKEN_DURATION"
    ) as JwtSignOptions["expiresIn"];

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn
    });
  }

  private async generateRefreshToken(userId: number): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      type: "refresh"
    };

    const secret = this.configService.get<string>("REFRESH_TOKEN_SECRET");
    const expiresIn = this.configService.get<string>(
      "REFRESH_TOKEN_DURATION"
    ) as JwtSignOptions["expiresIn"];

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn
    });
  }
}
