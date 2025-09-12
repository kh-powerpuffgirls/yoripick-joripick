export interface User {
  userNo: number;
  email: string;
  username: string;
  msgNoti: 'Y' | 'N';
  replyNoti: 'Y' | 'N';
  rvwNoti: 'Y' | 'N';
  expNoti: 'Y' | 'N';
  status: 'ACTIVE' | 'INACTIVE';
  inactiveDate?: string | null;
  profile?: string;
  provider?: "local" | "kakao";
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