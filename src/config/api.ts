
// API configuration for Django backend
export const API_BASE_URL = 'https://communitypage.pythonanywhere.com/api';

// Default headers for API requests
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Timeout for API requests in milliseconds
export const REQUEST_TIMEOUT = 30000;

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};
