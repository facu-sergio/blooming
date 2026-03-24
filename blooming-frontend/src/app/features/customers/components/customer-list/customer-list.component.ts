import { Component, inject, OnInit, computed } from '@angular/core';
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
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../models/customer.models';

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
  readonly searchTerm = this.customersService.searchTerm;
  readonly displayedColumns = ['name', 'phone', 'address', 'actions'];

  readonly noResults = computed(
    () => this.customers().length === 0 && this.searchTerm().length > 0
  );

  readonly searchControl = new FormControl<string>('');

  isMobile = false;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
    await this.customersService.loadAll();
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      void this.customersService.loadAll(this.searchControl.value || undefined);
    }, 300);
  }

  async clearSearch(): Promise<void> {
    this.searchControl.setValue('');
    await this.customersService.loadAll();
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
