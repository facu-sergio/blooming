import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(UsersService);
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

  describe('register()', () => {
    it('should POST to /api/auth/register and return response', async () => {
      const registerPromise = service.register('nuevo@test.com', 'password123');

      const req = httpMock.expectOne((r) => r.url.includes('/api/auth/register'));
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'nuevo@test.com', password: 'password123' });
      req.flush({ userId: 2, email: 'nuevo@test.com' });

      const result = await registerPromise;
      expect(result.userId).toBe(2);
      expect(result.email).toBe('nuevo@test.com');
    });

    it('should set isLoading to false after successful register', async () => {
      const registerPromise = service.register('nuevo@test.com', 'password123');
      httpMock.expectOne((r) => r.url.includes('/api/auth/register')).flush({ userId: 2, email: 'nuevo@test.com' });

      await registerPromise;
      expect(service.isLoading()).toBe(false);
    });

    it('should set isLoading to false after failed register', async () => {
      const registerPromise = service.register('duplicado@test.com', 'password123').catch(() => null);
      httpMock
        .expectOne((r) => r.url.includes('/api/auth/register'))
        .flush({ detail: 'El email ya está registrado' }, { status: 422, statusText: 'Unprocessable Entity' });

      await registerPromise;
      expect(service.isLoading()).toBe(false);
    });
  });
});
