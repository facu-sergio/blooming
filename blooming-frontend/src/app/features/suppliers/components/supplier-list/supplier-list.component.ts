import { Component, inject, OnInit } from '@angular/core';
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
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier, SupplierListFilters } from '../../models/supplier.models';

@Component({
  selector: 'app-supplier-list',
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
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss',
})
export class SupplierListComponent implements OnInit {
  private readonly suppliersService = inject(SuppliersService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly suppliers = this.suppliersService.suppliers;
  readonly isLoading = this.suppliersService.isLoading;
  readonly totalCount = this.suppliersService.totalCount;
  readonly displayedColumns = ['name', 'phone', 'website', 'address', 'actions'];

  readonly searchControl = new FormControl<string>('');

  page = 1;
  pageSize = 20;
  isMobile = false;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
    await this.loadSuppliers();
  }

  private async loadSuppliers(): Promise<void> {
    const filters: SupplierListFilters = {
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchControl.value || undefined,
    };
    await this.suppliersService.getSuppliersPaged(filters);
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this.page = 1;
      void this.loadSuppliers();
    }, 300);
  }

  async clearSearch(): Promise<void> {
    this.searchControl.setValue('');
    this.page = 1;
    await this.loadSuppliers();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    void this.loadSuppliers();
  }

  viewSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.id]);
  }

  navigateToNew(): void {
    this.router.navigate(['/suppliers/new']);
  }

  editSupplier(supplier: Supplier): void {
    this.router.navigate(['/suppliers', supplier.id, 'edit']);
  }

  truncate(value: string | undefined, max = 50): string {
    if (!value) return '—';
    return value.length > max ? value.substring(0, max) + '…' : value;
  }
}
