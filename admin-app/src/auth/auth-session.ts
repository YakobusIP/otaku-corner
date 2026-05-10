import { authService } from "@/services/auth.service";

import { ensureValidAccessToken } from "@/lib/axios";

export async function fetchAuthSession(): Promise<void> {
  const sessionOk = await ensureValidAccessToken();
  if (!sessionOk) {
    throw new Error("Unauthorized");
  }
  const response = await authService.validateToken();
  if (!response.success) {
    throw new Error("Unauthorized");
  }
}
