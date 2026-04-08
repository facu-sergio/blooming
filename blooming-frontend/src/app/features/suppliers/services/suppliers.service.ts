import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Supplier, CreateSupplierDto, UpdateSupplierDto } from '../models/supplier.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SuppliersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/suppliers`;

  private readonly _suppliers = signal<Supplier[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _selectedSupplier = signal<Supplier | null>(null);

  readonly suppliers = this._suppliers.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedSupplier = this._selectedSupplier.asReadonly();

  async loadAll(searchTerm?: string): Promise<void> {
    this._isLoading.set(true);
    try {
      let params = new HttpParams();
      if (searchTerm) params = params.set('searchTerm', searchTerm);
      const result = await firstValueFrom(this.http.get<Supplier[]>(this.baseUrl, { params }));
      this._suppliers.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.post<Supplier>(this.baseUrl, dto));
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.put<Supplier>(`${this.baseUrl}/${id}`, dto)
      );
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  selectSupplier(supplier: Supplier | null): void {
    this._selectedSupplier.set(supplier);
  }
}
