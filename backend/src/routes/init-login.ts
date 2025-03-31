import crypto from 'crypto';
import type { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { getEndaomentUrls } from '../utils/endaoment-urls';
import { getEnvOrThrow } from '../utils/env';
import { saveOAuthState } from '../utils/oauth-helpers';

// Ensure URL safe encoding
function toUrlSafe(base64: string) {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function generateCodeVerifier() {
  const randomBytes = crypto.randomBytes(32);
  crypto.getRandomValues(randomBytes);
  return toUrlSafe(Buffer.from(randomBytes).toString('base64'));
}

async function generateCodeChallenge(codeVerifier: string) {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return toUrlSafe(hash.digest('base64'));
}

export const initLogin = async (req: Request, res: Response) => {
  console.log('[initLogin] Starting login initialization');
  
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = crypto.randomBytes(16).toString('hex');

  console.log('[initLogin] Generated auth params:', {
    codeChallenge,
    state,
    hasCodeVerifier: !!codeVerifier
  });

  // Save OAuth state
  saveOAuthState({
    codeVerifier,
    codeChallenge,
    state,
  });

  // Prepare the authorization URL
  const staticUrl = `${getEndaomentUrls().auth}/auth`;
  const urlParams = new URLSearchParams();
  urlParams.append('response_type', 'code');
  urlParams.append('prompt', 'consent');
  urlParams.append(
    'scope',
    'openid offline_access accounts transactions profile'
  );
  urlParams.append('client_id', getEnvOrThrow('ENDAOMENT_CLIENT_ID'));
  urlParams.append('redirect_uri', getEnvOrThrow('ENDAOMENT_REDIRECT_URI'));
  urlParams.append('code_challenge', codeChallenge);
  urlParams.append('code_challenge_method', 'S256');
  urlParams.append('state', state);

  const urlToRedirect = `${staticUrl}?${urlParams.toString().replace(/\+/g, '%20')}`;
  console.log('[initLogin] Generated redirect URL:', urlToRedirect);

  res.json({ url: urlToRedirect });
  res.end();
};