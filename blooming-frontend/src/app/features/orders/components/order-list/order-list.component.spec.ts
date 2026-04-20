import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { signal, WritableSignal } from '@angular/core';
import { OrderListComponent } from './order-list.component';
import { OrdersService } from '../../services/orders.service';
import { CustomersService } from '../../../customers/services/customers.service';
import { OrderListItemDto, PagedOrdersResult } from '../../models/order.models';

const mockOrders: OrderListItemDto[] = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Ana García',
    status: 'Pendiente',
    statusKey: 'Pending',
    total: 1000,
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Carlos López',
    status: 'Confirmado',
    statusKey: 'Confirmed',
    total: 2000,
    createdAt: '2026-02-15T00:00:00Z',
  },
];

const mockPagedResult: PagedOrdersResult = {
  items: mockOrders,
  totalCount: 2,
  page: 1,
  pageSize: 20,
};

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let ordersServiceSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    orders: ReturnType<typeof signal<OrderListItemDto[]>>;
    totalCount: ReturnType<typeof signal<number>>;
    getOrders: ReturnType<typeof vi.fn>;
  };
  let customersServiceSpy: {
    customers: ReturnType<typeof signal<never[]>>;
    loadAll: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    const isLoadingWritable: WritableSignal<boolean> = signal(false);
    const ordersWritable: WritableSignal<OrderListItemDto[]> = signal([]);
    const totalCountWritable: WritableSignal<number> = signal(0);

    ordersServiceSpy = {
      isLoading: isLoadingWritable.asReadonly() as ReturnType<typeof signal<boolean>>,
      orders: ordersWritable.asReadonly() as ReturnType<typeof signal<OrderListItemDto[]>>,
      totalCount: totalCountWritable.asReadonly() as ReturnType<typeof signal<number>>,
      getOrders: vi.fn().mockResolvedValue(mockPagedResult),
    };

    customersServiceSpy = {
      customers: signal([]).asReadonly() as ReturnType<typeof signal<never[]>>,
      loadAll: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [OrderListComponent],
      providers: [
        provideRouter([{ path: 'orders', component: OrderListComponent }]),
        provideAnimations(),
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: CustomersService, useValue: customersServiceSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit()', () => {
    it('should call loadOrders on init', async () => {
      component.ngOnInit();
      await Promise.resolve();
      expect(ordersServiceSpy.getOrders).toHaveBeenCalled();
    });

    it('should call customersService.loadAll on init', async () => {
      component.ngOnInit();
      await Promise.resolve();
      expect(customersServiceSpy.loadAll).toHaveBeenCalled();
    });
  });

  describe('loadOrders()', () => {
    it('should call getOrders with default page and pageSize', () => {
      component.loadOrders();
      expect(ordersServiceSpy.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1, pageSize: 20 })
      );
    });

    it('should include status filter when status is set', () => {
      component.filterForm.patchValue({ status: 'Pending' });
      component.loadOrders();
      expect(ordersServiceSpy.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'Pending' })
      );
    });

    it('should not include status when it is empty string', () => {
      component.filterForm.patchValue({ status: '' });
      component.loadOrders();
      const callArg = ordersServiceSpy.getOrders.mock.calls[0][0];
      expect(callArg.status).toBeUndefined();
    });

    it('should include customerId filter when customer is selected', () => {
      component.filterForm.patchValue({ customerId: 5 });
      component.loadOrders();
      expect(ordersServiceSpy.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({ customerId: 5 })
      );
    });
  });

  describe('onApplyFilters()', () => {
    it('should reset page to 1 and call loadOrders', () => {
      component.page = 3;
      component.onApplyFilters();
      expect(component.page).toBe(1);
      expect(ordersServiceSpy.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({ page: 1 })
      );
    });
  });

  describe('onClearFilters()', () => {
    it('should reset filter form and page', () => {
      component.filterForm.patchValue({ status: 'Pending', customerId: 5 });
      component.page = 3;

      component.onClearFilters();

      expect(component.filterForm.value.status).toBe('');
      expect(component.filterForm.value.customerId).toBeNull();
      expect(component.page).toBe(1);
    });

    it('should call loadOrders after clearing filters', () => {
      component.onClearFilters();
      expect(ordersServiceSpy.getOrders).toHaveBeenCalled();
    });
  });

  describe('onPageChange()', () => {
    it('should update page and pageSize from event', () => {
      component.onPageChange({ pageIndex: 1, pageSize: 10, length: 30 });
      expect(component.page).toBe(2);
      expect(component.pageSize).toBe(10);
    });

    it('should call loadOrders with updated page', () => {
      component.onPageChange({ pageIndex: 2, pageSize: 20, length: 60 });
      expect(ordersServiceSpy.getOrders).toHaveBeenCalledWith(
        expect.objectContaining({ page: 3, pageSize: 20 })
      );
    });
  });

  describe('goToDetail()', () => {
    it('should navigate to /orders/:id', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.goToDetail(mockOrders[0]);
      expect(navigateSpy).toHaveBeenCalledWith(['/orders', 1]);
    });
  });

  describe('goToCreate()', () => {
    it('should navigate to /orders/create', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');
      component.goToCreate();
      expect(navigateSpy).toHaveBeenCalledWith(['/orders/create']);
    });
  });

  describe('getStatusClass()', () => {
    it('should return status-pending for Pending', () => {
      expect(component.getStatusClass('Pending')).toBe('status-pending');
    });

    it('should return status-confirmed for Confirmed', () => {
      expect(component.getStatusClass('Confirmed')).toBe('status-confirmed');
    });

    it('should return status-cancelled for Cancelled', () => {
      expect(component.getStatusClass('Cancelled')).toBe('status-cancelled');
    });
  });

  describe('statusOptions', () => {
    it('should include all order statuses', () => {
      const values = component.statusOptions.map((o) => o.value);
      expect(values).toContain('Pending');
      expect(values).toContain('Confirmed');
      expect(values).toContain('Shipped');
      expect(values).toContain('Delivered');
      expect(values).toContain('Cancelled');
    });

    it('should include an empty option for all statuses', () => {
      const emptyOption = component.statusOptions.find((o) => o.value === '');
      expect(emptyOption).toBeDefined();
      expect(emptyOption?.label).toBe('Todos');
    });
  });
});
