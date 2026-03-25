export interface CreateOrderItemDto {
  productVariantId: number;
  quantity: number;
}

export interface CreateOrderDto {
  customerId: number;
  items: CreateOrderItemDto[];
  shippingAddress?: string;
  notes?: string;
  estimatedDeliveryDate?: string;
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
  total: number;
  discount?: number;
  shippingAddress?: string;
  notes?: string;
  estimatedDeliveryDate?: string;
  createdAt: string;
  confirmedAt?: string;
  items: OrderItemDetailDto[];
}

export interface ConfirmOrderResult {
  orderId: number;
  status: string;
  confirmedAt: string;
}
