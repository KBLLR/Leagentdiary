/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_HTDI_API_URL: string
  readonly VITE_ENABLE_STAGE_SERVICE: string
  readonly VITE_POLL_INTERVAL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
