import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "@/common/dto";
import { ThemeResponseDto } from "@/theme/dto/theme-response.dto";

export class PaginatedThemesResponseDto extends PaginatedResponseDto<ThemeResponseDto> {
  @ApiProperty({
    description: "List of themes",
    type: [ThemeResponseDto],
  })
  declare data: ThemeResponseDto[];
}
