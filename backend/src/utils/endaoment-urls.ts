import { getEnvOrThrow } from './env';

export function getEndaomentUrls() {
  const env = process.env.NODE_ENV || 'development';
  console.log('[getEndaomentUrls] Current environment:', env);
  
  const urls = {
    development: {
      auth: 'https://auth.dev.endaoment.org',
      api: 'https://api.dev.endaoment.org',
      app: 'https://app.dev.endaoment.org',
    },
    production: {
      auth: 'https://auth.endaoment.org',
      api: 'https://api.endaoment.org',
      app: 'https://app.endaoment.org',
    },
  }[env];

  console.log('[getEndaomentUrls] Using URLs:', urls);
  return urls;
}
