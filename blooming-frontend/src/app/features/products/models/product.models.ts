export interface ProductVariant {
  id: number;
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
  sellingPrice: number;
  stock: number;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  imageUrl?: string;
  createdAt: string;
  variants: ProductVariant[];
}

export interface CreateVariantDto {
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
}

export interface UpdateVariantDto {
  id?: number;
  size: string;
  color: string;
  costPrice: number;
  markupPercentage: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  category: string;
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
}
