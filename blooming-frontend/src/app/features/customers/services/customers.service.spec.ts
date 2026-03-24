import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CustomersService } from './customers.service';
import { Customer } from '../models/customer.models';

const mockCustomer: Customer = {
  id: 1,
  name: 'Ana García',
  phone: '1122334455',
  address: 'Av. Corrientes 1234',
  createdAt: '2026-03-24T00:00:00Z',
};

describe('CustomersService', () => {
  let service: CustomersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CustomersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty customers signal', () => {
    expect(service.customers()).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should start with selectedCustomer null', () => {
    expect(service.selectedCustomer()).toBeNull();
  });

  describe('loadAll()', () => {
    it('should GET /api/customers and update customers signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/customers'));
      expect(req.request.method).toBe('GET');
      req.flush([mockCustomer]);

      await loadPromise;
      expect(service.customers()).toEqual([mockCustomer]);
    });

    it('should set isLoading to false after successful loadAll', async () => {
      const loadPromise = service.loadAll();
      httpMock.expectOne((r) => r.url.includes('/api/customers')).flush([mockCustomer]);
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed loadAll', async () => {
      const loadPromise = service.loadAll().catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/customers'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('create()', () => {
    it('should POST /api/customers and refresh list', async () => {
      const dto = { name: 'Ana García', phone: '1122334455' };
      const createPromise = service.create(dto);

      const postReq = httpMock.expectOne(
        (r) => r.url.includes('/api/customers') && r.method === 'POST'
      );
      expect(postReq.request.body).toEqual(dto);
      postReq.flush(mockCustomer);

      await Promise.resolve();

      const getReq = httpMock.expectOne(
        (r) => r.url.includes('/api/customers') && r.method === 'GET'
      );
      getReq.flush([mockCustomer]);

      const result = await createPromise;
      expect(result).toEqual(mockCustomer);
      expect(service.customers()).toEqual([mockCustomer]);
    });

    it('should send correct body on create', async () => {
      const dto = { name: 'Juan López', phone: '9988776655', address: 'Calle Falsa 123' };
      const createPromise = service.create(dto);

      const req = httpMock.expectOne(
        (r) => r.url.includes('/api/customers') && r.method === 'POST'
      );
      expect(req.request.body.name).toBe('Juan López');
      expect(req.request.body.phone).toBe('9988776655');
      req.flush({ ...mockCustomer, id: 2, name: 'Juan López' });

      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/customers') && r.method === 'GET').flush([]);
      await createPromise;
    });
  });

  describe('update()', () => {
    it('should PUT /api/customers/:id and refresh list', async () => {
      const dto = { name: 'Ana García Actualizada', phone: '1122334455' };
      const updatePromise = service.update(1, dto);

      const putReq = httpMock.expectOne(
        (r) => r.url.includes('/api/customers/1') && r.method === 'PUT'
      );
      expect(putReq.request.body).toEqual(dto);
      const updated = { ...mockCustomer, name: 'Ana García Actualizada' };
      putReq.flush(updated);

      await Promise.resolve();

      httpMock
        .expectOne((r) => r.url.includes('/api/customers') && r.method === 'GET')
        .flush([updated]);

      const result = await updatePromise;
      expect(result.name).toBe('Ana García Actualizada');
    });
  });

  describe('selectCustomer()', () => {
    it('should set selectedCustomer signal', () => {
      service.selectCustomer(mockCustomer);
      expect(service.selectedCustomer()).toEqual(mockCustomer);
    });

    it('should clear selectedCustomer when called with null', () => {
      service.selectCustomer(mockCustomer);
      service.selectCustomer(null);
      expect(service.selectedCustomer()).toBeNull();
    });
  });
});
