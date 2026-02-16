import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Prize } from '@/shared/models/Prize';
import type { BaseQueryParams, PaginatedResponse } from '../types';

interface PrizeQueryParams extends BaseQueryParams {
  level?: number;
}

interface CreatePrizeData {
  name: string;
  description: string;
  level: number;
  price: number;
  image?: File;
}

interface UpdatePrizeData {
  name?: string;
  description?: string;
  level?: number;
  price?: number;
  image?: File;
}

export const prizesApi = {
  getAll: async (params?: PrizeQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<Prize>>(
      API.getPrizes,
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<Prize>(API.getPrizeById(id));
    return data;
  },

  getByLevel: async (level: number) => {
    const { data } = await axiosInstance.get<Prize[]>(
      API.getPrizesByLevel(level)
    );
    return data;
  },

  create: async (prizeData: CreatePrizeData) => {
    const formData = new FormData();
    formData.append('name', prizeData.name);
    formData.append('description', prizeData.description);
    formData.append('level', prizeData.level.toString());
    formData.append('price', prizeData.price.toString());

    if (prizeData.image) {
      formData.append('image', prizeData.image);
    }

    const { data } = await axiosInstance.post<Prize>(
      API.createPrize,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return data;
  },

  update: async (id: string, prizeData: UpdatePrizeData) => {
    const formData = new FormData();

    if (prizeData.name !== undefined) {
      formData.append('name', prizeData.name);
    }
    if (prizeData.description !== undefined) {
      formData.append('description', prizeData.description);
    }
    if (prizeData.level !== undefined) {
      formData.append('level', prizeData.level.toString());
    }
    if (prizeData.price !== undefined) {
      formData.append('price', prizeData.price.toString());
    }
    if (prizeData.image) {
      formData.append('image', prizeData.image);
    }

    const { data } = await axiosInstance.put<Prize>(
      API.updatePrize(id),
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
    await axiosInstance.delete(API.deletePrize(id));
  },
};
