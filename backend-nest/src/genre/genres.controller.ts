import {
  Body,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query
} from "@nestjs/common";
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse
} from "@nestjs/swagger";

import { BaseCrudController } from "@/common/crud/base-crud.controller";
import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { Public } from "@/common/decorators/public.decorator";
import { BulkDeleteDto, PaginationQueryDto } from "@/common/dto";

import {
  CreateGenreDto,
  GenreResponseDto,
  PaginatedGenresResponseDto,
  UpdateGenreDto
} from "@/genre/dto";
import { GenresService } from "@/genre/genres.service";

@AuthenticatedApiController({
  tag: "Genres",
  path: "genres",
  errors: { notFound: "Genre not found" }
})
export class GenresController extends BaseCrudController<
  CreateGenreDto,
  UpdateGenreDto,
  GenreResponseDto,
  PaginatedGenresResponseDto,
  GenresService
> {
  constructor(service: GenresService) {
    super(service);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new genre" })
  @ApiBody({ type: CreateGenreDto })
  @ApiResponse({
    status: 201,
    description: "Genre created successfully",
    type: GenreResponseDto
  })
  async create(
    @Body() createGenreDto: CreateGenreDto
  ): Promise<GenreResponseDto> {
    return this.baseCreate(createGenreDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all genres" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({
    name: "query",
    required: false,
    type: String,
    description: "Search by genre name (case-insensitive)",
    example: "Action"
  })
  @ApiResponse({
    status: 200,
    description: "Returns list of genres",
    type: PaginatedGenresResponseDto
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedGenresResponseDto> {
    return this.baseFindAll(paginationQuery);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a genre by ID" })
  @ApiParam({ name: "id", description: "Genre ID", example: 1, type: Number })
  @ApiResponse({
    status: 200,
    description: "Returns the genre",
    type: GenreResponseDto
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<GenreResponseDto> {
    return this.baseFindOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a genre" })
  @ApiParam({ name: "id", description: "Genre ID", example: 1, type: Number })
  @ApiBody({ type: UpdateGenreDto })
  @ApiResponse({
    status: 200,
    description: "Genre updated successfully",
    type: GenreResponseDto
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateGenreDto: UpdateGenreDto
  ): Promise<GenreResponseDto> {
    return this.baseUpdate(id, updateGenreDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple genres" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Genres deleted successfully"
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a genre" })
  @ApiParam({ name: "id", description: "Genre ID", example: 1, type: Number })
  @ApiResponse({
    status: 204,
    description: "Genre deleted successfully"
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
