import {
  Controller,
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
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { JwtAuthGuard } from "@/common/guards/jwt-auth.guard";
import { Public } from "@/common/decorators/public.decorator";
import { PaginationQueryDto, BulkDeleteDto } from "@/common/dto";
import { BaseCrudController } from "@/common/crud/base-crud.controller";
import { StudiosService } from "@/studio/studios.service";
import {
  CreateStudioDto,
  StudioResponseDto,
  UpdateStudioDto,
  PaginatedStudiosResponseDto,
} from "@/studio/dto";

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@ApiBadRequestResponse({ description: "Validation failed" })
@ApiUnauthorizedResponse({ description: "Unauthorized" })
@ApiForbiddenResponse({ description: "Forbidden" })
@ApiNotFoundResponse({ description: "Studio not found" })
@ApiTags("studios")
@Controller("studios")
export class StudiosController extends BaseCrudController<
  CreateStudioDto,
  UpdateStudioDto,
  StudioResponseDto,
  PaginatedStudiosResponseDto,
  StudiosService
> {
  constructor(service: StudiosService) {
    super(service);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create a new studio" })
  @ApiBody({ type: CreateStudioDto })
  @ApiResponse({
    status: 201,
    description: "Studio created successfully",
    type: StudioResponseDto,
  })
  async create(
    @Body() createStudioDto: CreateStudioDto,
  ): Promise<StudioResponseDto> {
    return this.baseCreate(createStudioDto);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: "Get all studios" })
  @ApiQuery({ name: "page", required: false, type: Number, example: 1 })
  @ApiQuery({ name: "limit", required: false, type: Number, example: 10 })
  @ApiQuery({
    name: "query",
    required: false,
    type: String,
    description: "Search by studio name (case-insensitive)",
    example: "Action",
  })
  @ApiResponse({
    status: 200,
    description: "Returns list of studios",
    type: PaginatedStudiosResponseDto,
  })
  async findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedStudiosResponseDto> {
    return this.baseFindAll(paginationQuery);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a studio by ID" })
  @ApiParam({
    name: "id",
    description: "Studio ID",
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: "Returns the studio",
    type: StudioResponseDto,
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<StudioResponseDto> {
    return this.baseFindOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update a studio" })
  @ApiParam({
    name: "id",
    description: "Studio ID",
    example: 1,
    type: Number,
  })
  @ApiBody({ type: UpdateStudioDto })
  @ApiResponse({
    status: 200,
    description: "Studio updated successfully",
    type: StudioResponseDto,
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateStudioDto: UpdateStudioDto,
  ): Promise<StudioResponseDto> {
    return this.baseUpdate(id, updateStudioDto);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete multiple studios" })
  @ApiBody({ type: BulkDeleteDto })
  @ApiResponse({
    status: 204,
    description: "Studios deleted successfully",
  })
  async deleteMany(@Body() bulkDeleteDto: BulkDeleteDto): Promise<void> {
    return this.baseDeleteMany(bulkDeleteDto.ids);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete a studio" })
  @ApiParam({
    name: "id",
    description: "Studio ID",
    example: 1,
    type: Number,
  })
  @ApiResponse({
    status: 204,
    description: "Studio deleted successfully",
  })
  async delete(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.baseDelete(id);
  }
}
