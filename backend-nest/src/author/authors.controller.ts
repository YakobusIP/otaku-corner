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

import { AuthorsService } from "@/author/authors.service";
import {
  AuthorResponseDto,
  CreateAuthorDto,
  PaginatedAuthorsResponseDto,
  UpdateAuthorDto
} from "@/author/dto";

@AuthenticatedApiController({
  tag: "Authors",
  path: "authors",
  errors: { notFound: "Author not found" }
})
export class AuthorsController extends BaseCrudController<
  CreateAuthorDto,
  UpdateAuthorDto,
  AuthorResponseDto,
  PaginatedAuthorsResponseDto,
  AuthorsService
> {
  constructor(service: AuthorsService) {
    super(service);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new author" })
  @ApiBody({ type: CreateAuthorDto })
  @ApiResponse({
    status: 201,
    description: "Author created successfully",
    type: AuthorResponseDto
  })
  async create(
    @Body() createAuthorDto: CreateAuthorDto
  ): Promise<AuthorResponseDto> {
    return this.baseCreate(createAuthorDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all authors" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({
    name: "query",
    required: false,
    type: String,
    description: "Search by author name (case-insensitive)",
    example: "Action"
  })
  @ApiResponse({
    status: 200,
    description: "Returns list of authors",
    type: PaginatedAuthorsResponseDto
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto
  ): Promise<PaginatedAuthorsResponseDto> {
    return this.baseFindAll(paginationQuery);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an author by ID" })
  @ApiParam({ name: "id", description: "Author ID", example: 1, type: Number })
  @ApiResponse({
    status: 200,
    description: "Returns the author",
    type: AuthorResponseDto
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<AuthorResponseDto> {
    return this.baseFindOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update an author" })
  @ApiParam({ name: "id", description: "Author ID", example: 1, type: Number })
  @ApiBody({ type: UpdateAuthorDto })
  @ApiResponse({
    status: 200,
    description: "Author updated successfully",
    type: AuthorResponseDto
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto
  ): Promise<AuthorResponseDto> {
    return this.baseUpdate(id, updateAuthorDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple authors" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Authors deleted successfully"
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an author" })
  @ApiParam({ name: "id", description: "Author ID", example: 1, type: Number })
  @ApiResponse({
    status: 204,
    description: "Author deleted successfully"
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
