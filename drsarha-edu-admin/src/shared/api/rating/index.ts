import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Nozology } from '@/shared/models/Nozology';
import type { BaseQueryParams, PaginatedResponse } from '../types';
import { RatingDetails, RatingPaginatedResponse } from '@/shared/models/Rating';

export const ratingsApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<RatingPaginatedResponse>(
      API.getRatings,
      {
        params,
      }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<RatingDetails>(
      API.getRatingById(id)
    );
    return data;
  },

  manageStars: async (id: string, data: { stars: number }) => {
    const { data: response } = await axiosInstance.put(
      API.manageStars(id),
      data
    );
    return response;
  },
};
