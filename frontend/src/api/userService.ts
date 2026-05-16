import axiosInstance from './axiosInstance';

export const userService = {
  getUsers: async () => {
    const response = await axiosInstance.get('/users');
    return response.data;
  },
  getProfile: async () => {
    const response = await axiosInstance.get('/users/profile');
    return response.data;
  },
  updateProfile: async (formData: FormData) => {
    const response = await axiosInstance.put('/users/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
