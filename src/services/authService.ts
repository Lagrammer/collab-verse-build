import apiClient from '@/lib/apiClient';
import { STORAGE_KEYS } from '@/config/api';
import { toast } from '@/components/ui/sonner';

export interface SignupRequest {
  email: string;
  password: string;
  firstname: string;
  lastname: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface AuthResponse {
  status: string;
  action?: string;
  access_token?: string;
  refresh_token?: string;
  message?: string | Record<string, string[]>;
  user?: {
    email: string;
  };
}

export interface User {
  id?: number;
  email: string;
  firstname?: string;
  lastname?: string;
  username?: string;
}

/**
 * Service for handling authentication-related API calls
 */
export const authService = {
  /**
   * Check if the backend API is available
   */
  async checkBackendAvailability(): Promise<boolean> {
    try {
      // Try a lightweight request to check if the API is reachable
      await fetch(`${apiClient.baseUrl}/health-check/`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000) // Timeout after 5 seconds
      });
      return true;
    } catch (error) {
      console.error('Backend availability check failed:', error);
      return false;
    }
  },

  /**
   * Sign up a new user
   */
  async signup(data: SignupRequest): Promise<AuthResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup/', data);
      toast.success('Signup successful! Please check your email for verification.');
      return response;
    } catch (error) {
      toast.error('Signup failed: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },

  /**
   * Login with email and password
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', data);
      
      // Store tokens if we get them (successful login)
      if (response.access_token && response.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        toast.success('Login successful!');
        return response;
      }
      
      // If no tokens but successful response, return as is for handling
      return response;
    } catch (error) {
      // Don't show toast for verification errors, let the UI handle it
      if (error.data && error.data.action === 'redirect to email verification page') {
        throw error;
      }
      
      toast.error('Login failed: ' + (error.message || 'Invalid credentials'));
      throw error;
    }
  },

  /**
   * Verify email with OTP
   */
  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/verify-email/', data);
      
      if (response.access_token && response.refresh_token) {
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access_token);
        localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        toast.success('Email verified successfully!');
      }
      
      return response;
    } catch (error) {
      toast.error('Email verification failed: ' + (error.message || 'Invalid or expired OTP'));
      throw error;
    }
  },

  /**
   * Resend verification OTP
   */
  async resendVerificationOtp(data: ForgotPasswordRequest): Promise<AuthResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/resend-verification-otp/', data);
      toast.success('Verification code sent to your email.');
      return response;
    } catch (error) {
      toast.error('Failed to send verification code: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/forgot-password/', data);
      toast.success('Password reset instructions sent to your email.');
      return response;
    } catch (error) {
      toast.error('Failed to send reset instructions: ' + (error.message || 'Something went wrong'));
      throw error;
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    if (!(await this.checkBackendAvailability())) {
      toast.error('Backend currently unavailable. Please try again later.');
      throw new Error('Backend currently unavailable. Please try again later.');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/reset-password/', data);
      toast.success('Password reset successful! You can now login.');
      return response;
    } catch (error) {
      toast.error('Failed to reset password: ' + (error.message || 'Invalid or expired token'));
      throw error;
    }
  },

  /**
   * Refresh authentication tokens
   */
  async refreshToken(refreshToken: string): Promise<{ access: string; refresh: string }> {
    try {
      const data: TokenRefreshRequest = { refresh: refreshToken };
      const response = await apiClient.post<{ access: string; refresh: string }>('/auth/token/refresh/', data);
      
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh);
      
      return response;
    } catch (error) {
      // If refresh fails, log the user out
      this.logout();
      throw error;
    }
  },

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    toast.info('You have been logged out.');
    window.location.href = '/login';
  },

  /**
   * Check if the user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get the current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};

export default authService;
