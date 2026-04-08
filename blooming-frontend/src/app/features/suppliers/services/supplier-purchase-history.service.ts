import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { PurchaseOrderDetail, PurchaseOrderListItem } from '../../purchase-orders/models/purchase-order.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SupplierPurchaseHistoryService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/purchase-orders`;

  private readonly _purchaseOrders = signal<PurchaseOrderListItem[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _isLoadingDetail = signal(false);

  readonly purchaseOrders = this._purchaseOrders.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly isLoadingDetail = this._isLoadingDetail.asReadonly();

  async loadBySupplierId(supplierId: string): Promise<void> {
    this._isLoading.set(true);
    try {
      const params = new HttpParams().set('supplierId', supplierId);
      const result = await firstValueFrom(
        this.http.get<PurchaseOrderListItem[]>(this.baseUrl, { params })
      );
      this._purchaseOrders.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async getOrderDetail(orderId: number): Promise<PurchaseOrderDetail> {
    this._isLoadingDetail.set(true);
    try {
      return await firstValueFrom(
        this.http.get<PurchaseOrderDetail>(`${this.baseUrl}/${orderId}`)
      );
    } finally {
      this._isLoadingDetail.set(false);
    }
  }

  clear(): void {
    this._purchaseOrders.set([]);
  }
}
