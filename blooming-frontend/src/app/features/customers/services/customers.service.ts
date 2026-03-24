import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Customer, CreateCustomerDto, UpdateCustomerDto } from '../models/customer.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/customers`;

  private readonly _customers = signal<Customer[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _selectedCustomer = signal<Customer | null>(null);

  readonly customers = this._customers.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedCustomer = this._selectedCustomer.asReadonly();

  async loadAll(): Promise<void> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.get<Customer[]>(this.baseUrl));
      this._customers.set(result);
    } finally {
      this._isLoading.set(false);
    }
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(this.http.post<Customer>(this.baseUrl, dto));
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  async update(id: number, dto: UpdateCustomerDto): Promise<Customer> {
    this._isLoading.set(true);
    try {
      const result = await firstValueFrom(
        this.http.put<Customer>(`${this.baseUrl}/${id}`, dto)
      );
      await this.loadAll();
      return result;
    } finally {
      this._isLoading.set(false);
    }
  }

  selectCustomer(customer: Customer | null): void {
    this._selectedCustomer.set(customer);
  }
}
