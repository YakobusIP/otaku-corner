import {
  BadRequestException,
  Injectable,
  NotFoundException
} from "@nestjs/common";

import {
  ANIME_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS,
  LIGHT_NOVEL_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS,
  MANGA_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS
} from "@/common/review-personal-score-weight-keys";
import { parseNumericScoreWeights } from "@/common/review-personal-score-weights";

import { PrismaService } from "@/prisma/prisma.service";

import { AppSettingResponseDto } from "@/settings/dto";
import { RecalculatePersonalScoresQueueService } from "@/settings/recalculate-personal-scores.queue";
import {
  REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS,
  type ReviewPersonalScoreWeightsMediaType,
  isReviewPersonalScoreWeightsSettingKey,
  mediaTypeFromReviewPersonalScoreWeightsSettingKey
} from "@/settings/setting-keys";

import { Prisma } from "@prisma/client";

const SETTING_KEY_PATTERN = /^[a-z0-9][a-z0-9._-]{0,127}$/i;

@Injectable()
export class SettingsService {
  private readonly cache = new Map<string, unknown>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly recalculatePersonalScoresQueue: RecalculatePersonalScoresQueueService
  ) {}

  async findAll(): Promise<AppSettingResponseDto[]> {
    const settings = await this.prisma.appSetting.findMany({
      orderBy: { key: "asc" }
    });

    return settings.map((setting) => this.toResponseDto(setting));
  }

  async findOne(key: string): Promise<AppSettingResponseDto> {
    this.assertValidSettingKey(key);

    const setting = await this.prisma.appSetting.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }

    return this.toResponseDto(setting);
  }

  async upsert(
    key: string,
    value: Record<string, unknown>
  ): Promise<AppSettingResponseDto> {
    this.assertValidSettingKey(key);
    const normalizedValue = this.validateSettingValue(key, value);
    const jsonValue = normalizedValue as Prisma.InputJsonValue;

    const setting = await this.prisma.appSetting.upsert({
      where: { key },
      create: {
        key,
        value: jsonValue
      },
      update: {
        value: jsonValue
      }
    });

    this.cache.delete(key);

    const mediaType = mediaTypeFromReviewPersonalScoreWeightsSettingKey(key);
    let recalculationQueuedCount: number | undefined;

    if (mediaType) {
      recalculationQueuedCount = await this.countReviewsForMediaType(mediaType);
      this.recalculatePersonalScoresQueue.enqueue(
        mediaType,
        normalizedValue as Record<string, number>
      );
    }

    return this.toResponseDto(setting, recalculationQueuedCount);
  }

  async getReviewPersonalScoreWeights(
    mediaType: ReviewPersonalScoreWeightsMediaType
  ): Promise<Record<string, number>> {
    const key = REVIEW_PERSONAL_SCORE_WEIGHTS_SETTING_KEYS[mediaType];
    const expectedKeys = this.getExpectedWeightKeys(mediaType);

    const cached = this.cache.get(key);
    if (cached) {
      return cached as Record<string, number>;
    }

    const setting = await this.prisma.appSetting.findUnique({
      where: { key }
    });

    if (!setting) {
      throw new NotFoundException(
        `Score weights setting "${key}" is missing. Run database migrations.`
      );
    }

    const weights = parseNumericScoreWeights(setting.value, expectedKeys);
    this.cache.set(key, weights);
    return weights;
  }

  private async countReviewsForMediaType(
    mediaType: ReviewPersonalScoreWeightsMediaType
  ): Promise<number> {
    switch (mediaType) {
      case "anime":
        return this.prisma.animeReview.count();
      case "manga":
        return this.prisma.mangaReview.count();
      case "lightNovel":
        return this.prisma.lightNovelReview.count();
    }
  }

  private validateSettingValue(
    key: string,
    value: Record<string, unknown>
  ): Record<string, unknown> {
    if (isReviewPersonalScoreWeightsSettingKey(key)) {
      const mediaType = mediaTypeFromReviewPersonalScoreWeightsSettingKey(key);
      if (!mediaType) {
        throw new BadRequestException(`Unknown score weights setting "${key}"`);
      }

      return parseNumericScoreWeights(
        value,
        this.getExpectedWeightKeys(mediaType)
      );
    }

    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      throw new BadRequestException("Setting value must be a JSON object");
    }

    return value;
  }

  private getExpectedWeightKeys(
    mediaType: ReviewPersonalScoreWeightsMediaType
  ): readonly string[] {
    switch (mediaType) {
      case "anime":
        return ANIME_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS;
      case "manga":
        return MANGA_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS;
      case "lightNovel":
        return LIGHT_NOVEL_REVIEW_PERSONAL_SCORE_WEIGHT_KEYS;
    }
  }

  private assertValidSettingKey(key: string): void {
    if (!SETTING_KEY_PATTERN.test(key)) {
      throw new BadRequestException("Invalid setting key format");
    }
  }

  private toResponseDto(
    setting: {
      key: string;
      value: unknown;
      createdAt: Date;
      updatedAt: Date;
    },
    recalculationQueuedCount?: number
  ): AppSettingResponseDto {
    return {
      key: setting.key,
      value: setting.value,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
      ...(recalculationQueuedCount === undefined
        ? {}
        : { recalculationQueuedCount })
    };
  }
}
