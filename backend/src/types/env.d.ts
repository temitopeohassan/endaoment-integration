declare global {
    namespace NodeJS {
      interface ProcessEnv {
        PORT?: string;
        FRONTEND_URL: string;
        ENDAOMENT_CLIENT_ID: string;
        ENDAOMENT_CLIENT_SECRET: string;
        REDIRECT_URI: string;
      }
    }
  }
  
  export {};