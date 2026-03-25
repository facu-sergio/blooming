import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  ConfirmOrderResult,
  CreateOrderDto,
  CreateOrderResult,
  OrderDetailDto,
} from '../models/order.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  private readonly _selectedOrder = signal<OrderDetailDto | null>(null);
  readonly selectedOrder = this._selectedOrder.asReadonly();

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

  clearSelectedOrder(): void {
    this._selectedOrder.set(null);
  }
}
