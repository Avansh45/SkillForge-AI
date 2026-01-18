import apiClient from './apiClient';

export const videoService = {
  getAllVideos: () => apiClient.get('/videos'),
  
  getVideoById: (videoId) => apiClient.get(`/videos/${videoId}`),
  
  getCourseVideos: (courseId) => apiClient.get(`/videos/course/${courseId}`),
  
  uploadVideo: (courseId, formData) => 
    apiClient.post(`/videos/course/${courseId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  updateVideo: (videoId, videoData) => apiClient.put(`/videos/${videoId}`, videoData),
  
  deleteVideo: (videoId) => apiClient.delete(`/videos/${videoId}`),
  
  streamVideo: (videoId) => `http://localhost:8080/api/videos/${videoId}/stream`,
};

export default videoService;
