import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  DailySalesMetrics,
  MonthlySalesMetrics,
  TopProduct,
  StockAlert,
  MonthlyMargin,
} from '../models/dashboard-metrics.models';

@Injectable({ providedIn: 'root' })
export class DashboardMetricsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/dashboard`;

  private readonly _dailySales = signal<DailySalesMetrics>({ orderCount: 0, totalAmount: 0 });
  private readonly _monthlySales = signal<MonthlySalesMetrics>({ orderCount: 0, totalAmount: 0 });
  private readonly _topProducts = signal<TopProduct[]>([]);
  private readonly _stockAlerts = signal<StockAlert[]>([]);
  private readonly _monthlyMargin = signal<MonthlyMargin>({ revenue: 0, cost: 0, margin: 0 });
  private readonly _isLoading = signal(false);

  readonly dailySales = this._dailySales.asReadonly();
  readonly monthlySales = this._monthlySales.asReadonly();
  readonly topProducts = this._topProducts.asReadonly();
  readonly stockAlerts = this._stockAlerts.asReadonly();
  readonly monthlyMargin = this._monthlyMargin.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    try {
      await Promise.all([
        this.loadDailySales(),
        this.loadMonthlySales(),
        this.loadTopProducts(),
        this.loadStockAlerts(),
        this.loadMonthlyMargin(),
      ]);
    } finally {
      this._isLoading.set(false);
    }
  }

  private async loadDailySales(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<DailySalesMetrics>(`${this.baseUrl}/daily-sales`)
    );
    this._dailySales.set(result);
  }

  private async loadMonthlySales(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<MonthlySalesMetrics>(`${this.baseUrl}/monthly-sales`)
    );
    this._monthlySales.set(result);
  }

  private async loadTopProducts(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<TopProduct[]>(`${this.baseUrl}/top-products`)
    );
    this._topProducts.set(result);
  }

  private async loadStockAlerts(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<StockAlert[]>(`${this.baseUrl}/stock-alerts`)
    );
    this._stockAlerts.set(result);
  }

  private async loadMonthlyMargin(): Promise<void> {
    const result = await firstValueFrom(
      this.http.get<MonthlyMargin>(`${this.baseUrl}/monthly-margin`)
    );
    this._monthlyMargin.set(result);
  }
}
