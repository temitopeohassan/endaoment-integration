import type { Request, Response } from 'express';
import { getAccessToken } from '../utils/access-token';

export const checkLogin = async (req: Request, res: Response) => {
  console.log('[checkLogin] Checking login status');
  
  const token = req.cookies.ndao_token;
  
  if (!token) {
    console.log('[checkLogin] No token found');
    res.json({ isLoggedIn: false });
    return;
  }

  try {
    // Validate token if needed
    console.log('[checkLogin] Found valid token');
    res.json({ 
      isLoggedIn: true,
      // Optionally include user info
      user: {
        wallet: token.wallet
      }
    });
  } catch (error) {
    console.error('[checkLogin] Token validation failed:', error);
    res.json({ isLoggedIn: false });
  }
};
