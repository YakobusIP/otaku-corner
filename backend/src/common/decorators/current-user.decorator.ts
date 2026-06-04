import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export interface CurrentUserPayload {
  userId: number;
  createdAt: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: CurrentUserPayload }>();
    return request.user;
  }
);
