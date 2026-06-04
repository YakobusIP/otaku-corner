import { PartialType } from "@nestjs/swagger";

import { CreateThemeDto } from "@/theme/dto/create-theme.dto";

export class UpdateThemeDto extends PartialType(CreateThemeDto) {}
