export interface Category {
  id: number;
  name: string;
  sortOrder: number;
  menuCount?: number;
}

export interface Menu {
  id: number;
  name: string;
  price: number;
  description?: string;
  categoryId: number;
  categoryName?: string;
  imageUrl?: string;
  sortOrder: number;
  isSoldOut: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  image_url: string;
}
