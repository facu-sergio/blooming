import { Component, inject, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';
import { SearchFilters } from '../../models/product.models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly products = this.productsService.products;
  readonly isLoading = this.productsService.isLoading;
  readonly searchFilters = this.productsService.searchFilters;

  readonly isDesktop = toSignal(
    this.breakpointObserver.observe(Breakpoints.Large).pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly searchTermControl = new FormControl<string>('');
  readonly categoryControl = new FormControl<string>('');
  readonly sizeControl = new FormControl<string>('');
  readonly colorControl = new FormControl<string>('');

  readonly categories = computed(() => {
    const all = this.productsService.products();
    return [...new Set(all.map((p) => p.categoryName))].sort();
  });

  readonly hasActiveFilters = computed(() => {
    const f = this.searchFilters();
    return !!(f.searchTerm || f.category || f.size || f.color);
  });

  readonly noResults = computed(() => {
    return this.products().length === 0 && this.hasActiveFilters();
  });

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    await this.productsService.loadAll();
  }

  onFilterChange(): void {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    this.searchDebounceTimer = setTimeout(() => this.applyFilters(), 300);
  }

  private async applyFilters(): Promise<void> {
    const filters: SearchFilters = {
      searchTerm: this.searchTermControl.value || undefined,
      category: this.categoryControl.value || undefined,
      size: this.sizeControl.value || undefined,
      color: this.colorControl.value || undefined,
    };
    await this.productsService.search(filters);
  }

  async clearFilters(): Promise<void> {
    this.searchTermControl.setValue('');
    this.categoryControl.setValue('');
    this.sizeControl.setValue('');
    this.colorControl.setValue('');
    await this.productsService.clearSearch();
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'stock-out';
    if (stock <= 5) return 'stock-low';
    return 'stock-ok';
  }

  getTotalStock(variants: { stock: number }[]): number {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  }

  navigateToNew(): void {
    this.router.navigate(['/products/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/products', id, 'edit']);
  }
}
