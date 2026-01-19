import apiClient from './apiClient';

<<<<<<< HEAD
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
=======
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

// AI Question Generation endpoints (for instructors)
export const generateAIQuestions = async (requestData) => {
  // requestData should contain: courseName, topic, difficulty, numberOfQuestions
  const { courseName, topic, difficulty, numberOfQuestions } = requestData;
  
  // Return only the questions array for backward compatibility
  const response = await apiClient.post('/instructors/exams/0/ai-generate-preview', {
    courseName,
    topic,
    difficulty,
    numberOfQuestions
  });
  
  return { questions: response.questions };
};

export const saveAIQuestions = async (examId, questions) => {
  return await apiClient.post(`/instructors/exams/${examId}/ai-generate-save`, questions);
};

>>>>>>> TempBranch
