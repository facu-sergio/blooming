export interface ProductVariantMeasurement {
  name: string;
  valueInCm: number;
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
  removeVariantImage?: boolean;
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
  imageUrl?: string;
  measurements: ProductVariantMeasurement[];
}


export interface SearchFilters {
  searchTerm?: string;
  category?: string;
  size?: string;
  color?: string;
}

export interface CreateProductInlineDto {
  name: string;
  categoryId: number;
  size: string;
  color: string;
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
