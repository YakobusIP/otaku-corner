import { Body, Get, Param, Put } from "@nestjs/common";
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam
} from "@nestjs/swagger";

import { AuthenticatedApiController } from "@/common/decorators/authenticated-api-controller.decorator";

import { AppSettingResponseDto, UpsertAppSettingDto } from "@/settings/dto";
import { SettingsService } from "@/settings/settings.service";

@AuthenticatedApiController({
  tag: "Settings",
  path: "settings",
  errors: { notFound: "Setting not found" }
})
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: "List all application settings" })
  @ApiOkResponse({ type: AppSettingResponseDto, isArray: true })
  async findAll(): Promise<AppSettingResponseDto[]> {
    return this.settingsService.findAll();
  }

  @Get(":key")
  @ApiOperation({ summary: "Get a setting by key" })
  @ApiParam({
    name: "key",
    description: "Setting key",
    example: "review.personal_score_weights.anime"
  })
  @ApiOkResponse({ type: AppSettingResponseDto })
  async findOne(@Param("key") key: string): Promise<AppSettingResponseDto> {
    return this.settingsService.findOne(key);
  }

  @Put(":key")
  @ApiOperation({ summary: "Create or update a setting by key" })
  @ApiParam({
    name: "key",
    description: "Setting key",
    example: "review.personal_score_weights.anime"
  })
  @ApiBody({ type: UpsertAppSettingDto })
  @ApiOkResponse({ type: AppSettingResponseDto })
  async upsert(
    @Param("key") key: string,
    @Body() dto: UpsertAppSettingDto
  ): Promise<AppSettingResponseDto> {
    return this.settingsService.upsert(key, dto.value);
  }
}
