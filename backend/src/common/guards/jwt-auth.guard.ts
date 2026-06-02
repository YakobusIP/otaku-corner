import {
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";

import { IS_PUBLIC_KEY } from "@/common/decorators/public.decorator";
import { StructuredLogger } from "@/common/logging/structured-logger.service";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  constructor(
    private reflector: Reflector,
    private readonly logger: StructuredLogger
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<T>(
    err: unknown,
    user: T,
    info: unknown,
    context: ExecutionContext,
    status?: unknown
  ): T {
    if (err || !user) {
      const reasonCode =
        info && typeof info === "object" && "name" in info
          ? String((info as { name?: string }).name ?? "auth_failed")
          : "auth_failed";
      this.logger.logAuth({
        level: "warn",
        event: "auth.token.invalid",
        message: "JWT authentication failed",
        meta: {
          reason_code: reasonCode
        }
      });
      if (err instanceof Error) {
        throw err;
      }
      throw new UnauthorizedException(
        err instanceof Error ? err.message : "Unauthorized"
      );
    }
    return super.handleRequest(err, user, info, context, status);
  }
}
