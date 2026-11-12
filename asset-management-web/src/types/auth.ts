export interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Tambahkan definisi tipe baru untuk menyelaraskan respons /api/me
export interface UserProfileResponse {
  user: User;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  user: User;
  roles?: string[];
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}
