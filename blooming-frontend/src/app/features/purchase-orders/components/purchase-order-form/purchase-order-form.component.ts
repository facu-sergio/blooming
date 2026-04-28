import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SuppliersService } from '../../../suppliers/services/suppliers.service';
import { ProductsService } from '../../../products/services/products.service';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { PurchaseOrderItemFormEntry } from '../../models/purchase-order.models';
import { Supplier } from '../../../suppliers/models/supplier.models';
import { ProductResponse, VariantResponse } from '../../../products/models/product.models';
import { ProductFormComponent } from '../../../products/components/product-form/product-form.component';

@Component({
  selector: 'app-purchase-order-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatDividerModule,
  ],
  templateUrl: './purchase-order-form.component.html',
  styleUrl: './purchase-order-form.component.scss',
})
export class PurchaseOrderFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly suppliersService = inject(SuppliersService);
  private readonly productsService = inject(ProductsService);
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);

  readonly isLoading = this.purchaseOrdersService.isLoading;

  readonly today = new Date();
  readonly orderDateControl = new FormControl<Date>(new Date(), { nonNullable: true });

  // Supplier selection
  readonly supplierSearchControl = new FormControl('', { updateOn: 'change' });
  private readonly _selectedSupplier = signal<Supplier | null>(null);
  readonly selectedSupplier = this._selectedSupplier.asReadonly();
  readonly filteredSuppliers = computed(() => {
    const term = (this.supplierSearchControl.value ?? '').toLowerCase();
    if (!term) return this.suppliersService.suppliers().slice(0, 10);
    return this.suppliersService
      .suppliers()
      .filter((s) => s.name.toLowerCase().includes(term))
      .slice(0, 10);
  });

  // Variant search
  readonly variantSearchControl = new FormControl('', { updateOn: 'change' });
  private readonly _filteredVariants = signal<{ product: ProductResponse; variant: VariantResponse }[]>([]);
  readonly filteredVariants = this._filteredVariants.asReadonly();

  // Items
  private readonly _items = signal<PurchaseOrderItemFormEntry[]>([]);
  readonly items = this._items.asReadonly();
  readonly tableColumns = ['product', 'variant', 'quantity', 'unitCostPrice', 'lineTotal', 'actions'];

  readonly orderTotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  async ngOnInit(): Promise<void> {
    await this.suppliersService.loadAll();
    this.productsService.loadAll();

    this.variantSearchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((term) => this.filterVariants(term ?? ''));

    const supplierId = this.route.snapshot.queryParamMap.get('supplierId');
    if (supplierId) {
      const supplier = this.suppliersService.suppliers().find((s) => s.id === supplierId);
      if (supplier) this.onSupplierSelected(supplier);
    }
  }

  private filterVariants(term: string): void {
    if (!term.trim()) {
      this._filteredVariants.set([]);
      return;
    }
    const lower = term.toLowerCase();
    const results: { product: ProductResponse; variant: VariantResponse }[] = [];

    for (const product of this.productsService.products()) {
      for (const variant of product.variants) {
        const label = `${product.name} ${variant.size} ${variant.color}`.toLowerCase();
        if (label.includes(lower)) {
          results.push({ product, variant });
          if (results.length >= 15) break;
        }
      }
      if (results.length >= 15) break;
    }
    this._filteredVariants.set(results);
  }

  onSupplierSelected(supplier: Supplier): void {
    this._selectedSupplier.set(supplier);
    this.supplierSearchControl.setValue(supplier.name, { emitEvent: false });
  }

  clearSupplier(): void {
    this._selectedSupplier.set(null);
    this.supplierSearchControl.setValue('');
  }

  variantDisplayFn(item: { product: ProductResponse; variant: VariantResponse } | null): string {
    return item ? `${item.product.name} - ${item.variant.size} ${item.variant.color}` : '';
  }

  addVariantToOrder(item: { product: ProductResponse; variant: VariantResponse }): void {
    const existing = this._items().findIndex((i) => i.productVariantId === item.variant.id);

    if (existing >= 0) {
      this._items.update((items) =>
        items.map((i, idx) =>
          idx === existing
            ? { ...i, quantity: i.quantity + 1, lineTotal: i.unitCostPrice * (i.quantity + 1) }
            : i
        )
      );
    } else {
      const entry: PurchaseOrderItemFormEntry = {
        productVariantId: item.variant.id,
        productName: item.product.name,
        variantLabel: `${item.variant.size} ${item.variant.color}`,
        quantity: 1,
        unitCostPrice: item.variant.costPrice ?? 0,
        lineTotal: item.variant.costPrice ?? 0,
      };
      this._items.update((items) => [...items, entry]);
    }

    this.variantSearchControl.setValue('', { emitEvent: false });
    this._filteredVariants.set([]);
  }

  updateQuantity(index: number, value: string): void {
    const qty = parseInt(value, 10);
    if (isNaN(qty) || qty < 1) return;
    this._items.update((items) =>
      items.map((item, i) =>
        i === index ? { ...item, quantity: qty, lineTotal: item.unitCostPrice * qty } : item
      )
    );
  }

  updateUnitCostPrice(index: number, value: string): void {
    const price = parseFloat(value);
    if (isNaN(price) || price <= 0) return;
    this._items.update((items) =>
      items.map((item, i) =>
        i === index ? { ...item, unitCostPrice: price, lineTotal: price * item.quantity } : item
      )
    );
  }

  removeItem(index: number): void {
    this._items.update((items) => items.filter((_, i) => i !== index));
  }

  async onSubmit(): Promise<void> {
    if (!this._selectedSupplier()) {
      this.snackBar.open('Seleccioná un proveedor', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this._items().length === 0) {
      this.snackBar.open('Agregá al menos un ítem', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.isLoading()) return;

    const dto = {
      supplierId: this._selectedSupplier()!.id,
      orderDate: this.orderDateControl.value.toISOString(),
      items: this._items().map((i) => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
        unitCostPrice: i.unitCostPrice,
      })),
    };

    await this.purchaseOrdersService.create(dto);
    this.snackBar.open('Orden de compra registrada correctamente', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/purchase-orders']);
  }

  openCreateProductDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      width: '1000px',
      maxWidth: '95vw',
      maxHeight: '95vh',
      panelClass: 'product-form-dialog',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((product: ProductResponse | null) => {
      if (product && product.variants.length > 0) {
        const variant = product.variants[0];
        this.addVariantToOrder({ product, variant });
        this.snackBar.open(`Producto "${product.name}" creado y agregado a la orden`, 'Cerrar', { duration: 3000 });
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/purchase-orders']);
  }
}
