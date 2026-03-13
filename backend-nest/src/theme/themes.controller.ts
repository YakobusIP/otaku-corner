import {
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
} from "@nestjs/swagger";
import { Public } from "@/common/decorators/public.decorator";
import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";
import { PaginationQueryDto, BulkDeleteDto } from "@/common/dto";
import { BaseCrudController } from "@/common/crud/base-crud.controller";
import { ThemesService } from "@/theme/themes.service";
import {
  CreateThemeDto,
  ThemeResponseDto,
  UpdateThemeDto,
  PaginatedThemesResponseDto,
} from "@/theme/dto";

@AuthenticatedApiController({
  tag: "Themes",
  path: "themes",
  errors: { notFound: "Theme not found" },
})
export class ThemesController extends BaseCrudController<
  CreateThemeDto,
  UpdateThemeDto,
  ThemeResponseDto,
  PaginatedThemesResponseDto,
  ThemesService
> {
  constructor(service: ThemesService) {
    super(service);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new theme" })
  @ApiBody({ type: CreateThemeDto })
  @ApiResponse({
    status: 201,
    description: "Theme created successfully",
    type: ThemeResponseDto,
  })
  async create(
    @Body() createThemeDto: CreateThemeDto,
  ): Promise<ThemeResponseDto> {
    return this.baseCreate(createThemeDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all themes" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({
    name: "query",
    required: false,
    type: String,
    description: "Search by theme name (case-insensitive)",
    example: "Action",
  })
  @ApiResponse({
    status: 200,
    description: "Returns list of themes",
    type: PaginatedThemesResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedThemesResponseDto> {
    return this.baseFindAll(paginationQuery);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a theme by ID" })
  @ApiParam({ name: "id", description: "Theme ID", example: 1, type: Number })
  @ApiResponse({
    status: 200,
    description: "Returns the theme",
    type: ThemeResponseDto,
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<ThemeResponseDto> {
    return this.baseFindOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a theme" })
  @ApiParam({ name: "id", description: "Theme ID", example: 1, type: Number })
  @ApiBody({ type: UpdateThemeDto })
  @ApiResponse({
    status: 200,
    description: "Theme updated successfully",
    type: ThemeResponseDto,
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateThemeDto: UpdateThemeDto,
  ): Promise<ThemeResponseDto> {
    return this.baseUpdate(id, updateThemeDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple themes" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Themes deleted successfully",
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a theme" })
  @ApiParam({ name: "id", description: "Theme ID", example: 1, type: Number })
  @ApiResponse({
    status: 204,
    description: "Theme deleted successfully",
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
