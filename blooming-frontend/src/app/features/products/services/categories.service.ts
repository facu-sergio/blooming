import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/categories`;

  private readonly _categories = signal<Category[]>([]);
  private readonly _isLoading = signal(false);

  readonly categories = this._categories.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();

  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.get<Category[]>(this.baseUrl));
      this._categories.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async create(dto: CreateCategoryDto): Promise<Category> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.post<Category>(this.baseUrl, dto));
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.put<Category>(`${this.baseUrl}/${id}`, dto));
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async delete(id: number): Promise<void> {
    this._isLoading.set(true);
    try {
      await firstValueFrom(this.http.delete<void>(`${this.baseUrl}/${id}`));
      await this.loadAll();
    } finally {
      this._isLoading.set(false);
    }
  }
}
