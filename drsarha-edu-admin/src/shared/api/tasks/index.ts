import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Task } from '@/shared/models/TaskGroup';

export const tasksApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get<Task[]>(API.getAllAdminTasks);
    return data;
  },
  create: async (taskData: Omit<Task, '_id' | 'created_at' | 'updated_at'>) => {
    const { data } = await axiosInstance.post<Task>(
      API.createAdminTask,
      taskData
    );
    return data;
  },
  update: async (
    id: string,
    taskData: Partial<Omit<Task, '_id' | 'created_at' | 'updated_at'>>
  ) => {
    const { data } = await axiosInstance.put<Task>(
      API.updateAdminTask(id),
      taskData
    );
    return data;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteAdminTask(id));
  },
  getById: async (id: string) => {
    const { data } = await axiosInstance.get<Task>(API.getAdminTaskById(id));
    return data;
  },

  completeTaskDirectly: async (taskId: string, userIds: string[]) => {
    const { data } = await axiosInstance.post(API.completeTaskDirectly, {
      taskId,
      usersIds: userIds,
    });
    return data;
  },
};
