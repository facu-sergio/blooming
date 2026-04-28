import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrdersService } from './orders.service';
import {
  ChangeOrderStatusResult,
  ConfirmOrderResult,
  CreateOrderDto,
  CreateOrderResult,
  OrderDetailDto,
} from '../models/order.models';

const mockCreateOrderDto: CreateOrderDto = {
  customerId: 1,
  items: [
    { productVariantId: 5, quantity: 2 },
    { productVariantId: 8, quantity: 1 },
  ],
  shippingAddress: 'Av. Corrientes 1234',
  notes: 'Sin cuello',
};

const mockCreateOrderResult: CreateOrderResult = { orderId: 42 };

const mockOrderDetail: OrderDetailDto = {
  id: 42,
  customerId: 1,
  customerName: 'Ana García',
  status: 'Confirmado',
  statusKey: 'Confirmed',
  total: 5000,
  createdAt: '2026-03-24T10:00:00Z',
  confirmedAt: '2026-03-24T11:00:00Z',
  items: [
    {
      id: 1,
      productVariantId: 5,
      productName: 'Remera',
      variantLabel: 'M Azul',
      unitPrice: 2500,
      quantity: 2,
      lineTotal: 5000,
    },
  ],
};

const mockChangeStatusResult: ChangeOrderStatusResult = {
  orderId: 42,
  status: 'Enviado',
  changedAt: '2026-03-24T14:00:00Z',
};

const mockConfirmResult: ConfirmOrderResult = {
  orderId: 42,
  status: 'Confirmed',
  confirmedAt: '2026-03-24T11:00:00Z',
};

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should start with selectedOrder null', () => {
    expect(service.selectedOrder()).toBeNull();
  });

  describe('createOrder()', () => {
    it('should POST /api/orders with the dto and return result', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders') && r.method === 'POST' && !r.url.includes('/confirm')
      );
      expect(req.request.body).toEqual(mockCreateOrderDto);
      req.flush(mockCreateOrderResult);

      const result = await createPromise;
      expect(result).toEqual(mockCreateOrderResult);
    });

    it('should send customerId, items, shippingAddress and notes in body', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders') && r.method === 'POST' && !r.url.includes('/confirm')
      );
      expect(req.request.body.customerId).toBe(1);
      expect(req.request.body.items).toHaveLength(2);
      expect(req.request.body.items[0].productVariantId).toBe(5);
      expect(req.request.body.items[0].quantity).toBe(2);
      expect(req.request.body.shippingAddress).toBe('Av. Corrientes 1234');
      req.flush(mockCreateOrderResult);

      await createPromise;
    });

    it('should set isLoading to false after successful createOrder', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto);
      httpMock
        .expectOne((r) =>
          r.url.includes('/api/orders') && r.method === 'POST' && !r.url.includes('/confirm')
        )
        .flush(mockCreateOrderResult);
      await createPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed createOrder', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto).catch(() => null);
      httpMock
        .expectOne((r) =>
          r.url.includes('/api/orders') && r.method === 'POST' && !r.url.includes('/confirm')
        )
        .flush('error', { status: 422, statusText: 'Unprocessable Entity' });
      await createPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should work without optional fields', async () => {
      const minimalDto: CreateOrderDto = {
        customerId: 3,
        items: [{ productVariantId: 10, quantity: 1 }],
      };
      const createPromise = service.createOrder(minimalDto);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders') && r.method === 'POST' && !r.url.includes('/confirm')
      );
      expect(req.request.body.shippingAddress).toBeUndefined();
      expect(req.request.body.notes).toBeUndefined();
      req.flush({ orderId: 99 });

      const result = await createPromise;
      expect(result.orderId).toBe(99);
    });
  });

  describe('getOrder()', () => {
    it('should GET /api/orders/:id and return order detail', async () => {
      const getPromise = service.getOrder(42);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42') && r.method === 'GET'
      );
      req.flush(mockOrderDetail);

      const result = await getPromise;
      expect(result).toEqual(mockOrderDetail);
    });

    it('should update selectedOrder signal after successful getOrder', async () => {
      const getPromise = service.getOrder(42);
      httpMock.expectOne((r) => r.url.includes('/api/orders/42') && r.method === 'GET').flush(mockOrderDetail);
      await getPromise;
      expect(service.selectedOrder()).toEqual(mockOrderDetail);
    });

    it('should set isLoading to false after failed getOrder', async () => {
      const getPromise = service.getOrder(999).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/999') && r.method === 'GET')
        .flush('not found', { status: 404, statusText: 'Not Found' });
      await getPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('confirmOrder()', () => {
    it('should POST /api/orders/:id/confirm and return result', async () => {
      const confirmPromise = service.confirmOrder(42);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42/confirm') && r.method === 'POST'
      );
      req.flush(mockConfirmResult);

      const result = await confirmPromise;
      expect(result).toEqual(mockConfirmResult);
    });

    it('should set isLoading to false after successful confirmOrder', async () => {
      const confirmPromise = service.confirmOrder(42);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/42/confirm') && r.method === 'POST')
        .flush(mockConfirmResult);
      await confirmPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed confirmOrder (stock insuficiente)', async () => {
      const confirmPromise = service.confirmOrder(42).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/42/confirm') && r.method === 'POST')
        .flush(
          { title: 'Stock insuficiente para M Azul. Disponible: 0, requerido: 2' },
          { status: 400, statusText: 'Bad Request' }
        );
      await confirmPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('clearSelectedOrder()', () => {
    it('should reset selectedOrder to null', async () => {
      const getPromise = service.getOrder(42);
      httpMock.expectOne((r) => r.url.includes('/api/orders/42') && r.method === 'GET').flush(mockOrderDetail);
      await getPromise;

      service.clearSelectedOrder();
      expect(service.selectedOrder()).toBeNull();
    });
  });

  describe('changeOrderStatus()', () => {
    it('should POST /api/orders/:id/change-status with newStatus and return result', async () => {
      const changePromise = service.changeOrderStatus(42, 'Shipped');

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42/change-status') && r.method === 'POST'
      );
      expect(req.request.body).toEqual({ newStatus: 'Shipped' });
      req.flush(mockChangeStatusResult);

      const result = await changePromise;
      expect(result).toEqual(mockChangeStatusResult);
    });

    it('should set isLoading to false after successful changeOrderStatus', async () => {
      const changePromise = service.changeOrderStatus(42, 'Shipped');
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/42/change-status') && r.method === 'POST')
        .flush(mockChangeStatusResult);
      await changePromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed changeOrderStatus (transición inválida)', async () => {
      const changePromise = service.changeOrderStatus(42, 'Pending').catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/42/change-status') && r.method === 'POST')
        .flush(
          { title: 'No se puede cambiar el estado de Confirmado a Pendiente.' },
          { status: 400, statusText: 'Bad Request' }
        );
      await changePromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should send Cancelled as newStatus when cancelling', async () => {
      const changePromise = service.changeOrderStatus(42, 'Cancelled');

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42/change-status') && r.method === 'POST'
      );
      expect(req.request.body.newStatus).toBe('Cancelled');
      req.flush({ orderId: 42, status: 'Cancelado', changedAt: '2026-03-24T15:00:00Z' });

      await changePromise;
    });

    it('should include deliveredAt in body when provided', async () => {
      const deliveredAt = '2026-04-20T00:00:00.000Z';
      const changePromise = service.changeOrderStatus(42, 'Delivered', deliveredAt);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42/change-status') && r.method === 'POST'
      );
      expect(req.request.body).toEqual({ newStatus: 'Delivered', deliveredAt });
      req.flush({ orderId: 42, status: 'Entregado', changedAt: deliveredAt });

      await changePromise;
    });

    it('should NOT include deliveredAt in body when not provided', async () => {
      const changePromise = service.changeOrderStatus(42, 'Delivered');

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42/change-status') && r.method === 'POST'
      );
      expect(req.request.body).toEqual({ newStatus: 'Delivered' });
      expect(req.request.body.deliveredAt).toBeUndefined();
      req.flush({ orderId: 42, status: 'Entregado', changedAt: '2026-04-27T10:00:00Z' });

      await changePromise;
    });
  });

  describe('cancelOrder()', () => {
    it('should POST /api/orders/:id/cancel and return result', async () => {
      const mockCancelResult: ChangeOrderStatusResult = {
        orderId: 42,
        status: 'Cancelado',
        changedAt: '2026-03-24T15:00:00Z',
      };
      const cancelPromise = service.cancelOrder(42);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders/42/cancel') && r.method === 'POST'
      );
      req.flush(mockCancelResult);

      const result = await cancelPromise;
      expect(result).toEqual(mockCancelResult);
    });

    it('should set isLoading to false after successful cancelOrder', async () => {
      const cancelPromise = service.cancelOrder(42);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/42/cancel') && r.method === 'POST')
        .flush({ orderId: 42, status: 'Cancelado', changedAt: '2026-03-24T15:00:00Z' });
      await cancelPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed cancelOrder', async () => {
      const cancelPromise = service.cancelOrder(42).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders/42/cancel') && r.method === 'POST')
        .flush('error', { status: 400, statusText: 'Bad Request' });
      await cancelPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('getValidTransitionsForCurrentOrder()', () => {
    it('should return empty array when no order is loaded', () => {
      expect(service.getValidTransitionsForCurrentOrder()).toEqual([]);
    });

    it('should return valid transitions for Confirmed order', async () => {
      const getPromise = service.getOrder(42);
      httpMock.expectOne((r) => r.url.includes('/api/orders/42') && r.method === 'GET').flush(mockOrderDetail);
      await getPromise;

      const transitions = service.getValidTransitionsForCurrentOrder();
      expect(transitions).toContain('Shipped');
      expect(transitions).toContain('Cancelled');
      expect(transitions).not.toContain('Pending');
    });
  });
});
