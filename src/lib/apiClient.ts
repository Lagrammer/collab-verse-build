
import { API_BASE_URL, DEFAULT_HEADERS, STORAGE_KEYS } from '@/config/api';

interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuthCheck?: boolean;
}

/**
 * Custom API client for making HTTP requests to the Django backend
 */
class ApiClient {
  baseUrl: string;
  private isRefreshing = false;
  private refreshCallbacks: Array<() => void> = [];
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Execute queued callbacks after token refresh
   */
  private onTokenRefreshed() {
    this.refreshCallbacks.forEach(callback => callback());
    this.refreshCallbacks = [];
  }

  /**
   * Add callback to the queue
   */
  private addRefreshCallback(callback: () => void) {
    this.refreshCallbacks.push(callback);
  }

  /**
   * Check if the backend is available
   */
  async checkBackendAvailability(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${this.baseUrl}/health-check/`, {
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      console.warn('Backend availability check failed:', error);
      return false;
    }
  }

  /**
   * Try to refresh the authentication token
   */
  private async refreshAuthToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    
    if (!refreshToken) {
      console.log('No refresh token available');
      return false;
    }
    
    try {
      console.log('Attempting to refresh token...');
      const response = await fetch(`${this.baseUrl}/auth/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      
      if (!response.ok) {
        console.log('Token refresh failed with status:', response.status);
        throw new Error('Failed to refresh token');
      }
      
      const data = await response.json();
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, data.access);
      localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refresh);
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear invalid tokens
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return false;
    }
  }

  /**
   * Make a request to the API with authentication and error handling
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeout = 30000, skipAuthCheck = false, headers = {}, ...restOptions } = options;
    
    // Create URL by joining baseUrl and endpoint
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    // Get auth token from localStorage if available
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    
    // Prepare headers with authentication if token exists
    const requestHeaders = {
      ...DEFAULT_HEADERS,
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    // Create abort controller for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      let response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle 401 errors (unauthorized) by refreshing the token
      if (response.status === 401 || response.status === 403) {
        if (skipAuthCheck) {
          // Already tried refresh, authentication has failed
          throw {
            status: response.status,
            message: 'Authentication failed',
            data: {},
          };
        }

        if (this.isRefreshing) {
          // If a refresh is already in progress, wait for it to complete
          return new Promise((resolve, reject) => {
            this.addRefreshCallback(async () => {
              try {
                const newResponse = await this.request<T>(endpoint, {
                  ...options,
                  skipAuthCheck: true,
                });
                resolve(newResponse);
              } catch (err) {
                reject(err);
              }
            });
          });
        } else {
          this.isRefreshing = true;
          
          const refreshed = await this.refreshAuthToken();
          this.isRefreshing = false;
          
          if (refreshed) {
            // Token refreshed successfully, retry the request with the new token
            this.onTokenRefreshed();
            
            const newToken = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
            const newHeaders = {
              ...requestHeaders,
              Authorization: `Bearer ${newToken}`,
            };
            
            response = await fetch(url, {
              ...restOptions,
              headers: newHeaders,
            });
          } else {
            // Token refresh failed, throw error to let calling code handle it
            throw {
              status: 403,
              message: 'Session expired',
              data: {},
            };
          }
        }
      }
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || errorData.detail || response.statusText,
          data: errorData,
        };
      }
      
      // Parse JSON only if there's content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return response.json();
      }
      
      return {} as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  // HTTP method helpers
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    
    // For FormData, don't set Content-Type header - let browser set it with boundary
    const headers = isFormData ? 
      { ...options.headers } : 
      { ...DEFAULT_HEADERS, ...options.headers };
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    
    const headers = isFormData ? 
      { ...options.headers } : 
      { ...DEFAULT_HEADERS, ...options.headers };
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers,
    });
  }

  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    
    const headers = isFormData ? 
      { ...options.headers } : 
      { ...DEFAULT_HEADERS, ...options.headers };
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export a default API client instance
const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
