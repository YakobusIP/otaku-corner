import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponseDto } from "@/common/dto";

import { StudioResponseDto } from "@/studio/dto/studio-response.dto";

export class PaginatedStudiosResponseDto extends PaginatedResponseDto<StudioResponseDto> {
  @ApiProperty({
    description: "List of studios",
    type: [StudioResponseDto]
  })
  declare data: StudioResponseDto[];
}
