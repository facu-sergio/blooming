import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { CategoriesService } from './categories.service';
import { Category } from '../models/product.models';

const mockCategory: Category = {
  id: 1,
  name: 'Ropa',
  description: 'Prendas de vestir',
  createdAt: '2026-03-14T00:00:00Z',
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoriesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty categories signal', () => {
    expect(service.categories()).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  describe('loadAll()', () => {
    it('should GET /api/categories and update categories signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/categories'));
      expect(req.request.method).toBe('GET');
      req.flush([mockCategory]);

      await loadPromise;
      expect(service.categories()).toEqual([mockCategory]);
    });

    it('should set isLoading to false after successful loadAll', async () => {
      const loadPromise = service.loadAll();
      httpMock.expectOne((r) => r.url.includes('/api/categories')).flush([mockCategory]);
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed loadAll', async () => {
      const loadPromise = service.loadAll().catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/categories'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('create()', () => {
    it('should POST /api/categories and refresh list', async () => {
      const dto = { name: 'Ropa', description: 'Prendas de vestir' };
      const createPromise = service.create(dto);

      const postReq = httpMock.expectOne((r) => r.url.includes('/api/categories') && r.method === 'POST');
      expect(postReq.request.body).toEqual(dto);
      postReq.flush(mockCategory);

      await Promise.resolve();

      const getReq = httpMock.expectOne((r) => r.url.includes('/api/categories') && r.method === 'GET');
      getReq.flush([mockCategory]);

      const result = await createPromise;
      expect(result).toEqual(mockCategory);
      expect(service.categories()).toEqual([mockCategory]);
    });

    it('should send correct body on create', async () => {
      const dto = { name: 'Accesorios' };
      const createPromise = service.create(dto);

      const req = httpMock.expectOne((r) => r.url.includes('/api/categories') && r.method === 'POST');
      expect(req.request.body.name).toBe('Accesorios');
      req.flush({ ...mockCategory, id: 2, name: 'Accesorios' });

      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/categories') && r.method === 'GET').flush([]);
      await createPromise;
    });
  });

  describe('update()', () => {
    it('should PUT /api/categories/:id and refresh list', async () => {
      const dto = { name: 'Ropa Actualizada' };
      const updatePromise = service.update(1, dto);

      const putReq = httpMock.expectOne((r) => r.url.includes('/api/categories/1') && r.method === 'PUT');
      expect(putReq.request.body).toEqual(dto);
      const updated = { ...mockCategory, name: 'Ropa Actualizada' };
      putReq.flush(updated);

      await Promise.resolve();

      httpMock.expectOne((r) => r.url.includes('/api/categories') && r.method === 'GET').flush([updated]);

      const result = await updatePromise;
      expect(result.name).toBe('Ropa Actualizada');
    });
  });

  describe('delete()', () => {
    it('should DELETE /api/categories/:id and refresh list', async () => {
      const deletePromise = service.delete(1);

      const deleteReq = httpMock.expectOne((r) => r.url.includes('/api/categories/1') && r.method === 'DELETE');
      deleteReq.flush(null);

      await Promise.resolve();

      httpMock.expectOne((r) => r.url.includes('/api/categories') && r.method === 'GET').flush([]);

      await deletePromise;
      expect(service.categories()).toEqual([]);
    });
  });
});
