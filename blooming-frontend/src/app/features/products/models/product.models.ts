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


export interface SearchFilters {
  searchTerm?: string;
  category?: string;
  size?: string;
  color?: string;
}
