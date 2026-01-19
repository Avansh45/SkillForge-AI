/**
 * Enhanced API Client Utilities
 * 
 * Provides:
 * - Request timeout protection (10s default)
 * - Auto-retry for failed GET requests
 * - Duplicate request cancellation
 * - Request/response logging
 */

import axios from 'axios';
import { isRetryable, getRetryDelay, logRequest, logSuccess, logError } from './apiErrorHandler';

// ============================================================================
// REQUEST DEDUPLICATION
// ============================================================================

/**
 * Track pending requests to prevent duplicates
 * Key format: "METHOD:URL"
 */
const pendingRequests = new Map();

/**
 * Generate unique key for request
 */
const getRequestKey = (config) => {
  const { method, url, params } = config;
  const paramString = params ? JSON.stringify(params) : '';
  return `${method?.toUpperCase()}:${url}:${paramString}`;
};

/**
 * Check if request is already pending
 */
export const isDuplicateRequest = (config) => {
  const key = getRequestKey(config);
  return pendingRequests.has(key);
};

/**
 * Add request to pending list
 */
export const addPendingRequest = (config) => {
  const key = getRequestKey(config);
  const controller = new AbortController();
  pendingRequests.set(key, controller);
  
  // Attach abort signal to axios config
  config.signal = controller.signal;
  
  return key;
};

/**
 * Remove request from pending list
 */
export const removePendingRequest = (key) => {
  pendingRequests.delete(key);
};

/**
 * Cancel a specific pending request
 */
export const cancelPendingRequest = (key) => {
  const controller = pendingRequests.get(key);
  if (controller) {
    controller.abort();
    pendingRequests.delete(key);
  }
};

/**
 * Cancel all pending requests (useful on component unmount)
 */
export const cancelAllPendingRequests = () => {
  pendingRequests.forEach((controller, key) => {
    controller.abort();
  });
  pendingRequests.clear();
};

// ============================================================================
// RETRY LOGIC
// ============================================================================

/**
 * Retry a failed request with exponential backoff
 * 
 * @param {Function} requestFn - Function that returns axios request promise
 * @param {Object} options - Retry options
 * @returns {Promise} - Request result or final error
 */
export const retryRequest = async (requestFn, options = {}) => {
  const {
    maxRetries = 1,
    retryCondition = isRetryable,
    onRetry = null,
  } = options;
  
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Try the request
      const result = await requestFn();
      return result;
    } catch (error) {
      lastError = error;
      
      // Check if we should retry
      const shouldRetry = attempt < maxRetries && retryCondition(error);
      
      if (!shouldRetry) {
        throw error;
      }
      
      // Calculate delay before retry
      const delay = getRetryDelay(attempt, error);
      
      // Notify about retry
      if (onRetry) {
        onRetry(attempt + 1, maxRetries, delay);
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  // All retries failed
  throw lastError;
};

// ============================================================================
// TIMEOUT PROTECTION
// ============================================================================

/**
 * Wrap request with timeout protection
 * 
 * @param {Function} requestFn - Function that returns a promise
 * @param {number} timeoutMs - Timeout in milliseconds (default: 10000)
 * @returns {Promise} - Request result or timeout error
 */
export const withTimeout = async (requestFn, timeoutMs = 10000) => {
  return Promise.race([
    requestFn(),
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Request timeout'));
      }, timeoutMs);
    }),
  ]);
};

// ============================================================================
// LOADING STATE TRACKER
// ============================================================================

/**
 * Track loading states for API calls
 * Useful for preventing double submissions
 */
class LoadingStateTracker {
  constructor() {
    this.loadingStates = new Map();
  }
  
  /**
   * Check if operation is currently loading
   */
  isLoading(key) {
    return this.loadingStates.get(key) === true;
  }
  
  /**
   * Set loading state
   */
  setLoading(key, isLoading) {
    if (isLoading) {
      this.loadingStates.set(key, true);
    } else {
      this.loadingStates.delete(key);
    }
  }
  
  /**
   * Clear all loading states
   */
  clearAll() {
    this.loadingStates.clear();
  }
}

export const loadingTracker = new LoadingStateTracker();

// ============================================================================
// ENHANCED REQUEST WRAPPER
// ============================================================================

/**
 * Enhanced request wrapper with all features
 * 
 * @param {Function} requestFn - Axios request function
 * @param {Object} options - Enhancement options
 * @returns {Promise} - Request result
 */
export const enhancedRequest = async (requestFn, options = {}) => {
  const {
    enableRetry = true,
    maxRetries = 1,
    enableDeduplication = true,
    timeout = 10000,
    loadingKey = null,
    context = 'API Request',
  } = options;
  
  // Check loading state (prevent double submission)
  if (loadingKey && loadingTracker.isLoading(loadingKey)) {
    throw new Error('Request already in progress');
  }
  
  // Set loading state
  if (loadingKey) {
    loadingTracker.setLoading(loadingKey, true);
  }
  
  try {
    // Wrap with retry logic if enabled
    const requestWithRetry = enableRetry
      ? () => retryRequest(requestFn, { maxRetries })
      : requestFn;
    
    // Wrap with timeout if specified
    const requestWithTimeout = timeout
      ? () => withTimeout(requestWithRetry, timeout)
      : requestWithRetry;
    
    // Execute request
    const result = await requestWithTimeout();
    
    // Log success
    logSuccess(context, result);
    
    return result;
  } finally {
    // Clear loading state
    if (loadingKey) {
      loadingTracker.setLoading(loadingKey, false);
    }
  }
};

// ============================================================================
// REQUEST INTERCEPTOR HELPERS
// ============================================================================

/**
 * Request interceptor for deduplication and logging
 */
export const requestInterceptor = (config) => {
  // Log request
  logRequest(config.method, config.url, '');
  
  // Check for duplicate requests (only for GET requests)
  if (config.method?.toLowerCase() === 'get' && config.enableDeduplication !== false) {
    if (isDuplicateRequest(config)) {
      const error = new Error('Duplicate request cancelled');
      error.code = 'DUPLICATE_REQUEST';
      throw error;
    }
    
    // Add to pending requests
    const key = addPendingRequest(config);
    config.requestKey = key;
  }
  
  return config;
};

/**
 * Response interceptor for cleanup
 */
export const responseInterceptor = (response) => {
  // Remove from pending requests
  if (response.config.requestKey) {
    removePendingRequest(response.config.requestKey);
  }
  
  return response;
};

/**
 * Error interceptor for cleanup
 */
export const errorInterceptor = (error) => {
  // Remove from pending requests
  if (error.config?.requestKey) {
    removePendingRequest(error.config.requestKey);
  }
  
  return Promise.reject(error);
};

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Create cleanup function for component unmount
 * Returns function that cancels all pending requests
 */
export const createCleanupFunction = () => {
  return () => {
    cancelAllPendingRequests();
    loadingTracker.clearAll();
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  retryRequest,
  withTimeout,
  enhancedRequest,
  cancelAllPendingRequests,
  loadingTracker,
  requestInterceptor,
  responseInterceptor,
  errorInterceptor,
  createCleanupFunction,
};
