export type OrderStatus = 'Pending' | 'Confirmed' | 'Shipped' | 'Delivered' | 'Cancelled';

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Shipped', 'Delivered', 'Cancelled'],
  Shipped: ['Delivered', 'Cancelled'],
  Delivered: [],
  Cancelled: [],
};

export function mapOrderStatusToSpanish(status: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    Pending: 'Pendiente',
    Confirmed: 'Confirmado',
    Shipped: 'Enviado',
    Delivered: 'Entregado',
    Cancelled: 'Cancelado',
  };
  return map[status];
}

export function getValidTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
}

export interface ChangeOrderStatusRequest {
  newStatus: OrderStatus;
  deliveredAt?: string;
}

export interface ChangeOrderStatusResult {
  orderId: number;
  status: string;
  changedAt: string;
}

export interface CreateOrderItemDto {
  productVariantId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: number;
  items: CreateOrderItemDto[];
  shippingAddress?: string;
  notes?: string;
}

export interface CreateOrderResult {
  orderId: number;
}

export interface OrderItemFormEntry {
  productVariantId: number;
  variantLabel: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderItemDetailDto {
  id: number;
  productVariantId: number;
  productName: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderDetailDto {
  id: number;
  customerId: number;
  customerName: string;
  status: string;
  statusKey: OrderStatus;
  total: number;
  discount?: number;
  shippingAddress?: string;
  notes?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  items: OrderItemDetailDto[];
}

export interface ConfirmOrderResult {
  orderId: number;
  status: string;
  confirmedAt: string;
}

export interface OrderListItemDto {
  id: number;
  customerId: number;
  customerName: string;
  status: string;
  statusKey: OrderStatus;
  total: number;
  createdAt: string;
  deliveredAt?: string;
}

export interface PagedOrdersResult {
  items: OrderListItemDto[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface OrderListFilters {
  status?: OrderStatus;
  fromDate?: string;
  toDate?: string;
  customerId?: number;
  page: number;
  pageSize: number;
}
