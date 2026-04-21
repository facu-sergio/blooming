import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, startWith } from 'rxjs';
import { OrdersService } from '../../services/orders.service';
import { CustomersService } from '../../../customers/services/customers.service';
import { OrderListItemDto, OrderListFilters, OrderStatus } from '../../models/order.models';
import { Customer } from '../../../customers/models/customer.models';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatAutocompleteModule,
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.scss',
})
export class OrderListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly ordersService = inject(OrdersService);
  private readonly customersService = inject(CustomersService);
  private readonly fb = inject(FormBuilder);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isLoading = this.ordersService.isLoading;
  readonly orders = this.ordersService.orders;
  readonly totalCount = this.ordersService.totalCount;

  readonly tableColumns = ['id', 'customer', 'status', 'total', 'createdAt'];
  readonly statusOptions: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: 'Todos' },
    { value: 'Pending', label: 'Pendiente' },
    { value: 'Confirmed', label: 'Confirmado' },
    { value: 'Shipped', label: 'Enviado' },
    { value: 'Delivered', label: 'Entregado' },
    { value: 'Cancelled', label: 'Cancelado' },
  ];

  private readonly _customers = signal<Customer[]>([]);
  readonly filteredCustomers: Observable<Customer[]>;

  private readonly _isMobile = signal(false);
  readonly isMobile = this._isMobile.asReadonly();
  readonly filtersVisible = signal(false);
  readonly activeFilterCount = signal(0);

  readonly filterForm: FormGroup = this.fb.group({
    status: [''],
    fromDate: [null],
    toDate: [null],
    customerId: [null],
    customerName: [''],
  });

  page = 1;
  pageSize = 20;

  constructor() {
    this.filteredCustomers = this.filterForm.get('customerName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterCustomers(value || ''))
    );
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).subscribe((result) => {
      this._isMobile.set(result.matches);
    });
    this.loadCustomers();
    this.loadOrders();
  }

  async loadCustomers(): Promise<void> {
    await this.customersService.loadAll();
    this._customers.set(this.customersService.customers());
  }

  private _filterCustomers(value: string): Customer[] {
    const filterValue = value.toLowerCase();
    return this._customers().filter(customer => 
      customer.name.toLowerCase().includes(filterValue) ||
      customer.phone?.toLowerCase().includes(filterValue)
    );
  }

  displayCustomer(customer: Customer | null): string {
    return customer ? `${customer.name} (${customer.phone || 'sin teléfono'})` : '';
  }

  onCustomerSelected(customer: Customer): void {
    this.filterForm.patchValue({
      customerId: customer.id,
      customerName: customer.name,
    });
  }

  loadOrders(): void {
    const { status, fromDate, toDate, customerId } = this.filterForm.value as {
      status: OrderStatus | '';
      fromDate: Date | null;
      toDate: Date | null;
      customerId: number | null;
      customerName: string;
    };

    const filters: OrderListFilters = {
      page: this.page,
      pageSize: this.pageSize,
    };

    if (status) filters.status = status;
    if (fromDate) filters.fromDate = fromDate.toISOString();
    if (toDate) filters.toDate = toDate.toISOString();
    if (customerId) filters.customerId = customerId;

    this.ordersService.getOrders(filters);
  }

  toggleFilters(): void {
    this.filtersVisible.update(v => !v);
  }

  onApplyFilters(): void {
    const { status, fromDate, toDate, customerId } = this.filterForm.value;
    const count = [status, fromDate, toDate, customerId].filter(v => v !== null && v !== '' && v !== undefined).length;
    this.activeFilterCount.set(count);
    this.page = 1;
    this.loadOrders();
  }

  onClearFilters(): void {
    this.filterForm.reset({ status: '', fromDate: null, toDate: null, customerId: null, customerName: '' });
    this.activeFilterCount.set(0);
    this.page = 1;
    this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadOrders();
  }

  goToDetail(order: OrderListItemDto): void {
    this.router.navigate(['/orders', order.id]);
  }

  goToCreate(): void {
    this.router.navigate(['/orders/create']);
  }

  private readonly statusMap: Record<string, string> = {
    pending: 'status-pending', confirmed: 'status-confirmed',
    shipped: 'status-shipped', delivered: 'status-delivered', cancelled: 'status-cancelled',
    pendiente: 'status-pending', confirmado: 'status-confirmed',
    enviado: 'status-shipped', entregado: 'status-delivered', cancelado: 'status-cancelled',
  };

  getStatusClass(status: string): string {
    return this.statusMap[status.toLowerCase()] ?? 'status-pending';
  }

  getStatusIcon(status: string): string {
    return '';
  }
}
