import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { DashboardMetricsService } from './dashboard-metrics.service';
import {
  DailySalesMetrics,
  MonthlySalesMetrics,
  TopProduct,
  StockAlert,
  MonthlyMargin,
} from '../models/dashboard-metrics.models';

const mockDailySales: DailySalesMetrics = { orderCount: 3, totalAmount: 45000 };
const mockMonthlySales: MonthlySalesMetrics = { orderCount: 25, totalAmount: 380000 };
const mockTopProducts: TopProduct[] = [
  { productName: 'Remera Básica', imageUrl: null, unitsSold: 42 },
  { productName: 'Jeans Slim', imageUrl: 'https://example.com/img.jpg', unitsSold: 30 },
];
const mockStockAlerts: StockAlert[] = [
  { productName: 'Remera Básica', size: 'M', color: 'Blanco', currentStock: 2, threshold: 5 },
];
const mockMonthlyMargin: MonthlyMargin = { revenue: 380000, cost: 150000, margin: 230000 };

describe('DashboardMetricsService', () => {
  let service: DashboardMetricsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardMetricsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with zeroed dailySales signal', () => {
    expect(service.dailySales()).toEqual({ orderCount: 0, totalAmount: 0 });
  });

  it('should start with zeroed monthlySales signal', () => {
    expect(service.monthlySales()).toEqual({ orderCount: 0, totalAmount: 0 });
  });

  it('should start with empty topProducts signal', () => {
    expect(service.topProducts()).toEqual([]);
  });

  it('should start with empty stockAlerts signal', () => {
    expect(service.stockAlerts()).toEqual([]);
  });

  it('should start with zeroed monthlyMargin signal', () => {
    expect(service.monthlyMargin()).toEqual({ revenue: 0, cost: 0, margin: 0 });
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  describe('loadAll()', () => {
    function flushAllRequests(): void {
      httpMock.expectOne((r) => r.url.includes('/api/dashboard/daily-sales')).flush(mockDailySales);
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/monthly-sales'))
        .flush(mockMonthlySales);
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/top-products'))
        .flush(mockTopProducts);
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/stock-alerts'))
        .flush(mockStockAlerts);
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/monthly-margin'))
        .flush(mockMonthlyMargin);
    }

    it('should call all 5 dashboard endpoints', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
    });

    it('should update dailySales signal after loadAll', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
      expect(service.dailySales()).toEqual(mockDailySales);
    });

    it('should update monthlySales signal after loadAll', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
      expect(service.monthlySales()).toEqual(mockMonthlySales);
    });

    it('should update topProducts signal after loadAll', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
      expect(service.topProducts()).toEqual(mockTopProducts);
    });

    it('should update stockAlerts signal after loadAll', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
      expect(service.stockAlerts()).toEqual(mockStockAlerts);
    });

    it('should update monthlyMargin signal after loadAll', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
      expect(service.monthlyMargin()).toEqual(mockMonthlyMargin);
    });

    it('should set isLoading to false after successful loadAll', async () => {
      const loadPromise = service.loadAll();
      flushAllRequests();
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed request', async () => {
      const loadPromise = service.loadAll().catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/daily-sales'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/monthly-sales'))
        .flush(mockMonthlySales);
      httpMock.expectOne((r) => r.url.includes('/api/dashboard/top-products')).flush([]);
      httpMock.expectOne((r) => r.url.includes('/api/dashboard/stock-alerts')).flush([]);
      httpMock
        .expectOne((r) => r.url.includes('/api/dashboard/monthly-margin'))
        .flush(mockMonthlyMargin);
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });
  });
});
