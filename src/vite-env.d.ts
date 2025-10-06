/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SHOP_NAME: string
  readonly VITE_SHOP_WA: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
