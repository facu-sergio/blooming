export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
}

export interface PagedCategoriesResult {
  items: Category[];
  totalCount: number;
  page: number;
  pageSize: number;
}
