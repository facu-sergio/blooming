import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriesService } from '../../../products/services/categories.service';
import { ProductsService } from '../../../products/services/products.service';
import { productsConstants } from '../../../products/constants/products.constants';
import { ProductResponse } from '../../../products/models/product.models';

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
  ],
  templateUrl: './create-product-inline-dialog.component.html',
  styleUrl: './create-product-inline-dialog.component.scss',
})
export class CreateProductInlineDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateProductInlineDialogComponent>);
  private readonly categoriesService = inject(CategoriesService);
  private readonly productsService = inject(ProductsService);

  readonly constants = productsConstants;
  readonly categories = this.categoriesService.categories;
  readonly isLoading = this.productsService.isLoading;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(productsConstants.nameMaxLength)]],
    categoryId: [null as number | null, [Validators.required]],
    size: ['', [Validators.required, Validators.maxLength(productsConstants.sizeMaxLength)]],
    color: ['', [Validators.required, Validators.maxLength(productsConstants.colorMaxLength)]],
    markupPercentage: [0, [Validators.required, Validators.min(0)]],
    lowStockThreshold: [null as number | null, [Validators.min(0)]],
  });

  async ngOnInit(): Promise<void> {
    await this.categoriesService.loadAll();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, categoryId, size, color, markupPercentage, lowStockThreshold } = this.form.value;

    const result: ProductResponse = await this.productsService.createInline({
      name: name!,
      categoryId: categoryId!,
      size: size!,
      color: color!,
      markupPercentage: markupPercentage ?? 0,
      lowStockThreshold: lowStockThreshold ?? undefined,
    });

    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
