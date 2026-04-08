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
import { SuppliersService } from '../../services/suppliers.service';
import { Supplier } from '../../models/supplier.models';

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
  readonly displayedColumns = ['name', 'contactInfo', 'notes', 'actions'];

  readonly searchControl = new FormControl<string>('');

  isMobile = false;
  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe((result) => {
      this.isMobile = result.matches;
    });
    await this.suppliersService.loadAll();
  }

  onSearchChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      void this.suppliersService.loadAll(this.searchControl.value || undefined);
    }, 300);
  }

  async clearSearch(): Promise<void> {
    this.searchControl.setValue('');
    await this.suppliersService.loadAll();
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
