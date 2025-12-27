import apiClient from './apiClient';

export const getPlatformOverview = async () => {
  return await apiClient.get('/admin/overview');
};

export const getAllUsers = async () => {
  return await apiClient.get('/admin/users');
};

export const updateUserRole = async (userId, role) => {
  return await apiClient.put(`/admin/users/${userId}/role`, { role });
};

export const deleteUser = async (userId) => {
  return await apiClient.delete(`/admin/users/${userId}`);
};
