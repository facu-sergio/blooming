import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ProductsService } from './products.service';
import { ProductResponse } from '../models/product.models';

const mockVariant = {
  id: 1,
  size: 'M',
  color: 'Azul',
  costPrice: 1000,
  markupPercentage: 50,
  sellingPrice: 1500,
  stock: 0,
  measurements: [],
};

const mockProduct: ProductResponse = {
  id: 1,
  name: 'Remera',
  categoryId: 1,
  categoryName: 'Ropa',
  imageUrl: undefined,
  createdAt: '2026-03-14T00:00:00Z',
  variants: [mockVariant],
};

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty products signal', () => {
    expect(service.products()).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  it('should start with selectedProduct null', () => {
    expect(service.selectedProduct()).toBeNull();
  });

  describe('loadAll()', () => {
    it('should GET /api/products and update products signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/products') && !r.url.includes('/api/products/'));
      expect(req.request.method).toBe('GET');
      req.flush({ items: [mockProduct], totalCount: 1, page: 1, pageSize: 1000 });

      await loadPromise;
      expect(service.products()).toEqual([mockProduct]);
    });

    it('should set isLoading to false after successful loadAll', async () => {
      const loadPromise = service.loadAll();
      httpMock
        .expectOne((r) => r.url.includes('/api/products') && !r.url.includes('/api/products/'))
        .flush({ items: [mockProduct], totalCount: 1, page: 1, pageSize: 1000 });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed loadAll', async () => {
      const loadPromise = service.loadAll().catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/products') && !r.url.includes('/api/products/'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('loadById()', () => {
    it('should GET /api/products/:id and update selectedProduct signal', async () => {
      const loadPromise = service.loadById(1);

      const req = httpMock.expectOne((r) => r.url.includes('/api/products/1'));
      expect(req.request.method).toBe('GET');
      req.flush(mockProduct);

      await loadPromise;
      expect(service.selectedProduct()).toEqual(mockProduct);
    });
  });

  describe('create()', () => {
    it('should POST /api/products with FormData and refresh list', async () => {
      const fd = new FormData();
      fd.append('name', 'Remera');
      fd.append('categoryId', '1');
      fd.append('variants', JSON.stringify([{ size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50 }]));

      const createPromise = service.create(fd);

      const postReq = httpMock.expectOne((r) => r.url.includes('/api/products') && r.method === 'POST');
      postReq.flush(mockProduct);

      await Promise.resolve();

      const getReq = httpMock.expectOne((r) => r.url.includes('/api/products') && r.method === 'GET');
      getReq.flush({ items: [mockProduct], totalCount: 1, page: 1, pageSize: 1000 });

      const result = await createPromise;
      expect(result).toEqual(mockProduct);
      expect(service.products()).toEqual([mockProduct]);
    });
  });

  describe('update()', () => {
    it('should PUT /api/products/:id with FormData and refresh list', async () => {
      const fd = new FormData();
      fd.append('name', 'Remera Actualizada');
      fd.append('categoryId', '1');
      fd.append('variants', JSON.stringify([{ id: 1, size: 'L', color: 'Rojo', costPrice: 1200, markupPercentage: 50 }]));

      const updatePromise = service.update(1, fd);

      const putReq = httpMock.expectOne((r) => r.url.includes('/api/products/1') && r.method === 'PUT');
      const updatedProduct = { ...mockProduct, name: 'Remera Actualizada' };
      putReq.flush(updatedProduct);

      await Promise.resolve();

      const getReq = httpMock.expectOne((r) => r.url.includes('/api/products') && r.method === 'GET');
      getReq.flush({ items: [updatedProduct], totalCount: 1, page: 1, pageSize: 1000 });

      const result = await updatePromise;
      expect(result.name).toBe('Remera Actualizada');
    });
  });

  describe('buildFormData()', () => {
    it('should build FormData with name, categoryId and variants as JSON string', () => {
      const variants = [{ size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50 }];
      const fd = service.buildFormData('Remera', 1, variants);

      expect(fd.get('name')).toBe('Remera');
      expect(fd.get('categoryId')).toBe('1');
      const parsedVariants = JSON.parse(fd.get('variants') as string);
      expect(parsedVariants[0].size).toBe('M');
      expect(parsedVariants[0].color).toBe('Azul');
      expect(parsedVariants[0].costPrice).toBe(1000);
      expect(parsedVariants[0].markupPercentage).toBe(50);
      expect(parsedVariants[0].lowStockThreshold).toBeNull();
      expect(fd.get('image')).toBeNull();
    });

    it('should include lowStockThreshold in processed variants', () => {
      const variants = [{ size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50, lowStockThreshold: 3 }];
      const fd = service.buildFormData('Remera', 1, variants);

      const parsedVariants = JSON.parse(fd.get('variants') as string);
      expect(parsedVariants[0].lowStockThreshold).toBe(3);
    });

    it('should set lowStockThreshold to null when empty string', () => {
      const variants = [{ size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50, lowStockThreshold: '' as unknown as number }];
      const fd = service.buildFormData('Remera', 1, variants);

      const parsedVariants = JSON.parse(fd.get('variants') as string);
      expect(parsedVariants[0].lowStockThreshold).toBeNull();
    });

    it('should include image in FormData when provided', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const variants = [{ size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50 }];
      const fd = service.buildFormData('Remera', 1, variants, file);

      expect(fd.get('image')).toBe(file);
    });

    it('should include removeImage in FormData when provided', () => {
      const variants = [{ id: 1, size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50 }];
      const fd = service.buildFormData('Remera', 1, variants, undefined, true);

      expect(fd.get('removeImage')).toBe('true');
    });

    it('should not include removeImage in FormData when not provided', () => {
      const variants = [{ size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50 }];
      const fd = service.buildFormData('Remera', 1, variants);

      expect(fd.get('removeImage')).toBeNull();
    });
  });

  describe('isLowStock()', () => {
    const baseVariant = { id: 1, size: 'M', color: 'Azul', costPrice: 1000, markupPercentage: 50, sellingPrice: 1500, stock: 5, measurements: [] };

    it('should return false when lowStockThreshold is undefined', () => {
      expect(service.isLowStock({ ...baseVariant, lowStockThreshold: undefined })).toBe(false);
    });

    it('should return false when lowStockThreshold is null', () => {
      expect(service.isLowStock({ ...baseVariant, lowStockThreshold: undefined })).toBe(false);
    });

    it('should return false when stock is above threshold', () => {
      expect(service.isLowStock({ ...baseVariant, stock: 5, lowStockThreshold: 3 })).toBe(false);
    });

    it('should return true when stock equals threshold', () => {
      expect(service.isLowStock({ ...baseVariant, stock: 3, lowStockThreshold: 3 })).toBe(true);
    });

    it('should return true when stock is below threshold', () => {
      expect(service.isLowStock({ ...baseVariant, stock: 1, lowStockThreshold: 3 })).toBe(true);
    });

    it('should return true when threshold is 0 and stock is 0', () => {
      expect(service.isLowStock({ ...baseVariant, stock: 0, lowStockThreshold: 0 })).toBe(true);
    });

    it('should return false when threshold is 0 and stock is 1', () => {
      expect(service.isLowStock({ ...baseVariant, stock: 1, lowStockThreshold: 0 })).toBe(false);
    });
  });
});
