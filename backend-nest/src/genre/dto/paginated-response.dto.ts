import { ApiProperty } from "@nestjs/swagger";
import { PaginatedResponseDto } from "@/common/dto";
import { GenreResponseDto } from "@/genre/dto/genre-response.dto";

export class PaginatedGenresResponseDto extends PaginatedResponseDto<GenreResponseDto> {
  @ApiProperty({
    description: "List of genres",
    type: [GenreResponseDto],
  })
  declare data: GenreResponseDto[];
}
