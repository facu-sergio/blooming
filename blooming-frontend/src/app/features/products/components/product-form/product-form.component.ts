import { Component, inject, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormArray, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductsService } from '../../services/products.service';
import { CategoriesService } from '../../services/categories.service';
import { productsConstants } from '../../constants/products.constants';
import { UpdateVariantDto, CreateVariantDto, ProductVariantMeasurement } from '../../models/product.models';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
})
export class ProductFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsService = inject(ProductsService);
  private readonly categoriesService = inject(CategoriesService);
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  readonly constants = productsConstants;
  private readonly cdr = inject(ChangeDetectorRef);
  readonly isLoading = this.productsService.isLoading;
  readonly categories = this.categoriesService.categories;

  readonly isEditMode = signal(false);
  readonly productId = signal<number | null>(null);
  readonly existingImageUrl = signal<string | null>(null);
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  readonly removeImage = signal(false);

  readonly form = this.fb.group({
    name: ['', { validators: [Validators.required, Validators.maxLength(productsConstants.nameMaxLength)], updateOn: 'blur' }],
    categoryId: [null as number | null, [Validators.required]],
    variants: this.fb.array([this.createVariantGroup()]),
  });

  get variantsArray(): FormArray {
    return this.form.get('variants') as FormArray;
  }

  createVariantGroup(data?: {
    id?: number;
    size?: string;
    color?: string;
    costPrice?: number;
    markupPercentage?: number;
    measurements?: ProductVariantMeasurement[];
  }) {
    return this.fb.group({
      id: [data?.id ?? null],
      size: [data?.size ?? '', [Validators.required, Validators.maxLength(productsConstants.sizeMaxLength)]],
      color: [data?.color ?? '', [Validators.required, Validators.maxLength(productsConstants.colorMaxLength)]],
      costPrice: [data?.costPrice ?? null, [Validators.required, Validators.min(0.01)]],
      markupPercentage: [data?.markupPercentage ?? 0, [Validators.required, Validators.min(0)]],
      measurements: this.fb.array(
        (data?.measurements ?? []).map((m) => this.createMeasurementGroup(m))
      ),
    });
  }

  createMeasurementGroup(data?: { name?: string; valueInCm?: number }) {
    return this.fb.group({
      name: [data?.name ?? '', [Validators.required, Validators.maxLength(productsConstants.measurementNameMaxLength)]],
      valueInCm: [data?.valueInCm ?? null, [Validators.required, Validators.min(0.01)]],
    });
  }

  getMeasurementsArray(variantControl: AbstractControl): FormArray {
    return variantControl.get('measurements') as FormArray;
  }

  addMeasurement(variantIndex: number): void {
    const variant = this.variantsArray.at(variantIndex);
    this.getMeasurementsArray(variant).push(this.createMeasurementGroup());
  }

  removeMeasurement(variantIndex: number, measurementIndex: number): void {
    const variant = this.variantsArray.at(variantIndex);
    this.getMeasurementsArray(variant).removeAt(measurementIndex);
  }

  getSellingPrice(variantControl: AbstractControl): number {
    const cost = variantControl.get('costPrice')?.value ?? 0;
    const markup = variantControl.get('markupPercentage')?.value ?? 0;
    return cost * (1 + markup / 100);
  }

  addVariant(): void {
    this.variantsArray.push(this.createVariantGroup());
  }

  removeVariant(index: number): void {
    if (this.variantsArray.length > 1) {
      this.variantsArray.removeAt(index);
    }
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!(productsConstants.allowedImageTypes as readonly string[]).includes(file.type)) {
      this.imageError.set('La imagen debe ser JPEG o PNG');
      return;
    }
    if (file.size > productsConstants.imageMaxSizeBytes) {
      this.imageError.set('La imagen no puede superar 5MB');
      return;
    }

    this.imageError.set(null);
    this.selectedImage.set(file);
    this.removeImage.set(false);
    this.imagePreviewUrl.set(URL.createObjectURL(file));
  }

  onRemoveImage(): void {
    this.selectedImage.set(null);
    this.imagePreviewUrl.set(null);
    this.existingImageUrl.set(null);
    this.removeImage.set(true);
  }

  async ngOnInit(): Promise<void> {
    await this.categoriesService.loadAll();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(Number(id));
      await this.productsService.loadById(Number(id));
      const product = this.productsService.selectedProduct();
      if (product) {
        this.form.patchValue({ name: product.name, categoryId: product.categoryId });
        this.existingImageUrl.set(product.imageUrl ?? null);
        this.imagePreviewUrl.set(product.imageUrl ?? null);
        while (this.variantsArray.length > 0) {
          this.variantsArray.removeAt(0);
        }
        for (const v of product.variants) {
          this.variantsArray.push(this.createVariantGroup({
            id: v.id,
            size: v.size,
            color: v.color,
            costPrice: v.costPrice,
            markupPercentage: v.markupPercentage,
            measurements: v.measurements ?? [],
          }));
        }
        this.cdr.detectChanges();
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, categoryId } = this.form.value;
    const variants = this.variantsArray.value;

    const formData = this.productsService.buildFormData(
      name!,
      categoryId!,
      this.isEditMode() ? (variants as UpdateVariantDto[]) : (variants as CreateVariantDto[]),
      this.selectedImage() ?? undefined,
      this.isEditMode() ? this.removeImage() : undefined,
    );

    if (this.isEditMode() && this.productId()) {
      await this.productsService.update(this.productId()!, formData);
      this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
    } else {
      await this.productsService.create(formData);
      this.snackBar.open('Producto creado', 'Cerrar', { duration: 3000 });
    }

    this.router.navigate(['/products']);
  }

  getVariantControls() {
    return this.variantsArray.controls;
  }
}
