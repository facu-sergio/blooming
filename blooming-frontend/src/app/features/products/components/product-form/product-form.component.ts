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
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
    MatDialogModule,
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
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly dialogRef = inject(MatDialogRef<ProductFormComponent>, { optional: true });

  readonly constants = productsConstants;
  readonly isLoading = this.productsService.isLoading;
  readonly categories = this.categoriesService.categories;
  readonly isDialog = !!this.dialogRef;

  readonly isEditMode = signal(false);
  readonly productId = signal<number | null>(null);
  readonly existingImageUrl = signal<string | null>(null);
  readonly selectedImage = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly imageError = signal<string | null>(null);
  readonly removeImage = signal(false);

  readonly variantImages = signal<{ file: File | null; preview: string | null; existingUrl: string | null; remove: boolean }[]>([]);
  readonly expandedVariants = signal<Set<number>>(new Set([0]));

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
    const cost = data?.costPrice ?? 0;
    const markup = data?.markupPercentage ?? 0;
    return this.fb.group({
      id: [data?.id ?? null],
      size: [data?.size ?? '', [Validators.required, Validators.maxLength(productsConstants.sizeMaxLength)]],
      color: [data?.color ?? '', [Validators.required, Validators.maxLength(productsConstants.colorMaxLength)]],
      costPrice: [{ value: cost, disabled: false }],
      markupPercentage: [markup, [Validators.required, Validators.min(0)]],
      sellingPrice: [Math.round(cost * (1 + markup / 100) * 100) / 100],
      // TODO: exponer lowStockThreshold por variante si en el futuro se necesita configurar por producto
      lowStockThreshold: [1],
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

  onCostOrMarkupBlur(variantControl: AbstractControl): void {
    const cost = variantControl.get('costPrice')?.value ?? 0;
    const markup = variantControl.get('markupPercentage')?.value ?? 0;
    const price = Math.round(cost * (1 + markup / 100) * 100) / 100;
    variantControl.get('sellingPrice')?.setValue(price, { emitEvent: false });
  }

  onSellingPriceBlur(variantControl: AbstractControl): void {
    const cost = variantControl.get('costPrice')?.value ?? 0;
    if (cost <= 0) return;
    const price = variantControl.get('sellingPrice')?.value ?? 0;
    const markup = Math.round((price / cost - 1) * 100 * 100) / 100;
    variantControl.get('markupPercentage')?.setValue(markup, { emitEvent: false });
  }

  toggleVariant(index: number): void {
    this.expandedVariants.update(set => {
      const next = new Set(set);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  }

  isVariantExpanded(index: number): boolean {
    return this.expandedVariants().has(index);
  }

  addVariant(): void {
    const newIndex = this.variantsArray.length;
    this.variantsArray.push(this.createVariantGroup());
    this.variantImages.update((imgs) => [...imgs, { file: null, preview: null, existingUrl: null, remove: false }]);
    this.expandedVariants.update(set => new Set([...set, newIndex]));
  }

  removeVariant(index: number): void {
    if (this.variantsArray.length > 1) {
      this.variantsArray.removeAt(index);
      this.variantImages.update((imgs) => imgs.filter((_, i) => i !== index));
      this.expandedVariants.update(set => {
        const next = new Set<number>();
        set.forEach(i => { if (i < index) next.add(i); else if (i > index) next.add(i - 1); });
        return next;
      });
    }
  }

  onVariantImageSelected(variantIndex: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!(productsConstants.allowedImageTypes as readonly string[]).includes(file.type)) return;
    if (file.size > productsConstants.imageMaxSizeBytes) return;

    this.variantImages.update((imgs) => {
      const updated = [...imgs];
      updated[variantIndex] = { ...updated[variantIndex], file, preview: URL.createObjectURL(file), remove: false };
      return updated;
    });
  }

  onRemoveVariantImage(variantIndex: number): void {
    this.variantImages.update((imgs) => {
      const updated = [...imgs];
      updated[variantIndex] = { file: null, preview: null, existingUrl: null, remove: true };
      return updated;
    });
  }

  getVariantImage(index: number) {
    return this.variantImages()[index] ?? { file: null, preview: null, existingUrl: null, remove: false };
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

  onCancel(): void {
    if (this.isDialog) {
      this.dialogRef!.close(null);
    } else {
      this.router.navigate(['/products']);
    }
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
        const imgs: { file: File | null; preview: string | null; existingUrl: string | null; remove: boolean }[] = [];
        for (const v of product.variants) {
          this.variantsArray.push(this.createVariantGroup({
            id: v.id,
            size: v.size,
            color: v.color,
            costPrice: v.costPrice,
            markupPercentage: v.markupPercentage,
            measurements: v.measurements ?? [],
          }));
          imgs.push({ file: null, preview: v.imageUrl ?? null, existingUrl: v.imageUrl ?? null, remove: false });
        }
        this.variantImages.set(imgs);
        this.expandedVariants.set(new Set());
        this.cdr.detectChanges();
      }
    } else {
      this.variantImages.set([{ file: null, preview: null, existingUrl: null, remove: false }]);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, categoryId } = this.form.value;
    const variants = this.variantsArray.value;
    const variantImgs = this.variantImages();

    const variantDtos = this.isEditMode()
      ? (variants as (UpdateVariantDto & { sellingPrice?: number })[]).map((v, i) => {
          const { sellingPrice, ...rest } = v;
          return { ...rest, removeVariantImage: variantImgs[i]?.remove ?? false };
        })
      : (variants as (CreateVariantDto & { sellingPrice?: number })[]).map((v) => {
          const { sellingPrice, ...rest } = v;
          return rest as CreateVariantDto;
        });

    const formData = this.productsService.buildFormData(
      name!,
      categoryId!,
      variantDtos,
      this.selectedImage() ?? undefined,
      this.isEditMode() ? this.removeImage() : undefined,
    );

    variantImgs.forEach((vi, i) => {
      if (vi.file) {
        formData.append(`variantImage_${i}`, vi.file);
      }
    });

    if (this.isEditMode() && this.productId()) {
      const result = await this.productsService.update(this.productId()!, formData);
      this.snackBar.open('Producto actualizado', 'Cerrar', { duration: 3000 });
      if (this.isDialog) {
        this.dialogRef!.close(result);
      } else {
        this.router.navigate(['/products']);
      }
    } else {
      const result = await this.productsService.create(formData);
      if (this.isDialog) {
        this.dialogRef!.close(result);
      } else {
        this.snackBar.open('Producto creado', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/products']);
      }
    }
  }

  getVariantControls() {
    return this.variantsArray.controls;
  }
}
