import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  ChangeOrderStatusRequest,
  ChangeOrderStatusResult,
  ConfirmOrderResult,
  CreateOrderDto,
  CreateOrderResult,
  OrderDetailDto,
  OrderListFilters,
  OrderListItemDto,
  OrderStatus,
  PagedOrdersResult,
  getValidTransitions,
} from '../models/order.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _orders = signal<OrderListItemDto[]>([]);
  readonly orders = this._orders.asReadonly();

  private readonly _totalCount = signal(0);
  readonly totalCount = this._totalCount.asReadonly();

  private readonly _selectedOrder = signal<OrderDetailDto | null>(null);
  readonly selectedOrder = this._selectedOrder.asReadonly();

  async getOrders(filters: OrderListFilters): Promise<PagedOrdersResult> {
    this._isLoading.set(true);
    try {
      let params = new HttpParams()
        .set('page', filters.page.toString())
        .set('pageSize', filters.pageSize.toString());

      if (filters.status) params = params.set('status', filters.status);
      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
      if (filters.toDate) params = params.set('toDate', filters.toDate);
      if (filters.customerId !== undefined) params = params.set('customerId', filters.customerId.toString());

      const result = await firstValueFrom(
        this.http.get<PagedOrdersResult>(this.baseUrl, { params })
      );
      this._orders.set(result.items);
      this._totalCount.set(result.totalCount);
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async createOrder(dto: CreateOrderDto): Promise<CreateOrderResult> {
    this._isLoading.set(true);
    try {
      return await firstValueFrom(this.http.post<CreateOrderResult>(this.baseUrl, dto));
    } finally {
      this._isLoading.set(false);
    }
  }

  async getOrder(orderId: number): Promise<OrderDetailDto> {
    this._isLoading.set(true);
    try {
      const order = await firstValueFrom(
        this.http.get<OrderDetailDto>(`${this.baseUrl}/${orderId}`)
      );
      this._selectedOrder.set(order);
      return order;
    } finally {
      this._isLoading.set(false);
    }
  }

  async confirmOrder(orderId: number): Promise<ConfirmOrderResult> {
    this._isLoading.set(true);
    try {
      return await firstValueFrom(
        this.http.post<ConfirmOrderResult>(`${this.baseUrl}/${orderId}/confirm`, {})
      );
    } finally {
      this._isLoading.set(false);
    }
  }

  async changeOrderStatus(orderId: number, newStatus: OrderStatus, deliveredAt?: string): Promise<ChangeOrderStatusResult> {
    this._isLoading.set(true);
    try {
      const body: ChangeOrderStatusRequest = { newStatus };
      if (deliveredAt) body.deliveredAt = deliveredAt;
      const result = await firstValueFrom(
        this.http.post<ChangeOrderStatusResult>(`${this.baseUrl}/${orderId}/change-status`, body)
      );
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async cancelOrder(orderId: number): Promise<ChangeOrderStatusResult> {
    this._isLoading.set(true);
    try {
      return await firstValueFrom(
        this.http.post<ChangeOrderStatusResult>(`${this.baseUrl}/${orderId}/cancel`, {})
      );
    } finally {
      this._isLoading.set(false);
    }
  }

  getValidTransitionsForCurrentOrder(): OrderStatus[] {
    const order = this._selectedOrder();
    if (!order) return [];
    return getValidTransitions(order.statusKey);
  }

  clearSelectedOrder(): void {
    this._selectedOrder.set(null);
  }
}
