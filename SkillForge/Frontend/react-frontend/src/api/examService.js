import apiClient from './apiClient';

// Instructor exam endpoints
export const getInstructorExams = async () => {
  return await apiClient.get('/instructors/exams');
};

export const createExam = async (examData) => {
  return await apiClient.post('/instructors/exams', examData);
};

export const updateExam = async (examId, examData) => {
  return await apiClient.put(`/instructors/exams/${examId}`, examData);
};

export const deleteExam = async (examId) => {
  return await apiClient.delete(`/instructors/exams/${examId}`);
};

export const getExamAttempts = async (examId) => {
  return await apiClient.get(`/instructors/exams/${examId}/attempts`);
};

// Student exam endpoints
export const getStudentExams = async () => {
  return await apiClient.get('/students/exams');
};

export const getExamDetails = async (examId) => {
  return await apiClient.get(`/students/exams/${examId}`);
};

export const submitExam = async (examId, attemptData) => {
  return await apiClient.post(`/students/exams/${examId}/submit`, attemptData);
};

// Question management endpoints (NEW - for instructor)
export const getExamQuestionsForInstructor = async (examId) => {
  return await apiClient.get(`/questions/exam/${examId}/instructor`);
};

export const createQuestion = async (examId, questionData) => {
  return await apiClient.post(`/questions/exam/${examId}`, questionData);
};

export const updateQuestion = async (questionId, questionData) => {
  return await apiClient.put(`/questions/${questionId}`, questionData);
};

export const deleteQuestion = async (questionId) => {
  return await apiClient.delete(`/questions/${questionId}`);
};

// Student question endpoints (for taking exams)
export const getExamQuestionsForStudent = async (examId) => {
  return await apiClient.get(`/questions/exam/${examId}/student`);
};

