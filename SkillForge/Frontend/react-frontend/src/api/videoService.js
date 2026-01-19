import apiClient from './apiClient';

<<<<<<< HEAD
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
=======
export const getCourseVideos = async (courseId) => {
  return await apiClient.get(`/courses/${courseId}/videos`);
};

export const addVideoLink = async (courseId, videoData) => {
  return await apiClient.post(`/courses/${courseId}/videos/link`, videoData);
};

export const uploadVideo = async (courseId, formData) => {
  return await apiClient.post(`/courses/${courseId}/videos/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteVideo = async (courseId, videoId) => {
  return await apiClient.delete(`/courses/${courseId}/videos/${videoId}`);
};
>>>>>>> TempBranch
