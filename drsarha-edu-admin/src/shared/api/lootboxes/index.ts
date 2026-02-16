import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Lootbox } from '@/shared/models/Lootbox';
import type { BaseQueryParams, PaginatedResponse } from '../types';

export const lootboxesApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<Lootbox>>(
      API.getLootboxes,
      { params }
    );
    return data;
  },
  getById: async (id: string) => {
    const { data } = await axiosInstance.get<Lootbox>(API.getLootboxById(id));
    return data;
  },
  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post<Lootbox>(
      API.createLootbox,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  },
  update: async (id: string, formData: FormData) => {
    const { data } = await axiosInstance.put<Lootbox>(
      API.updateLootbox(id),
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return data;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteLootbox(id));
  },
};
