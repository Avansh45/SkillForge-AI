import apiClient from '../api/apiClient';

export const assignmentService = {
  getCourseAssignments: (courseId) => apiClient.get(`/assignments/course/${courseId}`),
  
  getAssignmentById: (assignmentId) => apiClient.get(`/assignments/${assignmentId}`),
  
  createAssignment: (assignmentData) => apiClient.post('/assignments', assignmentData),
  
  updateAssignment: (assignmentId, assignmentData) => apiClient.put(`/assignments/${assignmentId}`, assignmentData),
  
  deleteAssignment: (assignmentId) => apiClient.delete(`/assignments/${assignmentId}`),
  
  submitAssignment: (assignmentId, formData) =>
    apiClient.post(`/submissions/assignment/${assignmentId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  getSubmissions: (assignmentId) => apiClient.get(`/submissions/assignment/${assignmentId}`),
  
  gradeSubmission: (submissionId, gradeData) => apiClient.put(`/submissions/${submissionId}/grade`, gradeData),
};

export default assignmentService;
