import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { StockMovementsService } from './stock-movements.service';
import { StockMovementListResponse } from '../models/stock-movement.models';

const mockMovement = {
  id: 1,
  movementType: 'In' as const,
  quantity: 10,
  purchaseOrderId: 5,
  createdAt: '2026-03-24T00:00:00Z',
};

const mockListResponse: StockMovementListResponse = {
  items: [mockMovement],
  totalCount: 1,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 1,
};

describe('StockMovementsService', () => {
  let service: StockMovementsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StockMovementsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with null stockMovements signal', () => {
    expect(service.stockMovements()).toBeNull();
  });

  it('should start with isLoadingStockMovements false', () => {
    expect(service.isLoadingStockMovements()).toBe(false);
  });

  describe('getStockMovements()', () => {
    it('should GET variants/:id/stock-movements and update stockMovements signal', async () => {
      const loadPromise = service.getStockMovements(1);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/products/variants/1/stock-movements')
      );
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('pageNumber')).toBe('1');
      expect(req.request.params.get('pageSize')).toBe('20');
      req.flush(mockListResponse);

      await loadPromise;
      expect(service.stockMovements()).toEqual(mockListResponse);
    });

    it('should pass custom page and pageSize params', async () => {
      const loadPromise = service.getStockMovements(2, 3, 10);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/products/variants/2/stock-movements')
      );
      expect(req.request.params.get('pageNumber')).toBe('3');
      expect(req.request.params.get('pageSize')).toBe('10');
      req.flush(mockListResponse);

      await loadPromise;
    });

    it('should set isLoadingStockMovements to false after success', async () => {
      const loadPromise = service.getStockMovements(1);
      httpMock
        .expectOne((r) => r.url.includes('/api/products/variants/1/stock-movements'))
        .flush(mockListResponse);
      await loadPromise;
      expect(service.isLoadingStockMovements()).toBe(false);
    });

    it('should set isLoadingStockMovements to false after error', async () => {
      const loadPromise = service.getStockMovements(1).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/products/variants/1/stock-movements'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;
      expect(service.isLoadingStockMovements()).toBe(false);
    });
  });

  describe('clearMovements()', () => {
    it('should reset stockMovements signal to null', async () => {
      const loadPromise = service.getStockMovements(1);
      httpMock
        .expectOne((r) => r.url.includes('/api/products/variants/1/stock-movements'))
        .flush(mockListResponse);
      await loadPromise;

      expect(service.stockMovements()).not.toBeNull();
      service.clearMovements();
      expect(service.stockMovements()).toBeNull();
    });
  });
});
