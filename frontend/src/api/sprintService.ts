import axiosInstance from './axiosInstance';

export const sprintService = {
  getSprints: async () => {
    const response = await axiosInstance.get('/sprints');
    return response.data;
  },
  getActiveSprint: async () => {
    const response = await axiosInstance.get('/sprints/active');
    return response.data;
  },
  createSprint: async (data: any) => {
    const response = await axiosInstance.post('/sprints', data);
    return response.data;
  },
  updateSprint: async (id: string, data: any) => {
    const response = await axiosInstance.patch(`/sprints/${id}`, data);
    return response.data;
  },
};
