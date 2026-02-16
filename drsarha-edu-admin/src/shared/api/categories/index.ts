import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Category } from '@/shared/models/Category';
import type { BaseQueryParams, PaginatedResponse } from '../types';
import type { Nozology } from '@/shared/models/Nozology';

export const categoriesApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<Category>>(
      API.getCategories,
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<Category>(API.getCategoryById(id));
    return data;
  },

  getNozologiesByCategoryId: async (id: string) => {
    const { data } = await axiosInstance.get<Nozology[]>(
      API.getNozologiesByCategoryId(id)
    );
    return data;
  },

  create: async (formData: FormData) => {
    const { data } = await axiosInstance.post<any>(
      API.createCategory,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  update: async (id: string, formData: FormData | Partial<Category>) => {
    const isFormData = formData instanceof FormData;
    const { data } = await axiosInstance.put<Category>(
      API.updateCategory(id),
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
    await axiosInstance.delete(API.deleteCategory(id));
  },
};
