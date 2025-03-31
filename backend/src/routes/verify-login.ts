import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { ACCESS_TOKEN_NAME } from '../utils/access-token';
import { getEndaomentUrls } from '../utils/endaoment-urls';
import { getEnvOrThrow } from '../utils/env';
import { getOAuthState, OAuthState } from '../utils/oauth-helpers';

export const verifyLogin = async (req: Request, res: Response) => {
  console.log('[verifyLogin] Starting login verification');
  console.log('[verifyLogin] Query params:', req.query);

  const stateFromUrl = req.query['state'];
  const code = req.query['code'];
  
  if (!stateFromUrl || typeof stateFromUrl !== 'string') {
    console.error('[verifyLogin] Missing or invalid state parameter');
    res.status(400).json({ error: 'Missing or invalid state parameter' });
    return;
  }

  if (!code || typeof code !== 'string') {
    console.error('[verifyLogin] Missing or invalid code parameter');
    res.status(400).json({ error: 'Missing or invalid code parameter' });
    return;
  }

  try {
    const exportedVariables = getOAuthState(stateFromUrl);
    
    if (!exportedVariables || !exportedVariables.codeVerifier) {
      console.error('[verifyLogin] Invalid or missing OAuth state data');
      res.status(400).json({ error: 'Invalid or missing OAuth state data' });
      return;
    }

    console.log('[verifyLogin] Found state file with variables:', {
      hasCodeVerifier: !!exportedVariables.codeVerifier,
      state: exportedVariables.state
    });

    const staticUrl = `${getEndaomentUrls().auth}/token`;
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('code_verifier', exportedVariables.codeVerifier);
    formData.append('redirect_uri', getEnvOrThrow('ENDAOMENT_REDIRECT_URI'));

    console.log('[verifyLogin] Making token request to:', staticUrl);

    const tokenResponse = await fetch(staticUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${getEnvOrThrow('ENDAOMENT_CLIENT_ID')}:${getEnvOrThrow('ENDAOMENT_CLIENT_SECRET')}`
        ).toString('base64')}`,
      },
      body: formData,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('[verifyLogin] Token request failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorText
      });
      throw new Error(`Token request failed: ${tokenResponse.status} ${tokenResponse.statusText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('[verifyLogin] Token response status:', tokenResponse.status);

    // Set token in cookie with proper configuration
    res.cookie('ndao_token', tokenData, {
      maxAge: tokenData.expires_in * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    
    console.log('[verifyLogin] Set auth cookie and redirecting to frontend');
    
    // Make sure to redirect to the frontend URL with a success parameter
    res.redirect(`${getEnvOrThrow('FRONTEND_URL')}?login=success`);
  } catch (error) {
    console.error('[verifyLogin] Error:', error);
    // Redirect to frontend with error parameter
    res.redirect(
      `${getEnvOrThrow('FRONTEND_URL')}?login=error&message=${encodeURIComponent(
        error instanceof Error ? error.message : 'An error occurred during login'
      )}`
    );
  }
};
