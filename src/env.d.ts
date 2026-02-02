/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SERVER_URL: string;
    // Додайте інші змінні, які ви використовуєте
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}