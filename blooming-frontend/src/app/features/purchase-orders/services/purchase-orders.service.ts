import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  CreatePurchaseOrderDto,
  CreatePurchaseOrderResult,
  PurchaseOrderDetail,
  PurchaseOrderListItem,
  PurchaseOrderListFilters,
  PagedPurchaseOrdersResult,
} from '../models/purchase-order.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PurchaseOrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/purchase-orders`;

  private readonly _purchaseOrders = signal<PurchaseOrderListItem[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _selectedOrder = signal<PurchaseOrderDetail | null>(null);
  private readonly _totalCount = signal(0);

  readonly purchaseOrders = this._purchaseOrders.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly totalCount = this._totalCount.asReadonly();

  async loadAll(supplierId?: string): Promise<void> {
    this._isLoading.set(true);
    try {
      let params = new HttpParams();
      if (supplierId) params = params.set('supplierId', supplierId);
      const result = await firstValueFrom(
        this.http.get<PagedPurchaseOrdersResult>(this.baseUrl, { params })
      );
      this._purchaseOrders.set(result.items);
      this._totalCount.set(result.totalCount);
    } finally {
      this._isLoading.set(false);
    }
  }

  async getPurchaseOrdersPaged(filters: PurchaseOrderListFilters): Promise<void> {
    this._isLoading.set(true);
    try {
      let params = new HttpParams()
        .set('page', filters.page.toString())
        .set('pageSize', filters.pageSize.toString());
      if (filters.supplierId) params = params.set('supplierId', filters.supplierId);
      if (filters.fromDate) params = params.set('fromDate', filters.fromDate);
      if (filters.toDate) params = params.set('toDate', filters.toDate);

      const result = await firstValueFrom(
        this.http.get<PagedPurchaseOrdersResult>(this.baseUrl, { params })
      );
      this._purchaseOrders.set(result.items);
      this._totalCount.set(result.totalCount);
    } finally {
      this._isLoading.set(false);
    }
  }

  async getById(id: number): Promise<PurchaseOrderDetail> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.get<PurchaseOrderDetail>(`${this.baseUrl}/${id}`)
      );
      this._selectedOrder.set(result);
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async create(dto: CreatePurchaseOrderDto): Promise<CreatePurchaseOrderResult> {
    this._isLoading.set(true);
    try {
      return await firstValueFrom(
        this.http.post<CreatePurchaseOrderResult>(this.baseUrl, dto)
      );
    } finally {
      this._isLoading.set(false);
    }
  }

  clearSelectedOrder(): void {
    this._selectedOrder.set(null);
  }
}
