// src/services/examService.js
// Exam and Question Management API Service (Including AI-powered generation)

import api from './api';

// ==========================================
// INSTRUCTOR EXAM MANAGEMENT
// ==========================================

/**
 * Get all instructor's exams
 * @returns {Promise<Object>} List of instructor's exams
 */
export const getInstructorExams = async () => {
  try {
    const response = await api.get('/instructors/exams');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exams',
    };
  }
};

/**
 * Get exam details (Instructor view)
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Exam details
 */
export const getExamDetails = async (examId) => {
  try {
    const response = await api.get(`/instructors/exams/${examId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exam details',
    };
  }
};

/**
 * Create new exam
 * @param {Object} examData - Exam information
 * @param {number} examData.courseId - Course ID
 * @param {string} examData.title - Exam title
 * @param {string} examData.description - Exam description
 * @param {string} examData.startTime - Start time (ISO format)
 * @param {string} examData.endTime - End time (ISO format)
 * @param {number} examData.durationMinutes - Duration in minutes
 * @param {number} examData.totalQuestions - Total questions
 * @param {number} examData.maxAttempts - Maximum attempts allowed
 * @returns {Promise<Object>} Created exam
 */
export const createExam = async (examData) => {
  try {
    const response = await api.post('/instructors/exams', examData);
    return {
      success: true,
      data: response,
      message: 'Exam created successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create exam',
    };
  }
};

/**
 * Update existing exam
 * @param {number} examId - Exam ID
 * @param {Object} examData - Updated exam information
 * @returns {Promise<Object>} Updated exam
 */
export const updateExam = async (examId, examData) => {
  try {
    const response = await api.put(`/instructors/exams/${examId}`, examData);
    return {
      success: true,
      data: response,
      message: 'Exam updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update exam',
    };
  }
};

/**
 * Delete exam
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteExam = async (examId) => {
  try {
    const response = await api.delete(`/instructors/exams/${examId}`);
    return {
      success: true,
      data: response,
      message: 'Exam deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete exam',
    };
  }
};

/**
 * Get exam attempts for an exam
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} List of exam attempts
 */
export const getExamAttempts = async (examId) => {
  try {
    const response = await api.get(`/instructors/exams/${examId}/attempts`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exam attempts',
    };
  }
};

// ==========================================
// AI-POWERED QUESTION GENERATION (NEW)
// ==========================================

const formatAiError = (error) => {
  // Log full axios-style error details for debugging
  console.error('AI generation error', {
    message: error?.message,
    status: error?.response?.status,
    statusText: error?.response?.statusText,
    data: error?.response?.data,
  });

  const status = error?.response?.status;
  const data = error?.response?.data;
  const backendMessage = typeof data === 'string' ? data : data?.detail || data?.message;

  // Distinguish common cases
  if (!error?.response) {
    return 'AI service unreachable. Please ensure the AI service is running.';
  }
  if (backendMessage && backendMessage.toLowerCase().includes('api key not configured')) {
    return 'AI service error: API key is missing or not configured.';
  }
  if (status === 429 || (backendMessage && backendMessage.toLowerCase().includes('quota'))) {
    return 'AI service error: Gemini quota exceeded or rate limited. Try again later.';
  }
  // Fallback to backend-provided message when available
  if (backendMessage) {
    return `AI service error: ${backendMessage}`;
  }
  return `AI service error (status ${status || 'unknown'})`;
};

/**
 * Generate AI questions for exam (Preview only - does not save)
 * @param {number} examId - Exam ID
 * @param {Object} aiParams - AI generation parameters
 * @param {string} aiParams.courseName - Course name for context
 * @param {string} aiParams.topic - Topic for questions
 * @param {string} aiParams.difficulty - Difficulty level (easy|medium|hard)
 * @param {number} aiParams.numberOfQuestions - Number of questions to generate
 * @returns {Promise<Object>} Generated questions (not saved)
 */
export const aiGenerateQuestionsPreview = async (examId, aiParams) => {
  try {
    const response = await api.post(`/instructors/exams/${examId}/ai-generate-preview`, aiParams);
    return {
      success: true,
      data: response,
      message: 'AI questions generated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: formatAiError(error),
    };
  }
};

/**
 * Generate and save AI questions for exam
 * @param {number} examId - Exam ID
 * @param {Object} aiParams - AI generation parameters
 * @param {string} aiParams.courseName - Course name for context
 * @param {string} aiParams.topic - Topic for questions
 * @param {string} aiParams.difficulty - Difficulty level (easy|medium|hard)
 * @param {number} aiParams.numberOfQuestions - Number of questions to generate
 * @returns {Promise<Object>} Generated and saved questions
 */
export const aiGenerateAndSaveQuestions = async (examId, aiParams) => {
  try {
    const response = await api.post(`/instructors/exams/${examId}/ai-generate-save`, aiParams);
    return {
      success: true,
      data: response,
      message: `Successfully generated and saved ${response.count} questions`,
    };
  } catch (error) {
    return {
      success: false,
      error: formatAiError(error),
    };
  }
};

// ==========================================
// QUESTION MANAGEMENT (MANUAL)
// ==========================================

/**
 * Get exam questions (Instructor view - includes correct answers)
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} List of questions with answers
 */
export const getExamQuestionsForInstructor = async (examId) => {
  try {
    const response = await api.get(`/questions/exam/${examId}/instructor`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch questions',
    };
  }
};

/**
 * Create manual question
 * @param {number} examId - Exam ID
 * @param {Object} questionData - Question information
 * @param {string} questionData.questionText - Question text
 * @param {string} questionData.optionA - Option A
 * @param {string} questionData.optionB - Option B
 * @param {string} questionData.optionC - Option C
 * @param {string} questionData.optionD - Option D
 * @param {string} questionData.correctOption - Correct option (A|B|C|D)
 * @param {number} questionData.marks - Marks for question
 * @returns {Promise<Object>} Created question
 */
export const createQuestion = async (examId, questionData) => {
  try {
    const response = await api.post(`/questions/exam/${examId}`, questionData);
    return {
      success: true,
      data: response,
      message: 'Question added successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to create question',
    };
  }
};

/**
 * Update question
 * @param {number} questionId - Question ID
 * @param {Object} questionData - Updated question information
 * @returns {Promise<Object>} Updated question
 */
export const updateQuestion = async (questionId, questionData) => {
  try {
    const response = await api.put(`/questions/${questionId}`, questionData);
    return {
      success: true,
      data: response,
      message: 'Question updated successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to update question',
    };
  }
};

/**
 * Delete question
 * @param {number} questionId - Question ID
 * @returns {Promise<Object>} Deletion confirmation
 */
export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/questions/${questionId}`);
    return {
      success: true,
      data: response,
      message: 'Question deleted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to delete question',
    };
  }
};

// ==========================================
// STUDENT EXAM PARTICIPATION
// ==========================================

/**
 * Get available exams for student
 * @returns {Promise<Object>} List of available exams
 */
export const getStudentExams = async () => {
  try {
    const response = await api.get('/students/exams');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exams',
    };
  }
};

/**
 * Get exam details for student (without answers)
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Exam details
 */
export const getStudentExamDetails = async (examId) => {
  try {
    const response = await api.get(`/students/exams/${examId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exam details',
    };
  }
};

/**
 * Get exam questions for student (without correct answers)
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} List of questions without answers
 */
export const getExamQuestionsForStudent = async (examId) => {
  try {
    const response = await api.get(`/questions/exam/${examId}/student`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exam questions',
    };
  }
};

/**
 * Submit exam answers
 * @param {number} examId - Exam ID
 * @param {Object} attemptData - Exam attempt data
 * @param {Array} attemptData.answers - Array of answers
 * @returns {Promise<Object>} Exam results
 */
export const submitExam = async (examId, attemptData) => {
  try {
    const response = await api.post(`/students/exams/${examId}/submit`, attemptData);
    return {
      success: true,
      data: response,
      message: 'Exam submitted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to submit exam',
    };
  }
};

/**
 * Start exam attempt
 * @param {number} examId - Exam ID
 * @returns {Promise<Object>} Exam attempt details
 */
export const startExamAttempt = async (examId) => {
  try {
    const response = await api.get(`/exam-submissions/start/${examId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to start exam',
    };
  }
};

/**
 * Submit exam attempt
 * @param {number} examId - Exam ID
 * @param {Object} submissionData - Submission data with answers
 * @returns {Promise<Object>} Exam results
 */
export const submitExamAttempt = async (examId, submissionData) => {
  try {
    const response = await api.post(`/exam-submissions/submit/${examId}`, submissionData);
    return {
      success: true,
      data: response,
      message: 'Exam submitted successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to submit exam',
    };
  }
};

// ==========================================
// STUDENT PERFORMANCE
// ==========================================

/**
 * Get student's exam results
 * @returns {Promise<Object>} List of exam results
 */
export const getMyExamResults = async () => {
  try {
    const response = await api.get('/performance/my-results');
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch exam results',
    };
  }
};

/**
 * Get detailed result for specific exam attempt
 * @param {number} attemptId - Exam attempt ID
 * @returns {Promise<Object>} Detailed exam result
 */
export const getExamAttemptDetails = async (attemptId) => {
  try {
    const response = await api.get(`/performance/attempt/${attemptId}`);
    return {
      success: true,
      data: response,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to fetch attempt details',
    };
  }
};
