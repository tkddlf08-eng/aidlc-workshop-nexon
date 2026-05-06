import { create } from 'zustand';
import apiClient from '@/shared/api/client';
import type { Category, Menu, MenuFormData, CategoryFormData } from '@/shared/types/menu';

interface MenuState {
  categories: Category[];
  menus: Menu[];
  selectedCategoryId: string | null;
  isLoading: boolean;

  loadCategories: () => Promise<void>;
  loadMenus: (categoryId?: string) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createMenu: (data: MenuFormData) => Promise<void>;
  updateMenu: (id: string, data: MenuFormData) => Promise<void>;
  deleteMenu: (id: string) => Promise<void>;
  reorderCategory: (id: string, newOrder: number) => Promise<void>;
  reorderMenu: (id: string, newOrder: number) => Promise<void>;
  selectCategory: (categoryId: string | null) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  menus: [],
  selectedCategoryId: null,
  isLoading: false,

  loadCategories: async () => {
    const response = await apiClient.get<Category[]>('/api/categories');
    set({ categories: response.data });
  },

  loadMenus: async (categoryId?: string) => {
    set({ isLoading: true });
    const params = categoryId ? { category_id: categoryId } : {};
    const response = await apiClient.get<Menu[]>('/api/menus', { params });
    set({ menus: response.data, isLoading: false });
  },

  createCategory: async (data: CategoryFormData) => {
    await apiClient.post('/api/categories', data);
    await get().loadCategories();
  },

  updateCategory: async (id: string, data: CategoryFormData) => {
    await apiClient.put(`/api/categories/${id}`, data);
    await get().loadCategories();
  },

  deleteCategory: async (id: string) => {
    await apiClient.delete(`/api/categories/${id}`);
    await get().loadCategories();
    if (get().selectedCategoryId === id) {
      set({ selectedCategoryId: null, menus: [] });
    }
  },

  createMenu: async (data: MenuFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    formData.append('categoryId', data.categoryId);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);

    await apiClient.post('/api/menus', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    await get().loadMenus(get().selectedCategoryId || undefined);
    await get().loadCategories();
  },

  updateMenu: async (id: string, data: MenuFormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', String(data.price));
    formData.append('categoryId', data.categoryId);
    if (data.description) formData.append('description', data.description);
    if (data.image) formData.append('image', data.image);

    await apiClient.put(`/api/menus/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
    await get().loadMenus(get().selectedCategoryId || undefined);
  },

  deleteMenu: async (id: string) => {
    await apiClient.delete(`/api/menus/${id}`);
    await get().loadMenus(get().selectedCategoryId || undefined);
    await get().loadCategories();
  },

  reorderCategory: async (id: string, newOrder: number) => {
    await apiClient.put(`/api/categories/${id}`, { sortOrder: newOrder });
    await get().loadCategories();
  },

  reorderMenu: async (id: string, newOrder: number) => {
    await apiClient.patch(`/api/menus/${id}/sort`, { sortOrder: newOrder });
    await get().loadMenus(get().selectedCategoryId || undefined);
  },

  selectCategory: (categoryId: string | null) => {
    set({ selectedCategoryId: categoryId });
    if (categoryId) {
      get().loadMenus(categoryId);
    } else {
      set({ menus: [] });
    }
  },
}));
