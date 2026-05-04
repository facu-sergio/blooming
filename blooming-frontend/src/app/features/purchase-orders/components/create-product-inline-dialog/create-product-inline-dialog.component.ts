import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriesService } from '../../../products/services/categories.service';
import { CatalogService } from '../../../products/services/catalog.service';
import { ProductsService } from '../../../products/services/products.service';
import { productsConstants } from '../../../products/constants/products.constants';
import { ProductResponse } from '../../../products/models/product.models';
import { HybridAutocompleteComponent } from '../../../../shared/components/hybrid-autocomplete/hybrid-autocomplete.component';

@Component({
  selector: 'app-create-product-inline-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    HybridAutocompleteComponent,
  ],
  templateUrl: './create-product-inline-dialog.component.html',
  styleUrl: './create-product-inline-dialog.component.scss',
})
export class CreateProductInlineDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateProductInlineDialogComponent>);
  private readonly categoriesService = inject(CategoriesService);
  private readonly catalogService = inject(CatalogService);
  private readonly productsService = inject(ProductsService);

  readonly constants = productsConstants;
  readonly categories = this.categoriesService.categories;
  readonly isLoading = this.productsService.isLoading;

  readonly sizeOptionGroups = computed(() =>
    this.catalogService.sizeSystems().map(ss => ({
      label: ss.displayName,
      options: ss.sizes.map(s => ({ id: s.id, displayName: s.displayName, description: s.description })),
    }))
  );

  readonly colorOptions = computed(() =>
    this.catalogService.colors().map(c => ({ id: c.id, displayName: c.displayName }))
  );

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(productsConstants.nameMaxLength)]],
    categoryId: [null as number | null, [Validators.required]],
    sizeId: [null as number | null, [Validators.required]],
    colorId: [null as number | null, [Validators.required]],
    markupPercentage: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [null as number | null, [Validators.min(0)]],
  });

  async ngOnInit(): Promise<void> {
    await Promise.all([
      this.categoriesService.loadAll(),
      this.catalogService.loadAll(),
    ]);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, categoryId, sizeId, colorId, markupPercentage, lowStockThreshold } = this.form.value;

    const result: ProductResponse = await this.productsService.createInline({
      name: name!,
      categoryId: categoryId!,
      sizeId: sizeId!,
      colorId: colorId!,
      markupPercentage: markupPercentage ?? 0,
      lowStockThreshold: lowStockThreshold ?? undefined,
    });

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
