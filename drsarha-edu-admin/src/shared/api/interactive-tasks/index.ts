import { API } from '../api';
import { axiosInstance } from '../axios';
import type { InteractiveTask } from '@/shared/models/InteractiveTask';
import type { BaseQueryParams, PaginatedResponse } from '../types';

export const interactiveTasksApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<InteractiveTask>
    >(API.getInteractiveTasks, {
      params: { forcePublish: true, ...params },
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<InteractiveTask>(
      API.getInteractiveTaskById(id),
      {
        params: { forcePublish: true },
      }
    );
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post<InteractiveTask>(
      API.createInteractiveTask,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  update: async (id: string, formData: FormData) => {
    console.log(formData.entries(), 'FORM DATA');
    const { data } = await axiosInstance.put<InteractiveTask>(
      API.updateInteractiveTask(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteInteractiveTask(id));
  },
};
