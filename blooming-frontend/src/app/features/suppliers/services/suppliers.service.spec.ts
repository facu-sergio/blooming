import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { SuppliersService } from './suppliers.service';
import { Supplier } from '../models/supplier.models';

const mockSupplier: Supplier = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  name: 'Mayorista ABC',
  phone: 'contacto@abc.com',
  createdAt: '2026-03-27T00:00:00Z',
  updatedAt: '2026-03-27T00:00:00Z',
};

const pagedResponse = { items: [mockSupplier], totalCount: 1, page: 1, pageSize: 1000 };

describe('SuppliersService', () => {
  let service: SuppliersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(SuppliersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty suppliers signal', () => {
    expect(service.suppliers()).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should start with selectedSupplier null', () => {
    expect(service.selectedSupplier()).toBeNull();
  });

  describe('loadAll()', () => {
    it('should GET /api/suppliers and update suppliers signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/suppliers'));
      expect(req.request.method).toBe('GET');
      req.flush(pagedResponse);

      await loadPromise;
      expect(service.suppliers()).toEqual([mockSupplier]);
    });

    it('should set isLoading to false after successful loadAll', async () => {
      const loadPromise = service.loadAll();
      httpMock.expectOne((r) => r.url.includes('/api/suppliers')).flush(pagedResponse);
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed loadAll', async () => {
      const loadPromise = service.loadAll().catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/suppliers'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should pass searchTerm as query param when provided', async () => {
      const loadPromise = service.loadAll('ABC');

      const req = httpMock.expectOne((r) =>
        r.url.includes('/api/suppliers') && r.params.get('searchTerm') === 'ABC'
      );
      expect(req.request.method).toBe('GET');
      req.flush(pagedResponse);

      await loadPromise;
      expect(service.suppliers()).toEqual([mockSupplier]);
    });

    it('should NOT include searchTerm param when not provided', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/suppliers'));
      expect(req.request.params.has('searchTerm')).toBe(false);
      req.flush({ items: [], totalCount: 0, page: 1, pageSize: 1000 });

      await loadPromise;
    });
  });

  describe('create()', () => {
    it('should POST /api/suppliers and refresh list', async () => {
      const dto = { name: 'Mayorista ABC', phone: 'contacto@abc.com' };
      const createPromise = service.create(dto);

      const postReq = httpMock.expectOne(
        (r) => r.url.includes('/api/suppliers') && r.method === 'POST'
      );
      expect(postReq.request.body).toEqual(dto);
      postReq.flush(mockSupplier);

      await Promise.resolve();

      const getReq = httpMock.expectOne(
        (r) => r.url.includes('/api/suppliers') && r.method === 'GET'
      );
      getReq.flush(pagedResponse);

      const result = await createPromise;
      expect(result).toEqual(mockSupplier);
      expect(service.suppliers()).toEqual([mockSupplier]);
    });

    it('should send correct body on create', async () => {
      const dto = { name: 'Proveedor XYZ', notes: 'Notas del proveedor' };
      const createPromise = service.create(dto);

      const req = httpMock.expectOne(
        (r) => r.url.includes('/api/suppliers') && r.method === 'POST'
      );
      expect(req.request.body.name).toBe('Proveedor XYZ');
      req.flush({ ...mockSupplier, id: '550e8400-e29b-41d4-a716-000000000001', name: 'Proveedor XYZ' });

      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/suppliers') && r.method === 'GET').flush({ items: [], totalCount: 0, page: 1, pageSize: 1000 });
      await createPromise;
    });
  });

  describe('update()', () => {
    it('should PUT /api/suppliers/:id and refresh list', async () => {
      const dto = { name: 'Mayorista Actualizado' };
      const updatePromise = service.update(mockSupplier.id, dto);

      const putReq = httpMock.expectOne(
        (r) => r.url.includes(`/api/suppliers/${mockSupplier.id}`) && r.method === 'PUT'
      );
      expect(putReq.request.body).toEqual(dto);
      const updated = { ...mockSupplier, name: 'Mayorista Actualizado' };
      putReq.flush(updated);

      await Promise.resolve();

      httpMock
        .expectOne((r) => r.url.includes('/api/suppliers') && r.method === 'GET')
        .flush({ items: [updated], totalCount: 1, page: 1, pageSize: 1000 });

      const result = await updatePromise;
      expect(result.name).toBe('Mayorista Actualizado');
    });
  });

  describe('selectSupplier()', () => {
    it('should set selectedSupplier signal', () => {
      service.selectSupplier(mockSupplier);
      expect(service.selectedSupplier()).toEqual(mockSupplier);
    });

    it('should clear selectedSupplier when called with null', () => {
      service.selectSupplier(mockSupplier);
      service.selectSupplier(null);
      expect(service.selectedSupplier()).toBeNull();
    });
  });
});
