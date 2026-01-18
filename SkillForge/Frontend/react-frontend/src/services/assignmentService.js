// src/services/assignmentService.js
// Assignment Management API Service

import api from './api';

// ==========================================
// INSTRUCTOR ASSIGNMENT OPERATIONS
// ==========================================

/**
 * Create a new assignment for a course (Instructor/Admin only)
 * @param {Object} assignmentData - Assignment details
 * @returns {Promise<Object>} Created assignment
 */
export const createAssignment = async (assignmentData) => {
  try {
    const response = await api.post('/instructors/assignments', assignmentData);
    return {
      success: true,
      data: response,
      message: 'Assignment created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create assignment',
    };
  }
};

/**
 * Update an existing assignment (Instructor/Admin only)
 * @param {number} assignmentId - Assignment ID
 * @param {Object} assignmentData - Updated assignment details
 * @returns {Promise<Object>} Updated assignment
 */
export const updateAssignment = async (assignmentId, assignmentData) => {
  try {
    const response = await api.put(`/instructors/assignments/${assignmentId}`, assignmentData);
    return {
      success: true,
      data: response,
      message: 'Assignment updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update assignment',
    };
  }
};

/**
 * Delete an assignment (Instructor/Admin only)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Deletion result
 */
export const deleteAssignment = async (assignmentId) => {
  try {
    const response = await api.delete(`/instructors/assignments/${assignmentId}`);
    return {
      success: true,
      data: response,
      message: 'Assignment deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete assignment',
    };
  }
};

/**
 * Get all assignments for a specific course (Instructor/Admin)
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} List of assignments with submission stats
 */
export const getAssignmentsByCourse = async (courseId) => {
  try {
    const response = await api.get(`/instructors/assignments/course/${courseId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch assignments',
    };
  }
};

/**
 * Get all submissions for a specific assignment (Instructor/Admin)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} List of submissions
 */
export const getAssignmentSubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/instructors/assignments/${assignmentId}/submissions`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch submissions',
    };
  }
};

/**
 * Grade a submission (Instructor/Admin only)
 * @param {number} submissionId - Submission ID
 * @param {Object} gradeData - Marks and feedback
 * @returns {Promise<Object>} Graded submission
 */
export const gradeSubmission = async (submissionId, gradeData) => {
  try {
    const response = await api.post(`/instructors/submissions/${submissionId}/grade`, gradeData);
    return {
      success: true,
      data: response,
      message: 'Submission graded successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to grade submission',
    };
  }
};

// ==========================================
// STUDENT ASSIGNMENT OPERATIONS
// ==========================================

/**
 * Get assignments for a course (Student - enrolled courses only)
 * @param {number} courseId - Course ID
 * @returns {Promise<Object>} List of assignments
 */
export const getStudentAssignments = async (courseId) => {
  try {
    const response = await api.get(`/students/assignments/course/${courseId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch assignments',
    };
  }
};

/**
 * Submit an assignment (Student only)
 * @param {number} assignmentId - Assignment ID
 * @param {File} file - PDF file to submit
 * @returns {Promise<Object>} Submission result
 */
export const submitAssignment = async (assignmentId, file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/students/assignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': undefined, // Let axios set the correct multipart boundary
      },
    });
    return {
      success: true,
      data: response,
      message: 'Assignment submitted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || error.response?.data?.error || 'Failed to submit assignment',
    };
  }
};

/**
 * Get student's submission for a specific assignment
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Submission details or null if not submitted
 */
export const getMySubmission = async (assignmentId) => {
  try {
    const response = await api.get(`/students/assignments/${assignmentId}/submission`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch submission',
    };
  }
};

/**
 * View/Stream submission PDF (opens in browser)
 * @param {number} submissionId - Submission ID
 * @returns {Promise<void>} Opens PDF in new tab with authentication
 */
export const viewSubmission = async (submissionId) => {
  try {
    console.log('Fetching submission:', submissionId);
    
    // Use axios api client which automatically includes JWT token via interceptor
    const response = await api.get(`/students/submissions/${submissionId}/view`, {
      responseType: 'blob'  // Important: Tell axios to expect a blob response
    });

    console.log('Successfully fetched submission');

    // Handle the blob and open in new tab
    const blob = response.data instanceof Blob ? response.data : response;
    const blobUrl = URL.createObjectURL(blob);
    
    // Open in new tab
    window.open(blobUrl, '_blank');
    
    // Clean up the blob URL after a delay (to allow the tab to open)
    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
  } catch (error) {
    console.error('Error viewing submission:', error);
    
    // Provide helpful error messages
    if (error.response?.status === 403) {
      alert('❌ Access denied. You may not have permission to view this submission.');
    } else if (error.response?.status === 401) {
      alert('❌ Your session has expired. Please log in again.');
    } else if (error.response?.status === 404) {
      alert('❌ Submission not found.');
    } else {
      alert('❌ Failed to view submission. Please try again.');
    }
    
    throw error;
  }
};

/**
 * Download submission PDF
 * @param {number} submissionId - Submission ID
 * @param {string} fileName - Optional custom filename for the download
 * @returns {Promise<Object>} Success status and error message if any
 */
export const downloadSubmission = async (submissionId, fileName = null) => {
  try {
    console.log('Downloading submission:', submissionId);
    
    // Use axios api client which automatically includes JWT token via interceptor
    const response = await api.get(`/students/submissions/${submissionId}/download`, {
      responseType: 'blob'  // Important: Tell axios to expect a blob response
    });

    console.log('Successfully fetched submission for download');

    // Handle the blob and trigger download
    const blob = response.data instanceof Blob ? response.data : response;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || `assignment_submission_${submissionId}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    console.error('Error downloading submission:', error);
    
    // Provide helpful error messages
    if (error.response?.status === 403) {
      return {
        success: false,
        error: 'Access denied. You may not have permission to download this submission.',
      };
    } else if (error.response?.status === 401) {
      return {
        success: false,
        error: 'Your session has expired. Please log in again.',
      };
    } else if (error.response?.status === 404) {
      return {
        success: false,
        error: 'Submission not found.',
      };
    } else {
      return {
        success: false,
        error: error.message || 'Failed to download submission',
      };
    }
  }
};

// ==========================================
// ADMIN ASSIGNMENT OPERATIONS
// ==========================================

/**
 * Get all assignments (Admin only)
 * @returns {Promise<Object>} List of all assignments
 */
export const getAllAssignments = async () => {
  try {
    const response = await api.get('/admin/assignments');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch all assignments',
    };
  }
};

/**
 * Delete assignment as admin (Admin only)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} Deletion result
 */
export const adminDeleteAssignment = async (assignmentId) => {
  try {
    const response = await api.delete(`/admin/assignments/${assignmentId}`);
    return {
      success: true,
      data: response,
      message: 'Assignment deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete assignment',
    };
  }
};

/**
 * Get all submissions for an assignment (Admin only)
 * @param {number} assignmentId - Assignment ID
 * @returns {Promise<Object>} List of submissions
 */
export const adminGetSubmissions = async (assignmentId) => {
  try {
    const response = await api.get(`/admin/submissions/${assignmentId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch submissions',
    };
  }
};

/**
 * Get all submissions across all assignments (Admin only)
 * @returns {Promise<Object>} List of all submissions
 */
export const adminGetAllSubmissions = async () => {
  try {
    const response = await api.get('/admin/submissions');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch all submissions',
    };
  }
};

/**
 * Delete a submission (Admin only)
 * @param {number} submissionId - Submission ID
 * @returns {Promise<Object>} Deletion result
 */
export const adminDeleteSubmission = async (submissionId) => {
  try {
    const response = await api.delete(`/admin/submissions/${submissionId}`);
    return {
      success: true,
      data: response,
      message: 'Submission deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete submission',
    };
  }
};

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Validate PDF file before upload
 * @param {File} file - File to validate
 * @returns {Object} Validation result
 */
export const validateAssignmentFile = (file) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPE = 'application/pdf';

  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (file.type !== ALLOWED_TYPE && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are allowed' };
  }

  if (file.size > MAX_SIZE) {
    return { valid: false, error: 'File size must not exceed 5MB' };
  }

  return { valid: true };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Check if assignment is overdue
 * @param {string} dueDate - Due date ISO string
 * @returns {boolean} True if overdue
 */
export const isAssignmentOverdue = (dueDate) => {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
};

/**
 * Format due date for display
 * @param {string} dueDate - Due date ISO string
 * @returns {string} Formatted date string
 */
export const formatDueDate = (dueDate) => {
  if (!dueDate) return 'No due date';
  const date = new Date(dueDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
