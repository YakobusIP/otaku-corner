export const VAULT_PRIVATE_URL_PREFIX = "vault-private://";

export const IMAGE_VAULT_STORAGE_PREFIX = "image-vault";

export const isPrivateVaultAssetUrl = (url: string): boolean =>
  url.startsWith(VAULT_PRIVATE_URL_PREFIX);

export const vaultPrivateUrlPlaceholder = (assetId: string): string =>
  `${VAULT_PRIVATE_URL_PREFIX}${assetId}`;
