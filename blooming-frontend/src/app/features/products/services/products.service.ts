import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ProductResponse, CreateVariantDto, UpdateVariantDto } from '../models/product.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/products`;

  private readonly _products = signal<ProductResponse[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _selectedProduct = signal<ProductResponse | null>(null);

  readonly products = this._products.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();

  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.get<ProductResponse[]>(this.baseUrl));
      this._products.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async loadById(id: number): Promise<void> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.get<ProductResponse>(`${this.baseUrl}/${id}`));
      this._selectedProduct.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async create(formData: FormData): Promise<ProductResponse> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.post<ProductResponse>(this.baseUrl, formData));
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: number, formData: FormData): Promise<ProductResponse> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.put<ProductResponse>(`${this.baseUrl}/${id}`, formData)
      );
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  buildFormData(
    name: string,
    category: string,
    variants: CreateVariantDto[] | UpdateVariantDto[],
    image?: File,
    removeImage?: boolean
  ): FormData {
    const fd = new FormData();
    fd.append('name', name);
    fd.append('category', category);
    fd.append('variants', JSON.stringify(variants));
    if (image) {
      fd.append('image', image);
    }
    if (removeImage !== undefined) {
      fd.append('removeImage', String(removeImage));
    }
    return fd;
  }
}
