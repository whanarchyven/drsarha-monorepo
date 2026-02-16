import { API } from '../api';
import { axiosInstance } from '../axios';
import type { InteractiveMatch } from '@/shared/models/InteractiveMatch';
import type { BaseQueryParams, PaginatedResponse } from '../types';

export const interactiveMatchesApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<
      PaginatedResponse<InteractiveMatch>
    >(API.getInteractiveMatches, {
      params: { forcePublish: true, ...params },
    });
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<InteractiveMatch>(
      API.getInteractiveMatchById(id),
      {
        params: { forcePublish: true },
      }
    );
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post<InteractiveMatch>(
      API.createInteractiveMatch,
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
    const { data } = await axiosInstance.put<InteractiveMatch>(
      API.updateInteractiveMatch(id),
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  getStatistics: async (id: string) => {
    const { data } = await axiosInstance.get<{
      views: number;
      completed: number;
      correct_answers: number;
      incorrect_answers: number;
    }>(API.getInteractiveMatchStats(id), {
      params: { forcePublish: true },
    });
    return data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteInteractiveMatch(id));
  },
};
