
import apiClient from '@/lib/apiClient';
import { toast } from '@/components/ui/sonner';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface AuthResponse {
  status: string;
  action?: string;
  message?: string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    email: string;
  };
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

/**
 * Service for handling authentication-related API calls
 */
export const authService = {
  /**
   * Log in a user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
      
      if (response.status === 'success' && response.access_token) {
        // Store tokens
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token!);
        return response;
      }
      
      return response;
    } catch (error) {
      toast.error('Login failed: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Register a new user
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      return await apiClient.post<AuthResponse>('/auth/signup/', credentials);
    } catch (error) {
      toast.error('Signup failed: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Verify email with OTP
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/verify-email/', data);
      
      if (response.status === 'success' && response.access_token) {
        // Store tokens
        localStorage.setItem('authToken', response.access_token);
        localStorage.setItem('refreshToken', response.refresh_token!);
      }
      
      return response;
    } catch (error) {
      toast.error('Email verification failed: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },
  
  /**
   * Log out the current user
   */
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    // Optionally redirect to login page
  },
  
  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },
  
  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await apiClient.post<{ access: string; refresh: string }>(
        '/auth/token/refresh/',
        { refresh: refreshToken }
      );
      
      localStorage.setItem('authToken', response.access);
      localStorage.setItem('refreshToken', response.refresh);
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  },
};

export default authService;
