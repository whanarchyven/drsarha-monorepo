import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Nozology } from '@/shared/models/Nozology';
import type { BaseQueryParams, PaginatedResponse } from '../types';
import { InteractiveTask } from '@/shared/models/InteractiveTask';

export const nozologiesApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<Nozology[]>(API.getNozologies, {
      params,
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<Nozology>(API.getNozologyById(id));
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post<any>(
      API.createNozology,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  update: async (id: string, formData: FormData | Partial<Nozology>) => {
    const isFormData = formData instanceof FormData;
    const { data } = await axiosInstance.put<Nozology>(
      API.updateNozology(id),
      formData,
      isFormData
        ? {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        : undefined
    );
    return data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteNozology(id));
  },
};
