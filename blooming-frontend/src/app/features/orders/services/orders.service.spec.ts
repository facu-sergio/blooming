import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { OrdersService } from './orders.service';
import { CreateOrderDto, CreateOrderResult } from '../models/order.models';

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

  describe('createOrder()', () => {
    it('should POST /api/orders with the dto and return result', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders') && r.method === 'POST'
      );
      expect(req.request.body).toEqual(mockCreateOrderDto);
      req.flush(mockCreateOrderResult);

      const result = await createPromise;
      expect(result).toEqual(mockCreateOrderResult);
    });

    it('should send customerId, items, shippingAddress and notes in body', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto);

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/orders') && r.method === 'POST'
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
        .expectOne((r) => r.url.includes('/api/orders') && r.method === 'POST')
        .flush(mockCreateOrderResult);
      await createPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed createOrder', async () => {
      const createPromise = service.createOrder(mockCreateOrderDto).catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/orders') && r.method === 'POST')
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
        r.url.includes('/api/orders') && r.method === 'POST'
      );
      expect(req.request.body.shippingAddress).toBeUndefined();
      expect(req.request.body.notes).toBeUndefined();
      req.flush({ orderId: 99 });

      const result = await createPromise;
      expect(result.orderId).toBe(99);
    });
  });
});
