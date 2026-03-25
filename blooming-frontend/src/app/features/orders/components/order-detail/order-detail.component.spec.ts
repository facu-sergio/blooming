import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WritableSignal, signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OrderDetailComponent } from './order-detail.component';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailDto } from '../../models/order.models';

const mockOrder: OrderDetailDto = {
  id: 42,
  customerId: 1,
  customerName: 'Ana García',
  status: 'Pendiente',
  total: 5000,
  createdAt: '2026-03-24T10:00:00Z',
  items: [
    {
      id: 1,
      productVariantId: 5,
      productName: 'Remera',
      variantLabel: 'M Azul',
      unitPrice: 2500,
      quantity: 2,
      lineTotal: 5000,
    },
  ],
};

const mockConfirmedOrder: OrderDetailDto = {
  ...mockOrder,
  status: 'Confirmado',
  confirmedAt: '2026-03-24T11:00:00Z',
};

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let isLoadingWritable: WritableSignal<boolean>;
  let ordersServiceSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    selectedOrder: ReturnType<typeof signal<OrderDetailDto | null>>;
    getOrder: ReturnType<typeof vi.fn>;
    confirmOrder: ReturnType<typeof vi.fn>;
    clearSelectedOrder: ReturnType<typeof vi.fn>;
  };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    isLoadingWritable = signal(false);
    const selectedOrderSignal = signal<OrderDetailDto | null>(null);

    ordersServiceSpy = {
      isLoading: isLoadingWritable.asReadonly() as unknown as ReturnType<typeof signal<boolean>>,
      selectedOrder: selectedOrderSignal.asReadonly() as unknown as ReturnType<typeof signal<OrderDetailDto | null>>,
      getOrder: vi.fn().mockResolvedValue(mockOrder),
      confirmOrder: vi.fn().mockResolvedValue({
        orderId: 42,
        status: 'Confirmed',
        confirmedAt: '2026-03-24T11:00:00Z',
      }),
      clearSelectedOrder: vi.fn(),
    };

    snackBarSpy = { open: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [
        provideRouter([{ path: 'orders/:id', component: OrderDetailComponent }]),
        provideAnimations(),
        { provide: OrdersService, useValue: ordersServiceSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('isPending', () => {
    it('should return true when order status is Pendiente', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockOrder);
      expect(component.isPending).toBe(true);
    });

    it('should return false when order status is Confirmado', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      expect(component.isPending).toBe(false);
    });

    it('should return false when no order is loaded', () => {
      expect(component.isPending).toBe(false);
    });
  });

  describe('onConfirm()', () => {
    it('should call ordersService.confirmOrder with the order id', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockOrder);

      await component.onConfirm();

      expect(ordersServiceSpy.confirmOrder).toHaveBeenCalledWith(42);
    });

    it('should update order status to Confirmado after successful confirmation', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockOrder);

      await component.onConfirm();

      expect(component.order()?.status).toBe('Confirmado');
    });

    it('should show success snackbar after confirmation', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockOrder);

      await component.onConfirm();

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Pedido confirmado correctamente',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should not call confirmOrder if isLoading is true', async () => {
      isLoadingWritable.set(true);
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockOrder);

      await component.onConfirm();

      expect(ordersServiceSpy.confirmOrder).not.toHaveBeenCalled();
    });
  });
});
