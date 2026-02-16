import { API } from '../api';
import { axiosInstance } from '../axios';
import type { Tag } from '@/shared/models/Tag';
import type { BaseQueryParams, PaginatedResponse } from '../types';

export const tagsApi = {
  getAll: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<Tag>>(
      API.getTags,
      { params }
    );
    return data;
  },

  getById: async (id: string) => {
    const { data } = await axiosInstance.get<Tag>(API.getTagById(id));
    return data;
  },

  create: async (tagData: { name: string }) => {
    const { data } = await axiosInstance.post<Tag>(API.createTag, tagData);
    return data;
  },

  update: async (id: string, tagData: { name: string }) => {
    const { data } = await axiosInstance.put<Tag>(API.updateTag(id), tagData);
    return data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteTag(id));
  },

  getPopular: async (params?: { limit?: number }) => {
    const { data } = await axiosInstance.get<Tag[]>(API.getPopularTags, {
      params,
    });
    return data;
  },
};
