import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: "List of items",
    isArray: true
  })
  data: T[];

  @ApiProperty({ description: "Total number of items", example: 100 })
  total: number;

  @ApiProperty({ description: "Current page number", example: 1 })
  page: number;

  @ApiProperty({ description: "Number of items per page", example: 10 })
  limit: number;

  @ApiProperty({ description: "Total number of pages", example: 10 })
  totalPages: number;
}
