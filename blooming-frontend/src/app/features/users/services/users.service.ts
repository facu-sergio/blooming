import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { RegisterUserRequest, RegisterUserResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly http = inject(HttpClient);

  private readonly _isLoading = signal(false);
  readonly isLoading = this._isLoading.asReadonly();

  async register(email: string, password: string): Promise<RegisterUserResponse> {
    this._isLoading.set(true);
    try {
      const body: RegisterUserRequest = { email, password };
      return await this.http
        .post<RegisterUserResponse>(`${environment.apiUrl}/api/auth/register`, body)
        .toPromise() as RegisterUserResponse;
    } finally {
      this._isLoading.set(false);
    }
  }
}
