import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PurchaseOrdersService } from './purchase-orders.service';
import { PurchaseOrderListItem, PurchaseOrderDetail } from '../models/purchase-order.models';

const mockListItem: PurchaseOrderListItem = {
  id: 1,
  supplierId: '550e8400-e29b-41d4-a716-446655440000',
  supplierName: 'Mayorista ABC',
  orderDate: '2026-03-27T00:00:00Z',
  totalAmount: 5000,
  itemCount: 2,
  createdAt: '2026-03-27T00:00:00Z',
  items: [{ productName: 'Remera', imageUrl: undefined }],
};

const mockDetail: PurchaseOrderDetail = {
  id: 1,
  supplierId: '550e8400-e29b-41d4-a716-446655440000',
  supplierName: 'Mayorista ABC',
  orderDate: '2026-03-27T00:00:00Z',
  totalAmount: 5000,
  createdAt: '2026-03-27T00:00:00Z',
  updatedAt: '2026-03-27T00:00:00Z',
  items: [
    {
      id: 1,
      productVariantId: 10,
      productName: 'Remera',
      variantLabel: 'M Rojo',
      quantity: 5,
      unitCostPrice: 1000,
      lineTotal: 5000,
    },
  ],
};

describe('PurchaseOrdersService', () => {
  let service: PurchaseOrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PurchaseOrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty purchaseOrders signal', () => {
    expect(service.purchaseOrders()).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should start with selectedOrder null', () => {
    expect(service.selectedOrder()).toBeNull();
  });

  describe('loadAll()', () => {
    it('should GET /api/purchase-orders and update signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/purchase-orders'));
      expect(req.request.method).toBe('GET');
      req.flush({ items: [mockListItem], totalCount: 1, page: 1, pageSize: 1000 });

      await loadPromise;
      expect(service.purchaseOrders()).toEqual([mockListItem]);
    });

    it('should set isLoading to false after loadAll', async () => {
      const loadPromise = service.loadAll();
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders')).flush({ items: [], totalCount: 0, page: 1, pageSize: 1000 });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should pass supplierId as query param when provided', async () => {
      const supplierId = '550e8400-e29b-41d4-a716-446655440000';
      const loadPromise = service.loadAll(supplierId);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/purchase-orders') && r.params.get('supplierId') === supplierId
      );
      req.flush({ items: [mockListItem], totalCount: 1, page: 1, pageSize: 1000 });

      await loadPromise;
    });
  });

  describe('getById()', () => {
    it('should GET /api/purchase-orders/:id and update selectedOrder signal', async () => {
      const getPromise = service.getById(1);

      const req = httpMock.expectOne((r) => r.url.includes('/api/purchase-orders/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockDetail);

      const result = await getPromise;
      expect(result).toEqual(mockDetail);
      expect(service.selectedOrder()).toEqual(mockDetail);
    });
  });

  describe('create()', () => {
    it('should POST /api/purchase-orders with correct body', async () => {
      const dto = {
        supplierId: '550e8400-e29b-41d4-a716-446655440000',
        items: [{ productVariantId: 10, quantity: 5, unitCostPrice: 1000 }],
      };
      const createPromise = service.create(dto);

      const req = httpMock.expectOne(
        (r) => r.url.includes('/api/purchase-orders') && r.method === 'POST'
      );
      expect(req.request.body).toEqual(dto);
      req.flush({ purchaseOrderId: 1, totalAmount: 5000, createdAt: '2026-03-27T00:00:00Z' });

      const result = await createPromise;
      expect(result.purchaseOrderId).toBe(1);
      expect(result.totalAmount).toBe(5000);
    });

    it('should set isLoading to false after create', async () => {
      const createPromise = service.create({
        supplierId: '550e8400-e29b-41d4-a716-446655440000',
        items: [{ productVariantId: 1, quantity: 1, unitCostPrice: 100 }],
      });

      httpMock
        .expectOne((r) => r.url.includes('/api/purchase-orders') && r.method === 'POST')
        .flush({ purchaseOrderId: 1, totalAmount: 100, createdAt: '2026-03-27T00:00:00Z' });

      await createPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('clearSelectedOrder()', () => {
    it('should clear selectedOrder signal', async () => {
      const getPromise = service.getById(1);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders/1')).flush(mockDetail);
      await getPromise;

      expect(service.selectedOrder()).not.toBeNull();
      service.clearSelectedOrder();
      expect(service.selectedOrder()).toBeNull();
    });
  });
});
