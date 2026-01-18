import apiClient from '../api/apiClient';

export const examService = {
  getAllExams: () => apiClient.get('/exams'),
  
  getExamById: (examId) => apiClient.get(`/exams/${examId}`),
  
  createExam: (examData) => apiClient.post('/exams', examData),
  
  updateExam: (examId, examData) => apiClient.put(`/exams/${examId}`, examData),
  
  deleteExam: (examId) => apiClient.delete(`/exams/${examId}`),
  
  getExamQuestions: (examId) => apiClient.get(`/questions/exam/${examId}`),
  
  addQuestion: (questionData) => apiClient.post('/questions', questionData),
  
  updateQuestion: (questionId, questionData) => apiClient.put(`/questions/${questionId}`, questionData),
  
  deleteQuestion: (questionId) => apiClient.delete(`/questions/${questionId}`),
  
  startExam: (examId) => apiClient.post(`/exam-submissions/${examId}/start`),
  
  submitExam: (attemptId, answers) => apiClient.post(`/exam-submissions/${attemptId}/submit`, answers),
  
  getExamResults: (attemptId) => apiClient.get(`/exam-submissions/${attemptId}/results`),
  
  getStudentExamHistory: () => apiClient.get('/exam-submissions/student/history'),
  
  generateAIQuestions: async (data) => {
    const aiResponse = await fetch('http://localhost:8000/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!aiResponse.ok) {
      throw new Error('Failed to generate questions');
    }
    
    return aiResponse.json();
  },
};

export default examService;
