import { API } from '../api';
import { axiosInstance } from '../axios';
import type { ClinicAtlas } from '@/shared/models/ClinicAtlas';
import type { BaseQueryParams, PaginatedResponse } from '../types';

export const clinicAtlasesApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<ClinicAtlas>>(
      API.getClinicAtlases,
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<ClinicAtlas>(
      API.getClinicAtlasById(id)
    );
    return data;
  },

  create: (data: FormData) =>
    axiosInstance.post<ClinicAtlas>(API.createClinicAtlas, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  update: (id: string, data: FormData) =>
    axiosInstance.put<ClinicAtlas>(API.updateClinicAtlas(id), data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteClinicAtlas(id));
  },

  like: async (id: string) => {
    const { data } = await axiosInstance.post<ClinicAtlas>(
      API.likeClinicAtlas(id)
    );
    return data;
  },

  unlike: async (id: string) => {
    const { data } = await axiosInstance.delete<ClinicAtlas>(
      API.unlikeClinicAtlas(id)
    );
    return data;
  },

  addComment: async (id: string, comment: string) => {
    const { data } = await axiosInstance.post<ClinicAtlas>(
      API.addClinicAtlasComment(id),
      { comment }
    );
    return data;
  },

  removeComment: async (id: string, commentId: string) => {
    const { data } = await axiosInstance.delete<ClinicAtlas>(
      API.removeClinicAtlasComment(id, commentId)
    );
    return data;
  },
};
