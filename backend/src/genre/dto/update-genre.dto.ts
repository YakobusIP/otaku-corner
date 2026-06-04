import { PartialType } from "@nestjs/swagger";

import { CreateGenreDto } from "@/genre/dto/create-genre.dto";

export class UpdateGenreDto extends PartialType(CreateGenreDto) {}
