import apiClient from '../api/apiClient';

export const resourceService = {
  getCourseResources: (courseId) => apiClient.get(`/resources/course/${courseId}`),
  
  getResourceById: (resourceId) => apiClient.get(`/resources/${resourceId}`),
  
  uploadResource: (courseId, formData) =>
    apiClient.post(`/resources/course/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateResource: (resourceId, resourceData) => apiClient.put(`/resources/${resourceId}`, resourceData),
  
  deleteResource: (resourceId) => apiClient.delete(`/resources/${resourceId}`),
  
  downloadResource: (resourceId) =>
    apiClient.get(`/resources/${resourceId}/download`, {
      responseType: 'blob',
    }),
};

export default resourceService;
