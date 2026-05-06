export interface AdminInfo {
  id: string;
  storeId: string;
  username: string;
}

export interface LoginRequest {
  storeId: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  admin: AdminInfo;
}
