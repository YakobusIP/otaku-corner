import { ApiProperty } from "@nestjs/swagger";

import { PaginatedResponseDto } from "@/common/dto";

import { AuthorResponseDto } from "@/author/dto/author-response.dto";

export class PaginatedAuthorsResponseDto extends PaginatedResponseDto<AuthorResponseDto> {
  @ApiProperty({
    description: "List of authors",
    type: [AuthorResponseDto]
  })
  declare data: AuthorResponseDto[];
}
