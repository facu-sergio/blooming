import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomersService } from '../../../customers/services/customers.service';
import { ProductsService } from '../../../products/services/products.service';
import { OrdersService } from '../../services/orders.service';
import { ordersConstants } from '../../constants/orders.constants';
import { OrderItemFormEntry } from '../../models/order.models';
import { Customer } from '../../../customers/models/customer.models';
import { ProductResponse, VariantResponse } from '../../../products/models/product.models';

@Component({
  selector: 'app-create-order',
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
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.scss',
})
export class CreateOrderComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly customersService = inject(CustomersService);
  private readonly productsService = inject(ProductsService);
  private readonly ordersService = inject(OrdersService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small]).pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly constants = ordersConstants;
  readonly isLoading = this.ordersService.isLoading;
  readonly today = new Date(new Date().setHours(0, 0, 0, 0));

  // Estado de búsqueda y selección de cliente
  readonly customerSearchControl = new FormControl('', { updateOn: 'change' });
  private readonly _selectedCustomer = signal<Customer | null>(null);
  readonly selectedCustomer = this._selectedCustomer.asReadonly();
  readonly filteredCustomers = computed(() => {
    const term = (this.customerSearchControl.value ?? '').toLowerCase();
    if (!term) return this.customersService.customers().slice(0, 10);
    return this.customersService
      .customers()
      .filter((c) => c.name.toLowerCase().includes(term) || c.phone.includes(term))
      .slice(0, 10);
  });

  // Estado de búsqueda y selección de variante
  readonly variantSearchControl = new FormControl('', { updateOn: 'change' });
  private readonly _filteredVariants = signal<{ product: ProductResponse; variant: VariantResponse }[]>([]);
  readonly filteredVariants = this._filteredVariants.asReadonly();

  // Items del pedido
  private readonly _items = signal<OrderItemFormEntry[]>([]);
  readonly items = this._items.asReadonly();
  readonly tableColumns = ['product', 'variant', 'unitPrice', 'quantity', 'lineTotal', 'actions'];

  readonly orderTotal = computed(() =>
    this._items().reduce((sum, item) => sum + item.lineTotal, 0)
  );

  readonly form = this.fb.group({
    shippingAddress: [
      '',
      [Validators.maxLength(ordersConstants.shippingAddressMaxLength)],
    ],
    notes: ['', [Validators.maxLength(ordersConstants.notesMaxLength)]],
    estimatedDeliveryDate: [null as Date | null],
  });

  ngOnInit(): void {
    this.customersService.loadAll();
    this.productsService.loadAll();

    this.variantSearchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe((term) => this.filterVariants(term ?? ''));
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

  onCustomerSelected(customer: Customer): void {
    this._selectedCustomer.set(customer);
    this.customerSearchControl.setValue(customer.name, { emitEvent: false });
  }

  clearCustomer(): void {
    this._selectedCustomer.set(null);
    this.customerSearchControl.setValue('');
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
            ? { ...i, quantity: i.quantity + 1, lineTotal: i.unitPrice * (i.quantity + 1) }
            : i
        )
      );
    } else {
      const entry: OrderItemFormEntry = {
        productVariantId: item.variant.id,
        variantLabel: `${item.variant.size} ${item.variant.color}`,
        productName: item.product.name,
        unitPrice: item.variant.sellingPrice,
        quantity: 1,
        lineTotal: item.variant.sellingPrice,
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
        i === index ? { ...item, quantity: qty, lineTotal: item.unitPrice * qty } : item
      )
    );
  }

  removeItem(index: number): void {
    this._items.update((items) => items.filter((_, i) => i !== index));
  }

  async onSubmit(): Promise<void> {
    if (!this._selectedCustomer()) {
      this.snackBar.open('Selecciona un cliente', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this._items().length === 0) {
      this.snackBar.open('Agrega al menos un ítem', 'Cerrar', { duration: 3000 });
      return;
    }
    if (this.form.invalid || this.isLoading()) return;

    const { shippingAddress, notes, estimatedDeliveryDate } = this.form.value;

    const dto = {
      customerId: this._selectedCustomer()!.id,
      items: this._items().map((i) => ({
        productVariantId: i.productVariantId,
        quantity: i.quantity,
      })),
      shippingAddress: shippingAddress || undefined,
      notes: notes || undefined,
      estimatedDeliveryDate: estimatedDeliveryDate
        ? (estimatedDeliveryDate as Date).toISOString()
        : undefined,
    };

    const result = await this.ordersService.createOrder(dto);
    this.snackBar.open('Pedido creado correctamente', 'Cerrar', { duration: 3000 });
    this.router.navigate(['/orders', result.orderId]);
  }

  onCancel(): void {
    this.router.navigate(['/orders']);
  }
}
