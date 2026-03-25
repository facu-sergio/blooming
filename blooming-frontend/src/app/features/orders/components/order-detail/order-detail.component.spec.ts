import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WritableSignal, signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OrderDetailComponent } from './order-detail.component';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailDto, OrderStatus } from '../../models/order.models';

const mockPendingOrder: OrderDetailDto = {
  id: 42,
  customerId: 1,
  customerName: 'Ana García',
  status: 'Pendiente',
  statusKey: 'Pending',
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
  ...mockPendingOrder,
  status: 'Confirmado',
  statusKey: 'Confirmed',
  confirmedAt: '2026-03-24T11:00:00Z',
};

const mockShippedOrder: OrderDetailDto = {
  ...mockPendingOrder,
  status: 'Enviado',
  statusKey: 'Shipped',
  confirmedAt: '2026-03-24T11:00:00Z',
  shippedAt: '2026-03-24T14:00:00Z',
};

const mockDeliveredOrder: OrderDetailDto = {
  ...mockPendingOrder,
  status: 'Entregado',
  statusKey: 'Delivered',
  confirmedAt: '2026-03-24T11:00:00Z',
  shippedAt: '2026-03-24T14:00:00Z',
  deliveredAt: '2026-03-25T10:00:00Z',
};

describe('OrderDetailComponent', () => {
  let component: OrderDetailComponent;
  let isLoadingWritable: WritableSignal<boolean>;
  let ordersServiceSpy: {
    isLoading: ReturnType<typeof signal<boolean>>;
    selectedOrder: ReturnType<typeof signal<OrderDetailDto | null>>;
    getOrder: ReturnType<typeof vi.fn>;
    confirmOrder: ReturnType<typeof vi.fn>;
    changeOrderStatus: ReturnType<typeof vi.fn>;
    clearSelectedOrder: ReturnType<typeof vi.fn>;
  };
  let snackBarSpy: { open: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    isLoadingWritable = signal(false);
    const selectedOrderSignal = signal<OrderDetailDto | null>(null);

    ordersServiceSpy = {
      isLoading: isLoadingWritable.asReadonly() as unknown as ReturnType<typeof signal<boolean>>,
      selectedOrder: selectedOrderSignal.asReadonly() as unknown as ReturnType<typeof signal<OrderDetailDto | null>>,
      getOrder: vi.fn().mockResolvedValue(mockPendingOrder),
      confirmOrder: vi.fn().mockResolvedValue({
        orderId: 42,
        status: 'Confirmed',
        confirmedAt: '2026-03-24T11:00:00Z',
      }),
      changeOrderStatus: vi.fn().mockResolvedValue({
        orderId: 42,
        status: 'Enviado',
        changedAt: '2026-03-24T14:00:00Z',
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
        ['_order'].set(mockPendingOrder);
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

  describe('validTransitions', () => {
    it('should return [Confirmed, Cancelled] for Pending order', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockPendingOrder);
      expect(component.validTransitions()).toEqual(['Confirmed', 'Cancelled']);
    });

    it('should return [Shipped, Cancelled] for Confirmed order', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      expect(component.validTransitions()).toEqual(['Shipped', 'Cancelled']);
    });

    it('should return [Delivered, Cancelled] for Shipped order', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockShippedOrder);
      expect(component.validTransitions()).toEqual(['Delivered', 'Cancelled']);
    });

    it('should return [] for Delivered order (estado final)', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockDeliveredOrder);
      expect(component.validTransitions()).toEqual([]);
    });

    it('should return [] when no order is loaded', () => {
      expect(component.validTransitions()).toEqual([]);
    });
  });

  describe('onConfirm()', () => {
    it('should call ordersService.confirmOrder with the order id', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockPendingOrder);

      await component.onConfirm();

      expect(ordersServiceSpy.confirmOrder).toHaveBeenCalledWith(42);
    });

    it('should update order status to Confirmado after successful confirmation', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockPendingOrder);

      await component.onConfirm();

      expect(component.order()?.status).toBe('Confirmado');
      expect(component.order()?.statusKey).toBe('Confirmed');
    });

    it('should show success snackbar after confirmation', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockPendingOrder);

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
        ['_order'].set(mockPendingOrder);

      await component.onConfirm();

      expect(ordersServiceSpy.confirmOrder).not.toHaveBeenCalled();
    });
  });

  describe('onChangeStatus()', () => {
    it('should call ordersService.changeOrderStatus with orderId and new status', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Shipped');

      await component.onChangeStatus();

      expect(ordersServiceSpy.changeOrderStatus).toHaveBeenCalledWith(42, 'Shipped');
    });

    it('should update order status after successful change', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Shipped');

      await component.onChangeStatus();

      expect(component.order()?.status).toBe('Enviado');
      expect(component.order()?.statusKey).toBe('Shipped');
      expect(component.order()?.shippedAt).toBe('2026-03-24T14:00:00Z');
    });

    it('should clear selectedNewStatus after successful change', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Shipped');

      await component.onChangeStatus();

      expect(component.selectedNewStatus()).toBeNull();
    });

    it('should show success snackbar after status change', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Shipped');

      await component.onChangeStatus();

      expect(snackBarSpy.open).toHaveBeenCalledWith(
        'Estado cambiado a "Enviado" correctamente',
        'Cerrar',
        { duration: 3000 }
      );
    });

    it('should not call changeOrderStatus if no status is selected', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);

      await component.onChangeStatus();

      expect(ordersServiceSpy.changeOrderStatus).not.toHaveBeenCalled();
    });

    it('should not call changeOrderStatus if isLoading is true', async () => {
      isLoadingWritable.set(true);
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Shipped');

      await component.onChangeStatus();

      expect(ordersServiceSpy.changeOrderStatus).not.toHaveBeenCalled();
    });

    it('should set cancelledAt when status changes to Cancelled', async () => {
      ordersServiceSpy.changeOrderStatus.mockResolvedValue({
        orderId: 42,
        status: 'Cancelado',
        changedAt: '2026-03-24T16:00:00Z',
      });
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Cancelled');

      await component.onChangeStatus();

      expect(component.order()?.cancelledAt).toBe('2026-03-24T16:00:00Z');
    });
  });
});
