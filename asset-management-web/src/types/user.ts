export interface UserData {
  id: number;
  name: string;
  email: string;
  roles: string[];
  created_at: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface PaginatedUserResponse {
  data: UserData[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
