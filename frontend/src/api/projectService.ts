import axiosInstance from './axiosInstance';

export const projectService = {
  getProjects: async () => {
    const response = await axiosInstance.get('/projects');
    return response.data;
  },
  getProject: async (id: string) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },
  createProject: async (data: { name: string, key: string, description?: string }) => {
    const response = await axiosInstance.post('/projects', data);
    return response.data;
  },
  assignMembers: async (
    projectId: string,
    data: { teamLeadId?: string | null; teamMemberIds?: string[] }
  ) => {
    const response = await axiosInstance.post(`/projects/${projectId}/assign-members`, data);
    return response.data;
  },
};
