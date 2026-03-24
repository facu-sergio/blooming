export interface ProductVariantMeasurement {
  name: string;
  valueInCm: number;
}

export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold?: number;
  measurements?: ProductVariantMeasurement[];
}

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  createdAt: string;
  variants: ProductVariant[];
}

export interface CreateVariantDto {
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
  lowStockThreshold?: number;
  measurements?: ProductVariantMeasurement[];
}

export interface UpdateVariantDto {
  id?: number;
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
  lowStockThreshold?: number;
  measurements?: ProductVariantMeasurement[];
}

export interface ProductResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  imageUrl?: string;
  createdAt: string;
  variants: VariantResponse[];
}

export interface VariantResponse {
  id: number;
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold?: number;
  measurements: ProductVariantMeasurement[];
}

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

export interface SearchFilters {
  searchTerm?: string;
  category?: string;
  size?: string;
  color?: string;
}
