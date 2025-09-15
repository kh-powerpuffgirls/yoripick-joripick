export interface User {
  userNo: number;
  email: string;
  username: string;
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
  loading: boolean;
}