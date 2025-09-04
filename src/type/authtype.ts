export interface User {
  id: number;
  email: string;
  name: string;
  profile: string;
  roles: string[];
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isAuthenticated: boolean;
}