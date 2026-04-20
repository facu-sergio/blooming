import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomersService } from '../../services/customers.service';
import { Customer, CustomerListFilters } from '../../models/customer.models';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss',
})
export class CustomerListComponent implements OnInit {
  private readonly customersService = inject(CustomersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly customers = this.customersService.customers;
  readonly isLoading = this.customersService.isLoading;
  readonly totalCount = this.customersService.totalCount;
  readonly displayedColumns = ['name', 'phone', 'address', 'actions'];

  readonly searchControl = new FormControl<string>('');

  page = 1;
  pageSize = 20;
  isMobile = false;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  readonly noResults = computed(
    () => this.customers().length === 0 && !!this.searchControl.value
  );

  async ngOnInit(): Promise<void> {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
    await this.loadCustomers();
  }

  private async loadCustomers(): Promise<void> {
    const filters: CustomerListFilters = {
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || undefined,
    };
    await this.customersService.getCustomersPaged(filters);
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.page = 1;
      void this.loadCustomers();
    }, 300);
  }

  async clearSearch(): Promise<void> {
    this.searchControl.setValue('');
    this.page = 1;
    await this.loadCustomers();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    void this.loadCustomers();
  }

  navigateToNew(): void {
    this.router.navigate(['/customers/new']);
  }

  editCustomer(customer: Customer): void {
    this.router.navigate(['/customers', customer.id, 'edit']);
  }

  viewCustomer(customer: Customer): void {
    this.router.navigate(['/customers', customer.id]);
  }

  truncate(value: string | undefined, max = 40): string {
    if (!value) return '—';
    return value.length > max ? value.substring(0, max) + '…' : value;
  }
}
