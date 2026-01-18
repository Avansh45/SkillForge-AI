import apiClient from './apiClient';

export const examService = {
  getAllExams: () => apiClient.get('/exams'),
  
  getExamById: (examId) => apiClient.get(`/exams/${examId}`),
  
  createExam: (examData) => apiClient.post('/exams', examData),
  
  updateExam: (examId, examData) => apiClient.put(`/exams/${examId}`, examData),
  
  deleteExam: (examId) => apiClient.delete(`/exams/${examId}`),
  
  getExamQuestions: (examId) => apiClient.get(`/exams/${examId}/questions`),
  
  addQuestion: (examId, questionData) => apiClient.post(`/exams/${examId}/questions`, questionData),
  
  updateQuestion: (examId, questionId, questionData) => apiClient.put(`/exams/${examId}/questions/${questionId}`, questionData),
  
  deleteQuestion: (examId, questionId) => apiClient.delete(`/exams/${examId}/questions/${questionId}`),
  
  startExam: (examId) => apiClient.post(`/exams/${examId}/start`),
  
  submitExam: (examId, answers) => apiClient.post(`/exams/${examId}/submit`, answers),
  
  getExamResults: (attemptId) => apiClient.get(`/exams/attempts/${attemptId}/results`),
  
  getStudentExamHistory: () => apiClient.get('/exams/student/history'),
  
  generateAIQuestions: (data) => apiClient.post('/exams/generate-questions', data),
};

export default examService;
