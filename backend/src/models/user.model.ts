export interface User {
  id: string;
  nombre: string;
  email: string;
  password: string;
  tieneSeguro: boolean;
  penalizado: boolean;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'password'>;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  email: string;
  password: string;
  tieneSeguro: boolean;
}

export interface UpdateProfileRequest {
  nombre?: string;
  email?: string;
  tieneSeguro?: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
