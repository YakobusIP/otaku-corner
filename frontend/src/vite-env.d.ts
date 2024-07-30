/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly AXIOS_BASE_URL: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
