export interface PurchaseOrderItemDetail {
  id: number;
  productVariantId: number;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitCostPrice: number;
  lineTotal: number;
}

export interface PurchaseOrderDetail {
  id: number;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: PurchaseOrderItemDetail[];
}

export interface PurchaseOrderItemSummary {
  productName: string;
  imageUrl?: string;
}

export interface PurchaseOrderListItem {
  id: number;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  items: PurchaseOrderItemSummary[];
}

export interface CreatePurchaseOrderItemDto {
  productVariantId: number;
  quantity: number;
  unitCostPrice: number;
}

export interface CreatePurchaseOrderDto {
  supplierId: string;
  items: CreatePurchaseOrderItemDto[];
  orderDate?: string;
}

export interface CreatePurchaseOrderResult {
  purchaseOrderId: number;
  totalAmount: number;
  createdAt: string;
}

export interface PurchaseOrderItemFormEntry {
  productVariantId: number;
  productName: string;
  variantLabel: string;
  quantity: number;
  unitCostPrice: number;
  lineTotal: number;
}
