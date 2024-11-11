/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_AXIOS_BASE_URL: string;
  readonly VITE_PUBLIC_APP: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
