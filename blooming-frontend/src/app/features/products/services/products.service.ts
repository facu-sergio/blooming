import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ProductResponse, CreateVariantDto, UpdateVariantDto, SearchFilters } from '../models/product.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/products`;

  private readonly _products = signal<ProductResponse[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _selectedProduct = signal<ProductResponse | null>(null);
  private readonly _searchFilters = signal<SearchFilters>({});

  readonly products = this._products.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly searchFilters = this._searchFilters.asReadonly();

  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.get<ProductResponse[]>(this.baseUrl));
      this._products.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async search(filters: SearchFilters): Promise<void> {
    this._searchFilters.set(filters);
    this._isLoading.set(true);
    try {
      let params = new HttpParams();
      if (filters.searchTerm) params = params.set('searchTerm', filters.searchTerm);
      if (filters.category) params = params.set('category', filters.category);
      if (filters.size) params = params.set('size', filters.size);
      if (filters.color) params = params.set('color', filters.color);

      const result = await firstValueFrom(
        this.http.get<ProductResponse[]>(`${this.baseUrl}/search`, { params })
      );
      this._products.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async clearSearch(): Promise<void> {
    this._searchFilters.set({});
    await this.loadAll();
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
    categoryId: number,
    variants: CreateVariantDto[] | UpdateVariantDto[],
    image?: File,
    removeImage?: boolean
  ): FormData {
    const fd = new FormData();
    fd.append('name', name);
    fd.append('categoryId', String(categoryId));

    const processedVariants = variants.map((variant) => ({
      ...variant,
      costPrice:
        typeof variant.costPrice === 'string' ? parseFloat(variant.costPrice) : variant.costPrice,
      markupPercentage:
        typeof variant.markupPercentage === 'string'
          ? parseFloat(variant.markupPercentage)
          : variant.markupPercentage,
      measurements: (variant.measurements ?? []).map((m) => ({
        name: m.name,
        valueInCm: typeof m.valueInCm === 'string' ? parseFloat(m.valueInCm) : m.valueInCm,
      })),
    }));

    fd.append('variants', JSON.stringify(processedVariants));
    if (image) {
      fd.append('image', image);
    }
    if (removeImage !== undefined) {
      fd.append('removeImage', String(removeImage));
    }
    return fd;
  }
}
