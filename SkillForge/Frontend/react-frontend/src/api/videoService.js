import apiClient from './apiClient';

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
