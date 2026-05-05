import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ColorsAdminService } from './colors-admin.service';
import { ColorAdmin } from '../models/catalog.models';

const mockColor: ColorAdmin = {
  id: 1,
  name: 'ROJO',
  displayName: 'Rojo',
  sortOrder: 1,
  isActive: true,
};

const mockInactiveColor: ColorAdmin = { ...mockColor, id: 2, name: 'AZUL', displayName: 'Azul', isActive: false };

describe('ColorsAdminService', () => {
  let service: ColorsAdminService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ColorsAdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with empty colors signal', () => {
    expect(service.colors()).toEqual([]);
  });

  it('should start with isLoading false', () => {
    expect(service.isLoading()).toBe(false);
  });

  describe('loadAll()', () => {
    it('should GET /api/colors/admin and update colors signal', async () => {
      const loadPromise = service.loadAll();

      const req = httpMock.expectOne((r) => r.url.includes('/api/colors/admin'));
      expect(req.request.method).toBe('GET');
      req.flush([mockColor, mockInactiveColor]);

      await loadPromise;
      expect(service.colors()).toEqual([mockColor, mockInactiveColor]);
    });

    it('should set isLoading to false after successful loadAll', async () => {
      const loadPromise = service.loadAll();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockColor]);
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed loadAll', async () => {
      const loadPromise = service.loadAll().catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/colors/admin'))
        .flush('error', { status: 500, statusText: 'Server Error' });
      await loadPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should include inactive colors in admin list', async () => {
      const loadPromise = service.loadAll();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockColor, mockInactiveColor]);
      await loadPromise;
      const inactive = service.colors().find((c) => !c.isActive);
      expect(inactive).toBeTruthy();
    });
  });

  describe('create()', () => {
    it('should POST /api/colors and refresh list', async () => {
      const dto = { name: 'ROJO', displayName: 'Rojo', sortOrder: 1 };
      const createPromise = service.create(dto);

      const postReq = httpMock.expectOne((r) => r.url.includes('/api/colors') && r.method === 'POST');
      expect(postReq.request.body).toEqual(dto);
      postReq.flush(mockColor);

      await Promise.resolve();

      const getReq = httpMock.expectOne((r) => r.url.includes('/api/colors/admin'));
      getReq.flush([mockColor]);

      const result = await createPromise;
      expect(result).toEqual(mockColor);
    });

    it('should create color with only required name field', async () => {
      const dto = { name: 'VERDE' };
      const createPromise = service.create(dto);

      const req = httpMock.expectOne((r) => r.url.includes('/api/colors') && r.method === 'POST');
      expect(req.request.body.name).toBe('VERDE');
      req.flush({ ...mockColor, name: 'VERDE', displayName: 'Verde' });

      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockColor]);
      await createPromise;
    });
  });

  describe('update()', () => {
    it('should PUT /api/colors/:id and refresh list', async () => {
      const dto = { displayName: 'Rojo Oscuro' };
      const updatePromise = service.update(1, dto);

      const putReq = httpMock.expectOne((r) => r.url.includes('/api/colors/1') && r.method === 'PUT');
      expect(putReq.request.body).toEqual(dto);
      putReq.flush({ ...mockColor, displayName: 'Rojo Oscuro' });

      await Promise.resolve();

      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([{ ...mockColor, displayName: 'Rojo Oscuro' }]);

      const result = await updatePromise;
      expect(result.displayName).toBe('Rojo Oscuro');
    });

    it('should send only changed fields on update', async () => {
      const dto = { name: 'CARMESI' };
      const updatePromise = service.update(1, dto);

      const req = httpMock.expectOne((r) => r.url.includes('/api/colors/1') && r.method === 'PUT');
      expect(req.request.body).toEqual(dto);
      expect(req.request.body.displayName).toBeUndefined();
      req.flush({ ...mockColor, name: 'CARMESI' });

      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockColor]);
      await updatePromise;
    });
  });

  describe('toggleActive()', () => {
    it('should PATCH /api/colors/:id/toggle-active and refresh list', async () => {
      const togglePromise = service.toggleActive(1);

      const patchReq = httpMock.expectOne((r) => r.url.includes('/api/colors/1/toggle-active'));
      expect(patchReq.request.method).toBe('PATCH');
      patchReq.flush({ ...mockColor, isActive: false });

      await Promise.resolve();

      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([{ ...mockColor, isActive: false }]);

      const result = await togglePromise;
      expect(result.isActive).toBe(false);
    });

    it('should reactivate inactive color via toggle', async () => {
      const togglePromise = service.toggleActive(2);

      const patchReq = httpMock.expectOne((r) => r.url.includes('/api/colors/2/toggle-active'));
      patchReq.flush({ ...mockInactiveColor, isActive: true });

      await Promise.resolve();

      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([{ ...mockInactiveColor, isActive: true }]);

      const result = await togglePromise;
      expect(result.isActive).toBe(true);
    });
  });
});
