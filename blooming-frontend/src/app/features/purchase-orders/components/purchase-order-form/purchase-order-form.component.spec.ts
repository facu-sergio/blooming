import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { convertToParamMap, ActivatedRoute } from '@angular/router';
import { signal, Signal, WritableSignal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PurchaseOrderFormComponent } from './purchase-order-form.component';
import { SuppliersService } from '../../../suppliers/services/suppliers.service';
import { ProductsService } from '../../../products/services/products.service';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { Supplier } from '../../../suppliers/models/supplier.models';
import { ProductResponse } from '../../../products/models/product.models';

const suppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Mayorista ABC',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'supplier-2',
    name: 'Telas del Sur',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe('PurchaseOrderFormComponent', () => {
  let component: PurchaseOrderFormComponent;
  let suppliersWritable: WritableSignal<Supplier[]>;
  let suppliersServiceSpy: {
    suppliers: Signal<Supplier[]>;
    loadAll: ReturnType<typeof vi.fn>;
  };
  let productsServiceSpy: {
    products: Signal<ProductResponse[]>;
    loadAll: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    suppliersWritable = signal(suppliers);

    suppliersServiceSpy = {
      suppliers: suppliersWritable.asReadonly(),
      loadAll: vi.fn().mockResolvedValue(undefined),
    };

    productsServiceSpy = {
      products: signal<ProductResponse[]>([]).asReadonly(),
      loadAll: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [PurchaseOrderFormComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: convertToParamMap({}),
            },
          },
        },
        { provide: SuppliersService, useValue: suppliersServiceSpy },
        { provide: ProductsService, useValue: productsServiceSpy },
        {
          provide: PurchaseOrdersService,
          useValue: {
            isLoading: signal(false).asReadonly(),
            create: vi.fn().mockResolvedValue(undefined),
          },
        },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
        { provide: MatDialog, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(PurchaseOrderFormComponent);
    component = fixture.componentInstance;
  });

  it('filters suppliers when the search control changes', () => {
    component.supplierSearchControl.setValue('telas');

    expect(component.filteredSuppliers().map((supplier) => supplier.name)).toEqual([
      'Telas del Sur',
    ]);
  });

  it('loads suppliers by typed search term', async () => {
    await component.ngOnInit();
    suppliersServiceSpy.loadAll.mockClear();

    component.supplierSearchControl.setValue('Telas');
    await wait(250);

    expect(suppliersServiceSpy.loadAll).toHaveBeenCalledWith('Telas');
  });

  it('clears the selected supplier when the typed value changes', async () => {
    await component.ngOnInit();
    component.onSupplierSelected(suppliers[0]);
    await wait(250);
    suppliersServiceSpy.loadAll.mockClear();

    component.supplierSearchControl.setValue('Telas');
    await wait(250);

    expect(component.selectedSupplier()).toBeNull();
    expect(suppliersServiceSpy.loadAll).toHaveBeenCalledWith('Telas');
  });

  it('navigates back to purchase orders on cancel', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    component.onCancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/purchase-orders']);
  });
});
