import { Module } from "@nestjs/common";

import { PrismaModule } from "@/prisma/prisma.module";

import { AssetsModule } from "@/assets/assets.module";
import { ImageVaultCategoryService } from "@/image-vault/image-vault-category.service";
import { ImageVaultModelService } from "@/image-vault/image-vault-model.service";
import { ImageVaultController } from "@/image-vault/image-vault.controller";
import { ImageVaultService } from "@/image-vault/image-vault.service";

@Module({
  imports: [PrismaModule, AssetsModule],
  controllers: [ImageVaultController],
  providers: [
    ImageVaultService,
    ImageVaultModelService,
    ImageVaultCategoryService
  ]
})
export class ImageVaultModule {}
