import { API } from '../api';
import { axiosInstance } from '../axios';
import type { PaginatedResponse } from '../types';

export interface PrizeClaim {
  _id: string;
  userId: string;
  prizeId: string;
  claimedAt: string;
  status: 'pending' | 'claimed' | 'backlog' | 'refund' | 'canceled';
  transactionId: string;
  userInfo: {
    _id: string;
    email: string;
    name: string;
    avatar: string;
    stars: number;
    exp: number;
    level: number;
  };
  prizeInfo: {
    _id: string;
    name: string;
    image: string;
    description: string;
    price: number;
  };
}

export const prizeClaimsApi = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<PrizeClaim>> => {
    const { data } = await axiosInstance.get<PaginatedResponse<PrizeClaim>>(
      API.getPrizeClaims,
      { params }
    );
    return data;
  },

  getById: async (id: string): Promise<PrizeClaim> => {
    const { data } = await axiosInstance.get<PrizeClaim>(
      API.getPrizeClaimById(id)
    );
    return data;
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'claimed' | 'backlog' | 'refund' | 'canceled'
  ): Promise<PrizeClaim> => {
    const { data } = await axiosInstance.put<PrizeClaim>(
      API.updatePrizeClaimStatus(id),
      { status }
    );
    return data;
  },

  approveRefund: async (
    id: string,
    adminId?: string
  ): Promise<{ success: true; restoredStars: number }> => {
    const { data } = await axiosInstance.post<{
      success: true;
      restoredStars: number;
    }>(
      API.approvePrizeClaimRefund(id),
      undefined,
      adminId ? { headers: { authorization: adminId } } : undefined
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(API.deletePrizeClaim(id));
  },
};
