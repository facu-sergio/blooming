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

/**
 * Pedido resumido para el historial del cliente.
 * [Historia 3.3] Campos mínimos para vista de detalle.
 * Epic 4: considerar agregar cantidad de ítems, número de pedido, etc.
 */
export interface CustomerOrder {
  id: number;
  createdAt: string;
  status: string;
  total: number;
}

/**
 * Métricas resumidas del cliente.
 * [Historia 3.3] Métricas básicas para perfil de cliente.
 * Epic 4: considerar agregar ticket promedio, frecuencia de compra, etc.
 */
export interface CustomerMetrics {
  totalOrders: number;
  totalSpent: number;
}
