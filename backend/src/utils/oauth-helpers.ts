import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Ensure URL safe encoding
export function toUrlSafe(base64: string): string {
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export function generateCodeVerifier(): string {
  const randomBytes = crypto.randomBytes(32);
  return toUrlSafe(Buffer.from(randomBytes).toString('base64'));
}

export async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const hash = crypto.createHash('sha256');
  hash.update(codeVerifier);
  return toUrlSafe(hash.digest('base64'));
}

export interface OAuthState {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export function saveOAuthState(state: OAuthState): void {
  const stateFilePath = path.join(
    process.cwd(),
    'login-states',
    `${state.state}-exportedVariables.json`
  );
  
  fs.writeFileSync(
    stateFilePath,
    JSON.stringify(state, null, 2),
    { flag: 'w' }
  );
}

export function getOAuthState(stateFromUrl: string): OAuthState {
  const stateFilePath = path.join(
    process.cwd(),
    'login-states',
    `${stateFromUrl}-exportedVariables.json`
  );
  
  try {
    if (!fs.existsSync(stateFilePath)) {
      throw new Error(`State file not found for state: ${stateFromUrl}`);
    }
    
    const data = JSON.parse(fs.readFileSync(stateFilePath, 'utf8'));
    
    // Validate the data structure
    if (!data.codeVerifier || !data.codeChallenge || !data.state) {
      throw new Error('Invalid state file format');
    }
    
    return data;
  } catch (error) {
    console.error('[getOAuthState] Error:', error);
    throw new Error(`Failed to get OAuth state: ${(error as Error).message}`);
  }
}