import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

// JWT válido con exp muy lejano (año 2099)
const FUTURE_EXP = Math.floor(new Date('2099-01-01').getTime() / 1000);
// JWT expirado (año 2000)
const PAST_EXP = Math.floor(new Date('2000-01-01').getTime() / 1000);

function buildFakeToken(exp: number): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({ sub: '1', email: 'admin@blooming.com', exp }));
  return `${header}.${payload}.fakesignature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should start unauthenticated when localStorage is empty', () => {
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
    });

    it('should restore session when a valid token exists in localStorage', () => {
      localStorage.clear();
      const token = buildFakeToken(FUTURE_EXP);
      localStorage.setItem('auth_token', token);

      // Re-create service to trigger constructor
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          provideRouter([]),
        ],
      });
      const freshService = TestBed.inject(AuthService);

      expect(freshService.isAuthenticated()).toBe(true);
      expect(freshService.currentUser()?.email).toBe('admin@blooming.com');
    });
  });

  describe('login()', () => {
    it('should store token and update signals on successful login', async () => {
      const token = buildFakeToken(FUTURE_EXP);
      const loginPromise = service.login('admin@blooming.com', 'password123');

      const req = httpMock.expectOne('http://localhost:5000/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush({ token });

      await loginPromise;

      expect(localStorage.getItem('auth_token')).toBe(token);
      expect(service.isAuthenticated()).toBe(true);
      expect(service.currentUser()?.email).toBe('admin@blooming.com');
      expect(service.currentUser()?.userId).toBe('1');
    });
  });

  describe('logout()', () => {
    it('should clear token and reset signals', async () => {
      const token = buildFakeToken(FUTURE_EXP);
      const loginPromise = service.login('admin@blooming.com', 'password123');
      httpMock.expectOne('http://localhost:5000/api/auth/login').flush({ token });
      await loginPromise;

      service.logout();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('isTokenValid()', () => {
    it('should return false when no token exists', () => {
      expect(service.isTokenValid()).toBe(false);
    });

    it('should return true for a non-expired token', () => {
      localStorage.setItem('auth_token', buildFakeToken(FUTURE_EXP));
      expect(service.isTokenValid()).toBe(true);
    });

    it('should return false for an expired token', () => {
      localStorage.setItem('auth_token', buildFakeToken(PAST_EXP));
      expect(service.isTokenValid()).toBe(false);
    });
  });

  describe('getToken()', () => {
    it('should return null when no token stored', () => {
      expect(service.getToken()).toBeNull();
    });

    it('should return stored token', () => {
      const token = buildFakeToken(FUTURE_EXP);
      localStorage.setItem('auth_token', token);
      expect(service.getToken()).toBe(token);
    });
  });
});
