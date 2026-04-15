import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SupplierPurchaseHistoryService } from './supplier-purchase-history.service';
import { PurchaseOrderListItem, PurchaseOrderDetail } from '../../purchase-orders/models/purchase-order.models';

const supplierId = '550e8400-e29b-41d4-a716-446655440000';

const mockOrders: PurchaseOrderListItem[] = [
  {
    id: 1,
    supplierId,
    supplierName: 'Mayorista ABC',
    orderDate: '2026-03-01T00:00:00Z',
    totalAmount: 5000,
    itemCount: 2,
    createdAt: '2026-03-01T00:00:00Z',
    items: [
      { productName: 'Remera', imageUrl: undefined },
      { productName: 'Pantalón', imageUrl: undefined },
    ],
  },
  {
    id: 2,
    supplierId,
    supplierName: 'Mayorista ABC',
    orderDate: '2026-02-15T00:00:00Z',
    totalAmount: 3000,
    itemCount: 1,
    createdAt: '2026-02-15T00:00:00Z',
    items: [{ productName: 'Campera', imageUrl: 'https://example.com/campera.jpg' }],
  },
];

const mockDetail: PurchaseOrderDetail = {
  id: 1,
  supplierId,
  supplierName: 'Mayorista ABC',
  orderDate: '2026-03-01T00:00:00Z',
  totalAmount: 5000,
  createdAt: '2026-03-01T00:00:00Z',
  updatedAt: '2026-03-01T00:00:00Z',
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

describe('SupplierPurchaseHistoryService (Historia 5.3)', () => {
  let service: SupplierPurchaseHistoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SupplierPurchaseHistoryService);
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

  // ── loadBySupplierId ────────────────────────────────────────────────────────

  describe('loadBySupplierId()', () => {
    it('debería GET /api/purchase-orders con supplierId como query param (AC #1)', async () => {
      const loadPromise = service.loadBySupplierId(supplierId);

      const req = httpMock.expectOne(
        (r) =>
          r.url.includes('/api/purchase-orders') &&
          r.params.get('supplierId') === supplierId
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockOrders);

      await loadPromise;
      expect(service.purchaseOrders()).toEqual(mockOrders);
    });

    it('debería actualizar el signal purchaseOrders con la lista del proveedor (AC #1)', async () => {
      const loadPromise = service.loadBySupplierId(supplierId);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders')).flush(mockOrders);
      await loadPromise;

      expect(service.purchaseOrders().length).toBe(2);
      expect(service.purchaseOrders()[0].id).toBe(1);
    });

    it('debería dejar purchaseOrders vacío si el proveedor no tiene compras (AC #3)', async () => {
      const loadPromise = service.loadBySupplierId(supplierId);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders')).flush([]);
      await loadPromise;

      expect(service.purchaseOrders()).toEqual([]);
    });

    it('debería setear isLoading a false después de cargar', async () => {
      const loadPromise = service.loadBySupplierId(supplierId);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders')).flush(mockOrders);
      await loadPromise;

      expect(service.isLoading()).toBe(false);
    });

    it('debería setear isLoading a false si falla la carga', async () => {
      const loadPromise = service.loadBySupplierId(supplierId).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/purchase-orders'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;

      expect(service.isLoading()).toBe(false);
    });
  });

  // ── getOrderDetail ──────────────────────────────────────────────────────────

  describe('getOrderDetail()', () => {
    it('debería GET /api/purchase-orders/:id y retornar el detalle (AC #2)', async () => {
      const getPromise = service.getOrderDetail(1);

      const req = httpMock.expectOne((r) => r.url.includes('/api/purchase-orders/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockDetail);

      const result = await getPromise;
      expect(result).toEqual(mockDetail);
    });

    it('debería retornar ítems con variante, cantidad, precio unitario y total (AC #2)', async () => {
      const getPromise = service.getOrderDetail(1);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders/1')).flush(mockDetail);
      const result = await getPromise;

      expect(result.items.length).toBe(1);
      const item = result.items[0];
      expect(item.productName).toBe('Remera');
      expect(item.variantLabel).toBe('M Rojo');
      expect(item.quantity).toBe(5);
      expect(item.unitCostPrice).toBe(1000);
      expect(item.lineTotal).toBe(5000);
    });

    it('debería setear isLoadingDetail a false después de cargar detalle', async () => {
      const getPromise = service.getOrderDetail(1);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders/1')).flush(mockDetail);
      await getPromise;

      expect(service.isLoadingDetail()).toBe(false);
    });
  });

  // ── clear ───────────────────────────────────────────────────────────────────

  describe('clear()', () => {
    it('debería limpiar el signal purchaseOrders', async () => {
      const loadPromise = service.loadBySupplierId(supplierId);
      httpMock.expectOne((r) => r.url.includes('/api/purchase-orders')).flush(mockOrders);
      await loadPromise;

      expect(service.purchaseOrders().length).toBe(2);

      service.clear();

      expect(service.purchaseOrders()).toEqual([]);
    });
  });
});
