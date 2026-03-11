export interface AuthUser {
  id: string;
  displayName: string;
  email: string;
  subscriptionKeywordIds: string[];
  createdAt: string;
}

export interface AuthSessionPayload {
  sessionToken: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  displayName: string;
  email: string;
  password: string;
  subscriptionKeywordIds: string[];
}
