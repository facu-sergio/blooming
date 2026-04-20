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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';
import { ProductListFilters, VariantResponse } from '../../models/product.models';
import { FormatMeasurementsPipe } from '../../pipes/format-measurements.pipe';
import { CategoriesService } from '../../services/categories.service';

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
    MatTooltipModule,
    MatPaginatorModule,
    FormatMeasurementsPipe,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
})
export class ProductListComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly products = this.productsService.products;
  readonly isLoading = this.productsService.isLoading;
  readonly totalCount = this.productsService.totalCount;

  readonly isDesktop = toSignal(
    this.breakpointObserver.observe('(min-width: 1280px)').pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly searchTermControl = new FormControl<string>('');
  readonly categoryControl = new FormControl<string>('');
  readonly sizeControl = new FormControl<string>('');
  readonly colorControl = new FormControl<string>('');

  page = 1;
  pageSize = 20;

  readonly categories = computed(() =>
    this.categoriesService.categories().map(c => c.name).sort()
  );

  private readonly _hasActiveFilters = signal(false);

  readonly hasActiveFilters = this._hasActiveFilters.asReadonly();

  readonly noResults = computed(() => this.products().length === 0 && this._hasActiveFilters());

  private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;

  async ngOnInit(): Promise<void> {
    await this.categoriesService.loadAll();
    await this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    const filters: ProductListFilters = {
      page: this.page,
      pageSize: this.pageSize,
      searchTerm: this.searchTermControl.value || undefined,
      category: this.categoryControl.value || undefined,
      size: this.sizeControl.value || undefined,
      color: this.colorControl.value || undefined,
    };
    await this.productsService.getProductsPaged(filters);
  }

  onFilterChange(): void {
    if (this.searchDebounceTimer) clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = setTimeout(() => {
      this._hasActiveFilters.set(
        !!(this.searchTermControl.value || this.categoryControl.value ||
           this.sizeControl.value || this.colorControl.value)
      );
      this.page = 1;
      void this.loadProducts();
    }, 300);
  }

  async clearFilters(): Promise<void> {
    this.searchTermControl.setValue('');
    this.categoryControl.setValue('');
    this.sizeControl.setValue('');
    this.colorControl.setValue('');
    this._hasActiveFilters.set(false);
    this.page = 1;
    await this.loadProducts();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    void this.loadProducts();
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

  navigateToDetail(id: number): void {
    this.router.navigate(['/products', id]);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/products', id, 'edit']);
  }

  isLowStock(variant: VariantResponse): boolean {
    return this.productsService.isLowStock(variant);
  }

  getLowStockTooltip(variant: VariantResponse): string {
    return `Stock bajo: ${variant.stock} unidades (umbral: ${variant.lowStockThreshold})`;
  }
}
