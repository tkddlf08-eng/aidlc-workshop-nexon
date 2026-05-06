import { create } from 'zustand';
import apiClient from '@/shared/api/client';
import type { MenuFormData, CategoryFormData } from '@/shared/types/menu';

// Backend response types (snake_case)
interface BackendCategory {
  id: number;
  store_id: number;
  name: string;
  sort_order: number;
  created_at: string;
}

interface BackendMenu {
  id: number;
  category_id: number;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_sold_out: boolean;
  created_at: string;
}

// Frontend display types
export interface DisplayCategory {
  id: number;
  name: string;
  sortOrder: number;
}

export interface DisplayMenu {
  id: number;
  name: string;
  price: number;
  description: string | null;
  categoryId: number;
  imageUrl: string | null;
  sortOrder: number;
  isSoldOut: boolean;
}

interface MenuState {
  categories: DisplayCategory[];
  menus: DisplayMenu[];
  selectedCategoryId: number | null;
  isLoading: boolean;
  storeId: number | null;

  setStoreId: (storeId: number) => void;
  loadCategories: () => Promise<void>;
  loadMenus: (categoryId?: number) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: number, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  createMenu: (data: MenuFormData) => Promise<void>;
  updateMenu: (id: number, data: MenuFormData) => Promise<void>;
  deleteMenu: (id: number) => Promise<void>;
  selectCategory: (categoryId: number | null) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  menus: [],
  selectedCategoryId: null,
  isLoading: false,
  storeId: null,

  setStoreId: (storeId: number) => {
    set({ storeId });
  },

  loadCategories: async () => {
    const { storeId } = get();
    if (!storeId) return;
    const response = await apiClient.get<BackendCategory[]>('/api/categories', {
      params: { store_id: storeId },
    });
    const categories: DisplayCategory[] = response.data.map((c) => ({
      id: c.id,
      name: c.name,
      sortOrder: c.sort_order,
    }));
    set({ categories });
  },

  loadMenus: async (categoryId?: number) => {
    set({ isLoading: true });
    const params: Record<string, unknown> = {};
    if (categoryId) params.category_id = categoryId;
    const response = await apiClient.get<BackendMenu[]>('/api/menus', { params });
    const menus: DisplayMenu[] = response.data.map((m) => ({
      id: m.id,
      name: m.name,
      price: m.price,
      description: m.description,
      categoryId: m.category_id,
      imageUrl: m.image_url,
      sortOrder: m.sort_order,
      isSoldOut: m.is_sold_out,
    }));
    set({ menus, isLoading: false });
  },

  createCategory: async (data: CategoryFormData) => {
    await apiClient.post('/api/categories', { name: data.name, sort_order: data.sortOrder });
    await get().loadCategories();
  },

  updateCategory: async (id: number, data: CategoryFormData) => {
    await apiClient.put(`/api/categories/${id}`, { name: data.name, sort_order: data.sortOrder });
    await get().loadCategories();
  },

  deleteCategory: async (id: number) => {
    await apiClient.delete(`/api/categories/${id}`);
    await get().loadCategories();
    if (get().selectedCategoryId === id) {
      set({ selectedCategoryId: null, menus: [] });
    }
  },

  createMenu: async (data: MenuFormData) => {
    // Step 1: Create menu with JSON
    const response = await apiClient.post<BackendMenu>('/api/menus', {
      name: data.name,
      price: data.price,
      description: data.description || null,
      category_id: Number(data.categoryId),
    });

    // Step 2: Upload image if provided
    if (data.image) {
      const formData = new FormData();
      formData.append('file', data.image);
      await apiClient.post(`/api/menus/${response.data.id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
    }

    await get().loadMenus(get().selectedCategoryId || undefined);
    await get().loadCategories();
  },

  updateMenu: async (id: number, data: MenuFormData) => {
    await apiClient.put(`/api/menus/${id}`, {
      name: data.name,
      price: data.price,
      description: data.description || null,
      category_id: Number(data.categoryId),
    });

    // Upload image if provided
    if (data.image) {
      const formData = new FormData();
      formData.append('file', data.image);
      await apiClient.post(`/api/menus/${id}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });
    }

    await get().loadMenus(get().selectedCategoryId || undefined);
  },

  deleteMenu: async (id: number) => {
    await apiClient.delete(`/api/menus/${id}`);
    await get().loadMenus(get().selectedCategoryId || undefined);
    await get().loadCategories();
  },

  selectCategory: (categoryId: number | null) => {
    set({ selectedCategoryId: categoryId });
    if (categoryId) {
      get().loadMenus(categoryId);
    } else {
      set({ menus: [] });
    }
  },
}));
