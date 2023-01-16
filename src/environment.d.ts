declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_URL: string;
      SESSION_SECRET: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
    }
  }
}

export {};
