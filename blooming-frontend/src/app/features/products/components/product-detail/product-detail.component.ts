import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { ProductsService } from '../../services/products.service';
import { StockMovementsService } from '../../services/stock-movements.service';
import { StockMovementsListComponent } from '../stock-movements-list/stock-movements-list.component';
import { FormatMeasurementsPipe } from '../../pipes/format-measurements.pipe';
import { PriceHistoryItem, ProductResponse, VariantResponse } from '../../models/product.models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    StockMovementsListComponent,
    FormatMeasurementsPipe,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss',
})
export class ProductDetailComponent implements OnInit {
  private readonly productsService = inject(ProductsService);
  private readonly stockMovementsService = inject(StockMovementsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly product = this.productsService.selectedProduct;
  readonly isLoading = this.productsService.isLoading;

  readonly selectedVariantId = signal<number | null>(null);
  readonly priceHistory = signal<PriceHistoryItem[]>([]);
  readonly isLoadingHistory = signal(false);

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    await this.productsService.loadById(id);
    const p = this.product();
    if (p && p.variants.length > 0) {
      this.selectedVariantId.set(p.variants[0].id);
    }
  }

  selectVariant(variantId: number): void {
    this.selectedVariantId.set(variantId);
    this.loadPriceHistory(variantId);
  }

  async loadPriceHistory(variantId: number): Promise<void> {
    this.isLoadingHistory.set(true);
    try {
      const history = await this.productsService.getPriceHistory(variantId);
      this.priceHistory.set(history);
    } finally {
      this.isLoadingHistory.set(false);
    }
  }

  getVariantImageUrl(variant: VariantResponse, product: ProductResponse): string | undefined {
    return variant.imageUrl ?? product.imageUrl;
  }

  navigateToEdit(): void {
    const p = this.product();
    if (p) this.router.navigate(['/products', p.id, 'edit']);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }


}
