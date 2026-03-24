import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { CreateOrderDto, CreateOrderResult } from '../models/order.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/orders`;

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  async createOrder(dto: CreateOrderDto): Promise<CreateOrderResult> {
    this._isLoading.set(true);
    try {
      return await firstValueFrom(this.http.post<CreateOrderResult>(this.baseUrl, dto));
    } finally {
      this._isLoading.set(false);
    }
  }
}
