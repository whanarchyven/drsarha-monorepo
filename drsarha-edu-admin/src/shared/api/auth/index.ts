import { API } from '../api';
import { axiosInstance } from '../axios';
import type { BaseQueryParams } from '../types';
import type { PaginatedResponse } from '../types';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'moderator';
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  status: number;
  adminUser: AdminUser;
  token: string;
  message: string;
}

export interface CreateAdminUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'moderator';
}

export interface UpdateAdminUserRequest {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'moderator';
}

export const authApi = {
  createUser: async (userData: CreateAdminUserRequest) => {
    const { data } = await axiosInstance.post<AdminUser>(
      API.createAdminUser,
      userData,
      {
        headers: {},
      }
    );
    return data;
  },

  getUsers: async (params?: BaseQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<AdminUser>>(
      API.getAdminUsers,
      { params }
    );
    return data;
  },

  getUserById: async (id: string) => {
    const { data } = await axiosInstance.get<AdminUser>(
      API.getAdminUserById(id)
    );
    return data;
  },

  updateUser: async (id: string, userData: UpdateAdminUserRequest) => {
    const { data } = await axiosInstance.put<AdminUser>(
      API.updateAdminUser(id),
      userData,
      {
        headers: {},
      }
    );
    return data;
  },

  deleteUser: async (id: string) => {
    await axiosInstance.delete(API.deleteAdminUser(id));
  },
};
