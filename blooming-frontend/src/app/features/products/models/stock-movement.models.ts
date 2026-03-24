export interface StockMovement {
  id: number;
  movementType: 'In' | 'Out';
  quantity: number;
  orderId?: number;
  purchaseOrderId?: number;
  createdAt: string;
}

export interface StockMovementListResponse {
  items: StockMovement[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
