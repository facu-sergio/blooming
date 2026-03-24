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
