import { ApiPropertyOptional } from "@nestjs/swagger";

import { PaginationQueryDto } from "@/common/dto/pagination-query.dto";

import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";

export class EntityPaginationQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description:
      "When true, each row includes connectedMediaCount (total linked anime, manga, and light novels where applicable for that entity type)."
  })
  @IsOptional()
  @Transform(({ value }) => value === true || value === "true")
  @IsBoolean()
  connected_media?: boolean;
}
