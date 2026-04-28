import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { WritableSignal, signal } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { OrderDetailComponent } from './order-detail.component';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailDto } from '../../models/order.models';

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
    changeOrderStatus: ReturnType<typeof vi.fn>;
    cancelOrder: ReturnType<typeof vi.fn>;
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
      changeOrderStatus: vi.fn().mockResolvedValue({
        orderId: 42,
        status: 'Enviado',
        changedAt: '2026-03-24T14:00:00Z',
      }),
      cancelOrder: vi.fn().mockResolvedValue({
        orderId: 42,
        status: 'Cancelado',
        changedAt: '2026-03-24T16:00:00Z',
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

  describe('validTransitions', () => {
    it('should return [Confirmed, Cancelled] for Pending order', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockPendingOrder);
      expect(component.validTransitions()).toEqual(['Confirmed', 'Cancelled']);
    });

    it('should return [Shipped, Delivered, Cancelled] for Confirmed order', () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      expect(component.validTransitions()).toEqual(['Shipped', 'Delivered', 'Cancelled']);
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

  describe('onChangeStatus()', () => {
    it('should call ordersService.changeOrderStatus with orderId, new status and undefined deliveredAt', async () => {
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockConfirmedOrder);
      component.onSelectNewStatus('Shipped');

      await component.onChangeStatus();

      expect(ordersServiceSpy.changeOrderStatus).toHaveBeenCalledWith(42, 'Shipped', undefined);
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

  describe('custom delivery date (AC #3)', () => {
    it('should start with showCustomDeliveredDate as false', () => {
      expect(component.showCustomDeliveredDate()).toBe(false);
    });

    it('should start with customDeliveryDate as null', () => {
      expect(component.customDeliveryDate()).toBeNull();
    });

    it('toggleCustomDeliveredDate(true) sets showCustomDeliveredDate to true', () => {
      component.toggleCustomDeliveredDate(true);
      expect(component.showCustomDeliveredDate()).toBe(true);
    });

    it('toggleCustomDeliveredDate(false) resets customDeliveryDate to null', () => {
      component.toggleCustomDeliveredDate(true);
      component.onCustomDeliveryDateChange(new Date('2026-04-20'));
      component.toggleCustomDeliveredDate(false);
      expect(component.customDeliveryDate()).toBeNull();
    });

    it('onSelectNewStatus resets showCustomDeliveredDate and customDeliveryDate', () => {
      component.toggleCustomDeliveredDate(true);
      component.onCustomDeliveryDateChange(new Date('2026-04-20'));
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockShippedOrder);

      component.onSelectNewStatus('Delivered');

      expect(component.showCustomDeliveredDate()).toBe(false);
      expect(component.customDeliveryDate()).toBeNull();
    });

    it('should call changeOrderStatus with deliveredAt ISO string when custom date is set', async () => {
      ordersServiceSpy.changeOrderStatus.mockResolvedValue({
        orderId: 42,
        status: 'Entregado',
        changedAt: '2026-04-20T00:00:00.000Z',
      });
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockShippedOrder);
      component.onSelectNewStatus('Delivered');
      component.toggleCustomDeliveredDate(true);
      const customDate = new Date('2026-04-20T00:00:00.000Z');
      component.onCustomDeliveryDateChange(customDate);

      await component.onChangeStatus();

      expect(ordersServiceSpy.changeOrderStatus).toHaveBeenCalledWith(
        42,
        'Delivered',
        customDate.toISOString()
      );
    });

    it('should call changeOrderStatus with undefined deliveredAt when Delivered but no custom date', async () => {
      ordersServiceSpy.changeOrderStatus.mockResolvedValue({
        orderId: 42,
        status: 'Entregado',
        changedAt: '2026-04-27T10:00:00Z',
      });
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockShippedOrder);
      component.onSelectNewStatus('Delivered');

      await component.onChangeStatus();

      expect(ordersServiceSpy.changeOrderStatus).toHaveBeenCalledWith(42, 'Delivered', undefined);
    });

    it('should clear custom date signals after successful status change', async () => {
      ordersServiceSpy.changeOrderStatus.mockResolvedValue({
        orderId: 42,
        status: 'Entregado',
        changedAt: '2026-04-20T00:00:00.000Z',
      });
      (component as unknown as { _order: ReturnType<typeof signal<OrderDetailDto | null>> })
        ['_order'].set(mockShippedOrder);
      component.onSelectNewStatus('Delivered');
      component.toggleCustomDeliveredDate(true);
      component.onCustomDeliveryDateChange(new Date('2026-04-20'));

      await component.onChangeStatus();

      expect(component.showCustomDeliveredDate()).toBe(false);
      expect(component.customDeliveryDate()).toBeNull();
    });
  });
});
