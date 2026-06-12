import { PartialType } from "@nestjs/swagger";

import { CreateStudioDto } from "@/studio/dto/create-studio.dto";

export class UpdateStudioDto extends PartialType(CreateStudioDto) {}
