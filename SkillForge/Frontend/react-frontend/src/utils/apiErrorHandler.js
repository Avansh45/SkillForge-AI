/**
 * API Error Handler Utility
 * 
 * Provides centralized error handling for all API requests with:
 * - User-friendly error messages
 * - Distinct error type detection (network, auth, server)
 * - Structured logging (no sensitive data)
 * - Toast notifications support
 */

// ============================================================================
// ERROR TYPE DETECTION
// ============================================================================

/**
 * Determine the type of error for better handling
 */
export const getErrorType = (error) => {
  if (!error) return 'UNKNOWN';
  
  // Network failures (no response from server)
  if (!error.response) {
    if (!navigator.onLine) return 'NETWORK_OFFLINE';
    if (error.code === 'ECONNABORTED') return 'TIMEOUT';
    if (error.code === 'ERR_NETWORK') return 'NETWORK_ERROR';
    return 'NO_RESPONSE';
  }
  
  // HTTP status code errors
  const status = error.response?.status;
  switch (status) {
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'VALIDATION_ERROR';
    case 429:
      return 'RATE_LIMIT';
    case 500:
      return 'SERVER_ERROR';
    case 502:
    case 503:
    case 504:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'API_ERROR';
  }
};

// ============================================================================
// USER-FRIENDLY ERROR MESSAGES
// ============================================================================

/**
 * Convert error types to user-friendly messages
 */
const ERROR_MESSAGES = {
  NETWORK_OFFLINE: '📡 No internet connection. Please check your network and try again.',
  TIMEOUT: '⏱️ Request timed out. The server is taking too long to respond. Please try again.',
  NETWORK_ERROR: '🌐 Network error occurred. Please check your connection and try again.',
  NO_RESPONSE: '❌ Unable to reach the server. Please try again later.',
  
  UNAUTHORIZED: '🔒 Your session has expired. Please login again.',
  FORBIDDEN: '⛔ You don\'t have permission to perform this action.',
  NOT_FOUND: '🔍 The requested resource was not found.',
  CONFLICT: '⚠️ This action conflicts with existing data. Please refresh and try again.',
  VALIDATION_ERROR: '📝 Please check your input and try again.',
  RATE_LIMIT: '⏳ Too many requests. Please wait a moment and try again.',
  
  SERVER_ERROR: '🔧 Server error occurred. Our team has been notified. Please try again later.',
  SERVICE_UNAVAILABLE: '🚧 Service temporarily unavailable. Please try again in a few moments.',
  
  API_ERROR: '❌ An error occurred. Please try again.',
  UNKNOWN: '❓ An unexpected error occurred. Please try again.',
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyMessage = (error, customMessages = {}) => {
  const errorType = getErrorType(error);
  
  // Use custom message if provided
  if (customMessages[errorType]) {
    return customMessages[errorType];
  }
  
  // Use backend message if available and user-friendly
  const backendMessage = error.response?.data?.message || error.message;
  if (backendMessage && backendMessage.length < 200 && !backendMessage.includes('Exception')) {
    return backendMessage;
  }
  
  // Fallback to predefined messages
  return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN;
};

// ============================================================================
// CENTRALIZED ERROR HANDLER
// ============================================================================

/**
 * Main error handler for API requests
 * 
 * @param {Error} error - The error object from axios or fetch
 * @param {Object} options - Handling options
 * @param {string} options.context - Context of the error (e.g., 'Fetching courses')
 * @param {boolean} options.showNotification - Whether to show toast (default: true)
 * @param {Function} options.onRetry - Callback for retry action
 * @param {Object} options.customMessages - Custom error messages by type
 * @returns {Object} - Structured error object
 */
export const handleApiError = (error, options = {}) => {
  const {
    context = 'API request',
    showNotification = true,
    onRetry = null,
    customMessages = {},
  } = options;
  
  const errorType = getErrorType(error);
  const message = getUserFriendlyMessage(error, customMessages);
  const httpStatus = error.response?.status || null;
  
  // Structured error object (safe for logging)
  const structuredError = {
    type: errorType,
    message,
    context,
    httpStatus,
    timestamp: new Date().toISOString(),
    // NO sensitive data (tokens, passwords, etc.)
  };
  
  // Log structured error (NOT raw error which may contain sensitive data)
  logError(structuredError);
  
  // Show notification if requested (can be connected to toast library)
  if (showNotification) {
    notifyUser(message, errorType);
  }
  
  return structuredError;
};

// ============================================================================
// STRUCTURED LOGGING
// ============================================================================

/**
 * Log errors in structured format
 * NEVER logs sensitive data (tokens, passwords, session info)
 */
export const logError = (structuredError) => {
  // Skip logging for duplicate requests (not real errors)
  if (structuredError?.code === 'DUPLICATE_REQUEST' || structuredError?.error === 'DUPLICATE') {
    return;
  }
  
  // In development, log simple error message only
  if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
    const context = structuredError?.context || 'Unknown';
    console.error(`❌ Error: ${context}`);
  }
  
  // In production, send to error tracking service (e.g., Sentry, LogRocket)
  // Example: Sentry.captureException(structuredError);
};

/**
 * Log successful API calls (for debugging)
 * NEVER logs sensitive data
 */
export const logSuccess = (context, data = null) => {
  // Disabled to prevent exposing API structure
  // if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
  //   console.log(`✅ ${context}`);
  // }
};

/**
 * Log API request start (for debugging)
 */
export const logRequest = (method, url, context = '') => {
  // Disabled to prevent exposing API endpoints
  // if (import.meta.env?.DEV || process.env.NODE_ENV === 'development') {
  //   console.log(`📤 Request sent`);
  // }
};

// ============================================================================
// USER NOTIFICATION
// ============================================================================

/**
 * Notify user of errors
 * Can be integrated with toast libraries (react-toastify, sonner, etc.)
 */
export const notifyUser = (message, errorType) => {
  // Determine severity level
  const severity = getSeverity(errorType);
  
  // For now, use browser alert (can be replaced with toast library)
  // Example: toast.error(message);
  // Console logging removed to prevent sensitive data exposure in production
};

/**
 * Get error severity level
 */
const getSeverity = (errorType) => {
  const criticalErrors = ['UNAUTHORIZED', 'SERVER_ERROR', 'SERVICE_UNAVAILABLE'];
  const warningErrors = ['TIMEOUT', 'RATE_LIMIT', 'NETWORK_OFFLINE'];
  
  if (criticalErrors.includes(errorType)) return 'error';
  if (warningErrors.includes(errorType)) return 'warning';
  return 'info';
};

// ============================================================================
// RETRY HELPERS
// ============================================================================

/**
 * Determine if error is retryable
 */
export const isRetryable = (error) => {
  const errorType = getErrorType(error);
  const retryableTypes = [
    'TIMEOUT',
    'NETWORK_ERROR',
    'NO_RESPONSE',
    'SERVICE_UNAVAILABLE',
  ];
  return retryableTypes.includes(errorType);
};

/**
 * Get retry delay based on error type (exponential backoff)
 */
export const getRetryDelay = (attemptNumber, errorType) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  
  // Exponential backoff: 1s, 2s, 4s, 8s, 10s (max)
  const delay = Math.min(baseDelay * Math.pow(2, attemptNumber), maxDelay);
  
  return delay;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  handleApiError,
  getErrorType,
  getUserFriendlyMessage,
  logError,
  logSuccess,
  logRequest,
  isRetryable,
  getRetryDelay,
};
