import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule, JwtSignOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";

import { PrismaModule } from "@/prisma/prisma.module";

import { AuthController } from "@/auth/auth.controller";
import { AuthService } from "@/auth/auth.service";
import { JwtStrategy } from "@/auth/strategies/jwt.strategy";

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>("ACCESS_TOKEN_SECRET"),
        signOptions: {
          expiresIn: configService.get<string>(
            "ACCESS_TOKEN_DURATION"
          ) as JwtSignOptions["expiresIn"]
        }
      }),
      inject: [ConfigService]
    }),
    ConfigModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService]
})
export class AuthModule {}
