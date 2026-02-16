import { create } from 'zustand';
import { categoriesApi } from '@/shared/api/categories';
import type { Category } from '@/shared/models/Category';
import type { BaseQueryParams } from '@/shared/api/types';

interface CategoriesState {
  items: Category[];
  isLoading: boolean;
  fetchCategories: (params?: BaseQueryParams) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  items: [],
  isLoading: false,
  fetchCategories: async (params) => {
    set({ isLoading: true });
    try {
      const response = await categoriesApi.getAll(params);
      set({
        items: response.items || [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching categories:', error);
      set({ isLoading: false });
    }
  },
}));
