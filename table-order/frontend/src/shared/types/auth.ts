export interface AdminInfo {
  id: string;
  storeId: string;
  username: string;
}

export interface LoginRequest {
  store_code: string;
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  admin_id: number;
  store_id: number;
  username: string;
}
