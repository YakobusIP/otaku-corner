import { applyDecorators, Controller, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";

const DEFAULT_ERRORS = {
  badRequest: "Validation failed",
  unauthorized: "Unauthorized",
  forbidden: "Forbidden",
  notFound: "Not found",
} as const;

export interface AuthenticatedApiControllerOptions {
  tag: string;
  path: string;
  errors?: {
    badRequest?: string;
    unauthorized?: string;
    forbidden?: string;
    notFound?: string;
  };
}

export function AuthenticatedApiController(
  options: AuthenticatedApiControllerOptions,
) {
  const { tag, path, errors = {} } = options;
  const messages = { ...DEFAULT_ERRORS, ...errors };

  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard),
    ApiBadRequestResponse({ description: messages.badRequest }),
    ApiUnauthorizedResponse({ description: messages.unauthorized }),
    ApiForbiddenResponse({ description: messages.forbidden }),
    ApiNotFoundResponse({ description: messages.notFound }),
    ApiTags(tag),
    Controller(path),
  );
}
