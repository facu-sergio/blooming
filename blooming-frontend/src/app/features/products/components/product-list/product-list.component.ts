import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
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

  readonly isDesktop = toSignal(
    this.breakpointObserver.observe(Breakpoints.Large).pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  async ngOnInit(): Promise<void> {
    await this.productsService.loadAll();
  }

  navigateToNew(): void {
    this.router.navigate(['/products/new']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/products', id, 'edit']);
  }
}
