import { axiosInstance } from '../axios';
import type { BaseQueryParams, PaginatedResponse } from '../types';

export type PinReportStatus = 'new' | 'approved' | 'rejected';

export interface PinReportType {
  _id: string;
  name: string;
}

export interface PinReportEmbedUser {
  _id: string;
  name?: string;
  email?: string;
  avatar?: string | null;
}

export interface PinReportEmbedPin {
  _id: string;
  title?: string;
  image?: string | null;
  author?: string;
}

export interface PinReport {
  _id: string;
  pinId: string;
  pinAuthor?: string;
  type: string; // type id
  reporter: string; // reporter id
  status: PinReportStatus;
  comment?: string | null;
  admin_comment?: string | null;
  fine?: number;
  reward?: number;
  createdAt?: string;
  updatedAt?: string;
  embed?: {
    reporter?: PinReportEmbedUser;
    pinAuthor?: PinReportEmbedUser;
    pin?: PinReportEmbedPin;
    type?: PinReportType;
  };
}

export interface GetReportsQuery extends BaseQueryParams {
  status?: PinReportStatus;
}

export interface ApproveReportBody {
  adminComment: string;
  fine?: number;
  reward?: number;
}

export interface RejectReportBody {
  adminComment: string;
}

export interface CreateReportTypeBody {
  name: string;
}

export interface UpdateReportTypeBody {
  name: string;
}

const DEFAULT_ADMIN_ID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ADMIN_ID) ||
  (typeof process !== 'undefined' && process.env.ADMIN_ID) ||
  '';

export const pinReportsApi = {
  getReports: async (params: GetReportsQuery) => {
    const { data } = await axiosInstance.get<PaginatedResponse<PinReport>>(
      '/pin-reports/',
      { params }
    );
    return data;
  },

  approve: async (
    reportId: string,
    body: ApproveReportBody,
    adminIdOverride?: string
  ) => {
    const { data } = await axiosInstance.post(
      `/pin-reports/${reportId}/approve/`,
      body,
      { headers: { 'admin-id': adminIdOverride ?? DEFAULT_ADMIN_ID } }
    );
    return data;
  },

  reject: async (
    reportId: string,
    body: RejectReportBody,
    adminIdOverride?: string
  ) => {
    const { data } = await axiosInstance.post(
      `/pin-reports/${reportId}/reject/`,
      body,
      { headers: { 'admin-id': adminIdOverride ?? DEFAULT_ADMIN_ID } }
    );
    return data;
  },

  // Report Types
  getReportTypes: async (params: BaseQueryParams) => {
    const { data } = await axiosInstance.get<PaginatedResponse<PinReportType>>(
      '/pin-report-types/',
      { params }
    );
    return data;
  },

  createReportType: async (body: CreateReportTypeBody) => {
    const { data } = await axiosInstance.post<PinReportType>(
      '/pin-report-types/',
      body
    );
    return data;
  },

  updateReportType: async (id: string, body: UpdateReportTypeBody) => {
    const { data } = await axiosInstance.put<PinReportType>(
      `/pin-report-types/${id}/`,
      body
    );
    return data;
  },

  deleteReportType: async (id: string) => {
    await axiosInstance.delete(`/pin-report-types/${id}/`);
  },

  // Admin delete pin
  adminDeletePin: async (
    args: { pinId: string; adminComment: string; fine?: number },
    adminIdOverride?: string
  ) => {
    const { data } = await axiosInstance.post(
      '/pin-reports/admin/delete-pin/',
      args,
      { headers: { 'admin-id': adminIdOverride ?? DEFAULT_ADMIN_ID } }
    );
    return data;
  },
};
