import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { MAX_PAGE_LIMIT } from "@/common/dto/pagination-query.dto";

import { IMAGE_VAULT_DEFAULT_PAGE_LIMIT } from "@/image-vault/image-vault.constants";

import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from "class-validator";

export const IMAGE_VAULT_FILTER_FIELDS = [
  "model",
  "category",
  "originType",
  "safetyLevel",
  "prompt",
  "originalPrompt",
  "sourceUrl",
  "notes"
] as const;

export type ImageVaultFilterField = (typeof IMAGE_VAULT_FILTER_FIELDS)[number];

/** Keep field/op contract in sync with admin-app `src/lib/image-vault-filter-expression.ts`. */
export const IMAGE_VAULT_FILTER_OPS = [
  "in",
  "nin",
  "eq",
  "neq",
  "contains",
  "not_contains"
] as const;

export type ImageVaultFilterOp = (typeof IMAGE_VAULT_FILTER_OPS)[number];

/** ID / enum fields: membership only. Text fields: eq/neq/contains/not_contains.
 * Category "in" matches entries that have ALL selected category IDs.
 * Model / originType / safetyLevel "in" matches ANY selected value. */
export const IMAGE_VAULT_FILTER_OPS_BY_FIELD: Record<
  ImageVaultFilterField,
  readonly ImageVaultFilterOp[]
> = {
  model: ["in", "nin"],
  category: ["in", "nin"],
  originType: ["in", "nin"],
  safetyLevel: ["in", "nin"],
  prompt: ["eq", "neq", "contains", "not_contains"],
  originalPrompt: ["eq", "neq", "contains", "not_contains"],
  sourceUrl: ["eq", "neq", "contains", "not_contains"],
  notes: ["eq", "neq", "contains", "not_contains"]
};

export const IMAGE_VAULT_ID_FILTER_FIELDS = ["model", "category"] as const;

export const IMAGE_VAULT_ENUM_FILTER_FIELDS = [
  "originType",
  "safetyLevel"
] as const;

export const IMAGE_VAULT_TEXT_FILTER_FIELDS = [
  "prompt",
  "originalPrompt",
  "sourceUrl",
  "notes"
] as const;

export const IMAGE_VAULT_MAX_FILTER_GROUPS = 20;
export const IMAGE_VAULT_MAX_CLAUSES_PER_GROUP = 20;
export const IMAGE_VAULT_MAX_FILTER_VALUES = 50;

export class ImageVaultFilterClauseDto {
  @ApiProperty({ enum: IMAGE_VAULT_FILTER_FIELDS })
  @IsIn(IMAGE_VAULT_FILTER_FIELDS)
  field!: ImageVaultFilterField;

  @ApiProperty({ enum: IMAGE_VAULT_FILTER_OPS })
  @IsIn(IMAGE_VAULT_FILTER_OPS)
  op!: ImageVaultFilterOp;

  @ApiProperty({
    type: [String],
    description:
      "For category in: entry must include all listed category IDs. For model/originType/safetyLevel in: entry matches any listed value. For text fields: exactly one string."
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(IMAGE_VAULT_MAX_FILTER_VALUES)
  @IsString({ each: true })
  values!: string[];
}

export class ImageVaultFilterGroupDto {
  @ApiProperty({
    type: [ImageVaultFilterClauseDto],
    description: "OR-connected clauses within this group"
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(IMAGE_VAULT_MAX_CLAUSES_PER_GROUP)
  @ValidateNested({ each: true })
  @Type(() => ImageVaultFilterClauseDto)
  clauses!: ImageVaultFilterClauseDto[];
}

export class ImageEntrySearchDto {
  @ApiPropertyOptional({
    description: "Page number",
    example: 1,
    minimum: 1,
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page",
    example: IMAGE_VAULT_DEFAULT_PAGE_LIMIT,
    minimum: 1,
    maximum: MAX_PAGE_LIMIT,
    default: IMAGE_VAULT_DEFAULT_PAGE_LIMIT
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit?: number;

  @ApiPropertyOptional({
    type: [ImageVaultFilterGroupDto],
    description:
      "AND-connected groups. Each group is an OR of clauses. Empty or omitted returns unfiltered results."
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(IMAGE_VAULT_MAX_FILTER_GROUPS)
  @ValidateNested({ each: true })
  @Type(() => ImageVaultFilterGroupDto)
  groups?: ImageVaultFilterGroupDto[];
}
