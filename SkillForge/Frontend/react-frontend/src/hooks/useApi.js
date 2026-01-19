<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, immediate = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...params) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFunction(...params);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);
=======
/**
 * useApi Hook
 * 
 * Provides loading, error, and data state management for API calls
 * with automatic cleanup and race condition protection
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { handleApiError } from '../utils/apiErrorHandler';
import { cancelAllPendingRequests } from '../utils/apiHelpers';

/**
 * Hook for managing API GET requests with loading states
 * 
 * @param {Function} apiFn - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} - { data, loading, error, refetch }
 */
export const useApi = (apiFn, options = {}) => {
  const {
    immediate = true,
    onSuccess = null,
    onError = null,
    deps = [],
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const result = await apiFn(...args);
      
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current && err.name !== 'AbortError') {
        const processedError = handleApiError(err, {
          context: 'API Request',
          showNotification: false,
        });
        
        setError(processedError);
        setLoading(false);
        
        if (onError) {
          onError(processedError);
        }
      }
      
      throw err;
    }
  }, [apiFn, onSuccess, onError]);
>>>>>>> TempBranch

  useEffect(() => {
    if (immediate) {
      execute();
    }
<<<<<<< HEAD
  }, [immediate, execute]);

  return { data, loading, error, execute, refetch: execute };
=======

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, execute, ...deps]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return { data, loading, error, refetch };
};

/**
 * Hook for managing API mutations (POST, PUT, DELETE) with loading states
 * 
 * @param {Function} apiFn - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} - { mutate, loading, error, data, reset }
 */
export const useApiMutation = (apiFn, options = {}) => {
  const {
    onSuccess = null,
    onError = null,
    preventDoubleSubmit = true,
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const isMountedRef = useRef(true);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const mutate = useCallback(async (...args) => {
    // Prevent double submission
    if (preventDoubleSubmit && isSubmittingRef.current) {
      const err = new Error('Request already in progress');
      err.code = 'DUPLICATE_SUBMISSION';
      return Promise.reject(err);
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn(...args);
      
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
        isSubmittingRef.current = false;
        
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        const processedError = handleApiError(err, {
          context: 'API Mutation',
          showNotification: false,
        });
        
        setError(processedError);
        setLoading(false);
        isSubmittingRef.current = false;
        
        if (onError) {
          onError(processedError);
        }
      }
      
      throw err;
    }
  }, [apiFn, onSuccess, onError, preventDoubleSubmit]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    isSubmittingRef.current = false;
  }, []);

  return { mutate, loading, error, data, reset };
};

/**
 * Hook for paginated API calls
 * 
 * @param {Function} apiFn - API function to call
 * @param {Object} options - Hook options
 * @returns {Object} - { data, loading, error, page, setPage, hasMore, loadMore }
 */
export const usePaginatedApi = (apiFn, options = {}) => {
  const {
    pageSize = 10,
    onSuccess = null,
    onError = null,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadPage = useCallback(async (pageNum) => {
    setLoading(true);
    setError(null);

    try {
      const result = await apiFn(pageNum, pageSize);
      
      if (isMountedRef.current) {
        if (pageNum === 0) {
          setData(result);
        } else {
          setData(prev => [...prev, ...result]);
        }
        
        setHasMore(result.length === pageSize);
        setLoading(false);
        
        if (onSuccess) {
          onSuccess(result);
        }
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        const processedError = handleApiError(err, {
          context: 'Paginated API Request',
          showNotification: false,
        });
        
        setError(processedError);
        setLoading(false);
        
        if (onError) {
          onError(processedError);
        }
      }
      
      throw err;
    }
  }, [apiFn, pageSize, onSuccess, onError]);

  useEffect(() => {
    loadPage(page);
  }, [page, loadPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loading, hasMore]);

  const refresh = useCallback(() => {
    setPage(0);
    setData([]);
    setHasMore(true);
  }, []);

  return { data, loading, error, page, setPage, hasMore, loadMore, refresh };
};

/**
 * Hook for cleanup on unmount
 * Cancels all pending requests
 */
export const useApiCleanup = () => {
  useEffect(() => {
    return () => {
      cancelAllPendingRequests();
    };
  }, []);
};

/**
 * Hook for debounced API calls (useful for search)
 * 
 * @param {Function} apiFn - API function to call
 * @param {number} delay - Debounce delay in ms
 * @returns {Object} - { search, data, loading, error, cancel }
 */
export const useDebouncedApi = (apiFn, delay = 300) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const search = useCallback((...args) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    setError(null);

    // Set new timeout
    timeoutRef.current = setTimeout(async () => {
      try {
        const result = await apiFn(...args);
        
        if (isMountedRef.current) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const processedError = handleApiError(err, {
            context: 'Debounced API Request',
            showNotification: false,
          });
          
          setError(processedError);
          setLoading(false);
        }
      }
    }, delay);
  }, [apiFn, delay]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setLoading(false);
  }, []);

  return { search, data, loading, error, cancel };
>>>>>>> TempBranch
};

export default useApi;
