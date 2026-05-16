import axiosInstance from './axiosInstance';

export const authService = {
  login: async (data: any) => {
    const response = await axiosInstance.post('/auth/login', data);
    return response.data;
  },
  register: async (data: any) => {
    const response = await axiosInstance.post('/auth/register', data);
    return response.data;
  },
  getMe: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
