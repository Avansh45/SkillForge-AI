// src/services/resourceService.js
// Course Resource (PDF) Management API Service

import api from './api';
import { getToken } from '../utils/auth';

/**
 * Upload a PDF resource to a course (Instructor/Admin only)
 * @param {number} courseId - Course ID
 * @param {FormData} formData - FormData containing 'title' and 'file' (PDF)
 * @returns {Promise<Object>} Uploaded resource details
 */
export const uploadResource = async (courseId, formData) => {
  try {
    // Let axios automatically set Content-Type with boundary for multipart/form-data
    // DO NOT manually set Content-Type - axios will handle it correctly
    const response = await api.post(`/resources/course/${courseId}/upload`, formData, {
      headers: {
        'Content-Type': undefined, // This tells axios to set the correct multipart boundary
      },
    });
    return {
      success: true,
      data: response,
      message: 'Resource uploaded successfully',
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message || error.response?.data?.error || 'Failed to upload resource',
    };
  }
};

/**
 * Get all resources for a course
 * Students can only access resources from enrolled courses
 * Instructors and Admins can access all course resources
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} List of course resources
 */
export const getCourseResources = async (courseId) => {
  try {
    const response = await api.get(`/resources/course/${courseId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch course resources',
    };
  }
};

/**
 * View/Stream a PDF resource (opens in browser)
 * Access controlled by enrollment/ownership
 * @param {number} resourceId - Resource ID
 * @returns {Promise<void>} Opens PDF in new tab with authentication
 */
export const viewResource = async (resourceId) => {
  try {
    console.log('Viewing resource:', resourceId);
    
    // Use axios api client which automatically includes JWT token via interceptor
    const response = await api.get(`/resources/${resourceId}/view`, {
      responseType: 'blob'  // Important: Tell axios to expect a blob response
    });

    console.log('Successfully fetched resource');

    // Handle the blob and open in new tab
    const blob = response.data instanceof Blob ? response.data : response;
    const blobUrl = URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(blobUrl, '_blank');
    
    // Clean up the blob URL after a delay
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error('Error viewing resource:', error);
    
    if (error.response?.status === 403) {
      alert('❌ Access denied. You may not have permission to view this resource.');
    } else if (error.response?.status === 401) {
      alert('❌ Your session has expired. Please log in again.');
    } else if (error.response?.status === 404) {
      alert('❌ Resource not found.');
    } else {
      alert('❌ Failed to view resource. Please try again.');
    }
    
    throw error;
  }
};

/**
 * Download a PDF resource
 * Access controlled by enrollment/ownership
 * @param {number} resourceId - Resource ID
 * @param {string} fileName - Optional custom filename for download
 * @returns {Promise<Object>} Download result
 */
export const downloadResource = async (resourceId, fileName = 'resource.pdf') => {
  try {
    console.log('Downloading resource:', resourceId);
    
    // Use axios api client which automatically includes JWT token via interceptor
    const response = await api.get(`/resources/${resourceId}/download`, {
      responseType: 'blob'  // Important: Tell axios to expect a blob response
    });

    console.log('Successfully fetched resource for download');

    // Handle the blob and trigger download
    const blob = response.data instanceof Blob ? response.data : response;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);

    return {
      success: true,
      message: 'Resource downloaded successfully',
    };
  } catch (error) {
    console.error('Error downloading resource:', error);
    
    let errorMessage = 'Failed to download resource. Please try again.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to download this resource.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Delete a resource (Admin only)
 * @param {number} resourceId - Resource ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteResource = async (resourceId) => {
  try {
    const response = await api.delete(`/resources/${resourceId}`);
    return {
      success: true,
      data: response,
      message: 'Resource deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete resource',
    };
  }
};

/**
 * Get all resources across all courses (Admin only)
 * @returns {Promise<Object>} List of all platform resources
 */
export const getAllResources = async () => {
  try {
    const response = await api.get('/resources/all');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch all resources',
    };
  }
};

/**
 * Helper function to open resource in new tab with authentication
 * @param {number} resourceId - Resource ID
 */
export const openResourceInNewTab = async (resourceId) => {
  try {
    console.log('Opening resource in new tab:', resourceId);
    
    // Use axios api client which automatically includes JWT token via interceptor
    const response = await api.get(`/resources/${resourceId}/view`, {
      responseType: 'blob'  // Important: Tell axios to expect a blob response
    });

    console.log('Successfully fetched resource');

    // Get the blob from response
    const blob = response.data instanceof Blob ? response.data : response;
    
    // Verify it's a PDF
    if (blob.type && !blob.type.includes('pdf')) {
      console.warn('Response is not a PDF:', blob.type);
    }

    // Create object URL and open in new tab
    const blobUrl = window.URL.createObjectURL(blob);
    const newWindow = window.open(blobUrl, '_blank');

    if (!newWindow) {
      throw new Error('Popup blocked. Please allow popups for this site.');
    }

    // Cleanup after window loads
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 1000);

    return {
      success: true,
      message: 'Resource opened in new tab',
    };
  } catch (error) {
    console.error('Error opening resource:', error);
    
    let errorMessage = 'Failed to open resource. Please try again.';
    
    if (error.response?.status === 401) {
      errorMessage = 'Session expired. Please login again.';
    } else if (error.response?.status === 403) {
      errorMessage = 'You do not have permission to view this resource.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Validate if file is a PDF and within size limit
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum file size in MB (default 10MB)
 * @returns {Object} Validation result
 */
export const validatePDFFile = (file, maxSizeMB = 10) => {
  if (!file) {
    return {
      valid: false,
      error: 'No file selected',
    };
  }

  // Check file type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: 'Only PDF files are allowed',
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must not exceed ${maxSizeMB}MB`,
    };
  }

  return {
    valid: true,
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};
