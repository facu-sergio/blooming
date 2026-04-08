export interface Supplier {
  id: string;
  name: string;
  contactInfo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contactInfo?: string;
  notes?: string;
}

export interface UpdateSupplierDto {
  name: string;
  contactInfo?: string;
  notes?: string;
}
