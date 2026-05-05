import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ColorAdmin, CreateColorDto, UpdateColorDto } from '../models/catalog.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ColorsAdminService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/colors`;

  private readonly _colors = signal<ColorAdmin[]>([]);
  private readonly _isLoading = signal(false);

  readonly colors = this._colors.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.get<ColorAdmin[]>(`${this.baseUrl}/admin`)
      );
      this._colors.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async create(dto: CreateColorDto): Promise<ColorAdmin> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.post<ColorAdmin>(this.baseUrl, dto)
      );
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: number, dto: UpdateColorDto): Promise<ColorAdmin> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.put<ColorAdmin>(`${this.baseUrl}/${id}`, dto)
      );
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async toggleActive(id: number): Promise<ColorAdmin> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.patch<ColorAdmin>(`${this.baseUrl}/${id}/toggle-active`, {})
      );
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }
}
