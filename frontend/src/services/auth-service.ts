import apiClient from './api-client';
import { API_ENDPOINTS, AuthResponse, User } from '@shared/index';

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 회원가입
 */
export const register = async (dto: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<{ data: AuthResponse }>(
    API_ENDPOINTS.AUTH.REGISTER,
    dto,
  );
  return response.data.data;
};

/**
 * 로그인
 */
export const login = async (dto: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<{ data: AuthResponse }>(
    API_ENDPOINTS.AUTH.LOGIN,
    dto,
  );
  return response.data.data;
};

/**
 * 현재 사용자 정보 조회
 */
export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<{ data: User }>(
    API_ENDPOINTS.AUTH.ME,
  );
  return response.data.data;
};
