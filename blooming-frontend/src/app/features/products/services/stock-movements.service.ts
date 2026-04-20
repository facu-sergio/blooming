import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { StockMovementListResponse } from '../models/stock-movement.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StockMovementsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/products`;

  private readonly _stockMovements = signal<StockMovementListResponse | null>(null);
  private readonly _isLoadingStockMovements = signal(false);

  readonly stockMovements = this._stockMovements.asReadonly();
  readonly isLoadingStockMovements = this._isLoadingStockMovements.asReadonly();

  async getStockMovements(variantId: number, page = 1, pageSize = 20): Promise<void> {
    this._isLoadingStockMovements.set(true);
    try {
      const params = new HttpParams()
        .set('pageNumber', String(page))
        .set('pageSize', String(pageSize));

      const result = await firstValueFrom(
        this.http.get<StockMovementListResponse>(
          `${this.baseUrl}/variants/${variantId}/stock-movements`,
          { params }
        )
      );
      this._stockMovements.set(result);
    } finally {
      this._isLoadingStockMovements.set(false);
    }
  }

  clearMovements(): void {
    this._stockMovements.set(null);
  }
}
