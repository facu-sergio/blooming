export interface ProductVariantMeasurement {
  name: string;
  valueInCm: number;
}

export interface CreateVariantDto {
  sizeId: number;
  colorId: number;
  costPrice: number;
  markupPercentage: number;
  lowStockThreshold?: number;
  description?: string;
  measurements?: ProductVariantMeasurement[];
}

export interface UpdateVariantDto {
  id?: number;
  sizeId: number;
  colorId: number;
  costPrice: number;
  markupPercentage: number;
  lowStockThreshold?: number;
  description?: string;
  removeVariantImage?: boolean;
  measurements?: ProductVariantMeasurement[];
}

export interface ProductResponse {
  id: number;
  name: string;
  categoryId: number;
  categoryName: string;
  sizeSystemId?: number;
  imageUrl?: string;
  createdAt: string;
  variants: VariantResponse[];
}

export interface VariantResponse {
  id: number;
  sizeId: number;
  sizeName: string;
  sizeDescription?: string;
  colorId: number;
  colorName: string;
  costPrice: number;
  markupPercentage: number;
  sellingPrice: number;
  stock: number;
  lowStockThreshold?: number;
  imageUrl?: string;
  description?: string;
  measurements: ProductVariantMeasurement[];
}

export interface SearchFilters {
  searchTerm?: string;
  category?: string;
  sizeId?: number;
  colorId?: number;
}

export interface ProductListFilters {
  searchTerm?: string;
  category?: string;
  sizeId?: number;
  colorId?: number;
  page: number;
  pageSize: number;
}

export interface PagedProductsResult {
  items: ProductResponse[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateProductInlineDto {
  name: string;
  categoryId: number;
  sizeId: number;
  colorId: number;
  markupPercentage: number;
  lowStockThreshold?: number;
}

export interface PriceHistoryItem {
  id: number;
  costPrice: number;
  sellingPrice: number;
  markupPercentage: number;
  purchaseOrderId?: number;
  createdAt: string;
}
