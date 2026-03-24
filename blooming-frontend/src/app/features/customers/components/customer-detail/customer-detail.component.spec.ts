import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { CustomersService } from '../../services/customers.service';
import { Customer, CustomerOrder, CustomerMetrics } from '../../models/customer.models';

// Tests del servicio que alimenta CustomerDetailComponent.
// Siguiendo la regla del project-context: no testear componentes "tontos" que solo renderizan
// Signals — testear el servicio que los alimenta.

const mockCustomer: Customer = {
  id: 42,
  name: 'Ana García',
  phone: '1122334455',
  address: 'Av. Corrientes 1234',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockOrders: CustomerOrder[] = [
  { id: 1, createdAt: '2026-03-01T00:00:00Z', status: 'Entregado', total: 5000 },
  { id: 2, createdAt: '2026-03-15T00:00:00Z', status: 'Confirmado', total: 3200 },
];

const mockMetrics: CustomerMetrics = {
  totalOrders: 2,
  totalSpent: 8200,
};

describe('CustomersService — historial y métricas (Historia 3.3)', () => {
  let service: CustomersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '42' } } },
        },
      ],
    });
    service = TestBed.inject(CustomersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ── getCustomerOrders ──────────────────────────────────────────────────────

  describe('getCustomerOrders()', () => {
    it('debería GET /api/customers/:id/orders y actualizar el signal customerOrders', async () => {
      const loadPromise = service.getCustomerOrders(42);

      const req = httpMock.expectOne((r) => r.url.includes('/api/customers/42/orders'));
      expect(req.request.method).toBe('GET');
      req.flush({ orders: mockOrders });

      await loadPromise;
      expect(service.customerOrders()).toEqual(mockOrders);
    });

    it('debería actualizar customerOrders con lista vacía cuando el cliente no tiene pedidos (AC #2)', async () => {
      const loadPromise = service.getCustomerOrders(42);

      httpMock.expectOne((r) => r.url.includes('/api/customers/42/orders')).flush({ orders: [] });

      await loadPromise;
      expect(service.customerOrders()).toEqual([]);
    });

    it('debería setear isLoadingDetail a false después de cargar pedidos', async () => {
      const loadPromise = service.getCustomerOrders(42);
      httpMock
        .expectOne((r) => r.url.includes('/api/customers/42/orders'))
        .flush({ orders: mockOrders });
      await loadPromise;
      expect(service.isLoadingDetail()).toBe(false);
    });

    it('debería setear isLoadingDetail a false si falla la carga', async () => {
      const loadPromise = service.getCustomerOrders(42).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/customers/42/orders'))
        .flush('error', { status: 404, statusText: 'Not Found' });
      await loadPromise;
      expect(service.isLoadingDetail()).toBe(false);
    });
  });

  // ── getCustomerMetrics ─────────────────────────────────────────────────────

  describe('getCustomerMetrics()', () => {
    it('debería GET /api/customers/:id/metrics y actualizar el signal customerMetrics', async () => {
      const loadPromise = service.getCustomerMetrics(42);

      const req = httpMock.expectOne((r) => r.url.includes('/api/customers/42/metrics'));
      expect(req.request.method).toBe('GET');
      req.flush(mockMetrics);

      await loadPromise;
      expect(service.customerMetrics()).toEqual(mockMetrics);
    });

    it('debería mostrar 0 pedidos y $0 gastado cuando el cliente no tiene pedidos (AC #2)', async () => {
      const emptyMetrics: CustomerMetrics = { totalOrders: 0, totalSpent: 0 };
      const loadPromise = service.getCustomerMetrics(42);

      httpMock
        .expectOne((r) => r.url.includes('/api/customers/42/metrics'))
        .flush(emptyMetrics);

      await loadPromise;
      expect(service.customerMetrics()?.totalOrders).toBe(0);
      expect(service.customerMetrics()?.totalSpent).toBe(0);
    });

    it('debería setear isLoadingDetail a false después de cargar métricas', async () => {
      const loadPromise = service.getCustomerMetrics(42);
      httpMock
        .expectOne((r) => r.url.includes('/api/customers/42/metrics'))
        .flush(mockMetrics);
      await loadPromise;
      expect(service.isLoadingDetail()).toBe(false);
    });
  });

  // ── clearCustomerDetail ────────────────────────────────────────────────────

  describe('clearCustomerDetail()', () => {
    it('debería limpiar customerOrders y customerMetrics al salir del detalle', async () => {
      // Cargar datos primero
      const p1 = service.getCustomerOrders(42);
      httpMock.expectOne((r) => r.url.includes('/orders')).flush({ orders: mockOrders });
      await p1;

      const p2 = service.getCustomerMetrics(42);
      httpMock.expectOne((r) => r.url.includes('/metrics')).flush(mockMetrics);
      await p2;

      expect(service.customerOrders().length).toBe(2);
      expect(service.customerMetrics()).not.toBeNull();

      // Limpiar
      service.clearCustomerDetail();

      expect(service.customerOrders()).toEqual([]);
      expect(service.customerMetrics()).toBeNull();
    });
  });
});
