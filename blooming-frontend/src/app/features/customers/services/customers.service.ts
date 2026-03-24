import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerOrder,
  CustomerMetrics,
} from '../models/customer.models';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/api/customers`;

  private readonly _customers = signal<Customer[]>([]);
  private readonly _isLoading = signal(false);
  private readonly _selectedCustomer = signal<Customer | null>(null);
  private readonly _searchTerm = signal<string>('');

  // [Historia 3.3] Signals para historial y métricas del cliente en vista de detalle.
  // TODO: Integrar con polling.service.ts cuando se implemente el servicio de polling global.
  private readonly _customerOrders = signal<CustomerOrder[]>([]);
  private readonly _customerMetrics = signal<CustomerMetrics | null>(null);
  private readonly _isLoadingDetail = signal(false);

  readonly customers = this._customers.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly selectedCustomer = this._selectedCustomer.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly customerOrders = this._customerOrders.asReadonly();
  readonly customerMetrics = this._customerMetrics.asReadonly();
  readonly isLoadingDetail = this._isLoadingDetail.asReadonly();

  async loadAll(searchTerm?: string): Promise<void> {
    this._searchTerm.set(searchTerm ?? '');
    this._isLoading.set(true);
    try {
      let params = new HttpParams();
      if (searchTerm) params = params.set('searchTerm', searchTerm);
      const result = await firstValueFrom(this.http.get<Customer[]>(this.baseUrl, { params }));
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

  /**
   * Carga el historial de pedidos del cliente desde GET /api/customers/:id/orders.
   * [Historia 3.3] Retorna lista vacía hasta que Epic 4 implemente creación de pedidos.
   */
  async getCustomerOrders(customerId: number): Promise<void> {
    this._isLoadingDetail.set(true);
    try {
      const result = await firstValueFrom(
        this.http.get<{ orders: CustomerOrder[] }>(`${this.baseUrl}/${customerId}/orders`)
      );
      this._customerOrders.set(result.orders);
    } finally {
      this._isLoadingDetail.set(false);
    }
  }

  /**
   * Carga las métricas del cliente desde GET /api/customers/:id/metrics.
   * [Historia 3.3] Retorna totalOrders=0, totalSpent=0 hasta que Epic 4 cree pedidos reales.
   */
  async getCustomerMetrics(customerId: number): Promise<void> {
    this._isLoadingDetail.set(true);
    try {
      const result = await firstValueFrom(
        this.http.get<CustomerMetrics>(`${this.baseUrl}/${customerId}/metrics`)
      );
      this._customerMetrics.set(result);
    } finally {
      this._isLoadingDetail.set(false);
    }
  }

  /** Limpia los signals de detalle al abandonar la vista de un cliente. */
  clearCustomerDetail(): void {
    this._customerOrders.set([]);
    this._customerMetrics.set(null);
  }
}
