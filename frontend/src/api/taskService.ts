import axiosInstance from './axiosInstance';

export const taskService = {
  getTasks: async (params: any) => {
    const response = await axiosInstance.get('/tasks', { params });
    return response.data;
  },
  getTaskById: async (id: string) => {
    const response = await axiosInstance.get(`/tasks/${id}`);
    return response.data;
  },
  createTask: async (data: any) => {
    const response = await axiosInstance.post('/tasks', data);
    return response.data;
  },
  updateTask: async (id: string, data: any) => {
    const response = await axiosInstance.put(`/tasks/${id}`, data);
    return response.data;
  },
  deleteTask: async (id: string) => {
    const response = await axiosInstance.delete(`/tasks/${id}`);
    return response.data;
  },
  uploadAttachment: async (taskId: string, formData: FormData) => {
    const response = await axiosInstance.post(`/tasks/${taskId}/attachments`, formData);
    return response.data;
  },
  downloadAttachment: async (id: string) => {
    const response = await axiosInstance.get(`/tasks/attachments/${id}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
