export interface Category {
  id: string;
  name: string;
  sortOrder: number;
  menuCount: number;
}

export interface Menu {
  id: string;
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  categoryName: string;
  imageUrl?: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MenuFormData {
  name: string;
  price: number;
  description?: string;
  categoryId: string;
  image?: File;
}

export interface CategoryFormData {
  name: string;
  sortOrder?: number;
}

export interface UpdateSortOrderRequest {
  sortOrder: number;
}

export interface ImageUploadResponse {
  imageUrl: string;
}
