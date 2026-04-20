export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  notes?: string;
}

export interface SupplierListFilters {
  searchTerm?: string;
  page: number;
  pageSize: number;
}

export interface PagedSuppliersResult {
  items: Supplier[];
  totalCount: number;
  page: number;
  pageSize: number;
}
