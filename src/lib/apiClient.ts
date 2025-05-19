
import { API_BASE_URL, DEFAULT_HEADERS, STORAGE_KEYS } from '@/config/api';

interface RequestOptions extends RequestInit {
  timeout?: number;
}

/**
 * Custom API client for making HTTP requests to the Django backend
 */
class ApiClient {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a request to the API with authentication and error handling
   */
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { timeout = 30000, headers = {}, ...restOptions } = options;
    
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
      const response = await fetch(url, {
        ...restOptions,
        headers: requestHeaders,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
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
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: isFormData ? {} : options.headers, // Let browser set content-type for FormData
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: isFormData ? {} : options.headers,
    });
  }

  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const isFormData = data instanceof FormData;
    
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
      headers: isFormData ? {} : options.headers,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Create and export a default API client instance
const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
