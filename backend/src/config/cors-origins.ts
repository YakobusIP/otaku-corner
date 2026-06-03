import { ConfigService } from "@nestjs/config";

const devOrigins = ["http://localhost:5173", "http://localhost:3000"] as const;

export const getCorsOrigins = (configService: ConfigService): string[] => {
  const origins: string[] = [...devOrigins];

  const adminAppUrl = configService.get<string>("ADMIN_APP_URL");
  if (adminAppUrl) origins.push(adminAppUrl);

  const publicAppUrl = configService.get<string>("PUBLIC_APP_URL");
  if (publicAppUrl) origins.push(publicAppUrl);

  const canonicalUrl = configService.get<string>("CANONICAL_PUBLIC_APP_URL");
  if (canonicalUrl && !origins.includes(canonicalUrl)) {
    origins.push(canonicalUrl);
  }

  return origins;
};
