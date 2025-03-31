export interface TokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
}

export interface LoginState {
  isLoggedIn: boolean;
  isLoading: boolean;
  error?: string;
} 