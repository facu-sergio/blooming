import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';

interface TokenPayload {
  sub: string;
  email: string;
  exp: number;
}

interface LoginResponse {
  token: string;
}

const STORAGE_KEY = 'auth_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _isAuthenticated = signal(false);
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  private readonly _currentUser = signal<{ userId: string; email: string } | null>(null);
  readonly currentUser = this._currentUser.asReadonly();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.restoreSession();
  }

  async login(email: string, password: string): Promise<void> {
    const response = await this.http
      .post<LoginResponse>(`${environment.apiUrl}/api/auth/login`, { email, password })
      .toPromise();

    const token = response!.token;
    localStorage.setItem(STORAGE_KEY, token);
    this.updateSignalsFromToken(token);
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
  }

  private restoreSession(): void {
    if (this.isTokenValid()) {
      const token = this.getToken()!;
      this.updateSignalsFromToken(token);
    }
  }

  private updateSignalsFromToken(token: string): void {
    const payload = this.decodeToken(token);
    this._isAuthenticated.set(true);
    this._currentUser.set({ userId: payload.sub, email: payload.email });
  }

  private decodeToken(token: string): TokenPayload {
    const base64Payload = token.split('.')[1];
    return JSON.parse(atob(base64Payload)) as TokenPayload;
  }
}
