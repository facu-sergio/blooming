export interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface UpdateCustomerDto {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}
