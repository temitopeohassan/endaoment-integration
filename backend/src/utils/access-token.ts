import { Request } from 'express';

export const ACCESS_TOKEN_NAME = 'ndao_token';

interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export function getAccessToken(req: Request): string {
  console.log('[getAccessToken] Checking cookies:', req.cookies);
  
  try {
    const tokenData = req.cookies?.[ACCESS_TOKEN_NAME];
    console.log('[getAccessToken] Found token data:', tokenData);
    
    if (!tokenData || typeof tokenData !== 'object') {
      console.error('[getAccessToken] Invalid token format:', tokenData);
      throw new Error('Invalid token format');
    }

    if (!tokenData.access_token || typeof tokenData.access_token !== 'string') {
      console.error('[getAccessToken] Invalid access token:', tokenData.access_token);
      throw new Error('Invalid access token');
    }

    console.log('[getAccessToken] Successfully retrieved access token');
    return tokenData.access_token;
  } catch (error) {
    console.error('[getAccessToken] Error retrieving token:', error);
    throw new Error('No valid access token found');
  }
}