import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '../../services/orders.service';
import { OrderDetailDto, OrderStatus, getValidTransitions, mapOrderStatusToSpanish } from '../../models/order.models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss',
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly ordersService = inject(OrdersService);

  readonly isLoading = this.ordersService.isLoading;
  readonly tableColumns = ['product', 'variant', 'unitPrice', 'quantity', 'lineTotal'];

  private readonly _order = signal<OrderDetailDto | null>(null);
  readonly order = this._order.asReadonly();

  private readonly _notFound = signal(false);
  readonly notFound = this._notFound.asReadonly();

  private readonly _selectedNewStatus = signal<OrderStatus | null>(null);
  readonly selectedNewStatus = this._selectedNewStatus.asReadonly();

  readonly validTransitions = computed<OrderStatus[]>(() => {
    const order = this._order();
    if (!order) return [];
    return getValidTransitions(order.statusKey);
  });

  readonly hasValidTransitions = computed(() => this.validTransitions().length > 0);

  readonly mapStatusToSpanish = mapOrderStatusToSpanish;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this._notFound.set(true);
      return;
    }
    this.loadOrder(id);
  }

  private async loadOrder(id: number): Promise<void> {
    try {
      const order = await this.ordersService.getOrder(id);
      this._order.set(order);
    } catch {
      this._notFound.set(true);
    }
  }

  get isPending(): boolean {
    return this._order()?.status === 'Pendiente';
  }

  onSelectNewStatus(status: OrderStatus): void {
    this._selectedNewStatus.set(status);
  }

  async onConfirm(): Promise<void> {
    const order = this._order();
    if (!order || this.isLoading()) return;

    try {
      const result = await this.ordersService.confirmOrder(order.id);
      this._order.update((o) =>
        o
          ? {
              ...o,
              status: 'Confirmado',
              statusKey: 'Confirmed' as OrderStatus,
              confirmedAt: result.confirmedAt,
            }
          : o
      );
      this.snackBar.open('Pedido confirmado correctamente', 'Cerrar', { duration: 3000 });
    } catch {
      // El ErrorInterceptor global muestra el mensaje de error al usuario
    }
  }

  async onChangeStatus(): Promise<void> {
    const order = this._order();
    const newStatus = this._selectedNewStatus();
    if (!order || !newStatus || this.isLoading()) return;

    try {
      const result = await this.ordersService.changeOrderStatus(order.id, newStatus);
      const changedAt = result.changedAt;

      this._order.update((o) => {
        if (!o) return o;
        const updated: OrderDetailDto = {
          ...o,
          status: result.status,
          statusKey: newStatus,
        };
        if (newStatus === 'Shipped') updated.shippedAt = changedAt;
        if (newStatus === 'Delivered') updated.deliveredAt = changedAt;
        if (newStatus === 'Cancelled') updated.cancelledAt = changedAt;
        return updated;
      });

      this._selectedNewStatus.set(null);
      this.snackBar.open(
        `Estado cambiado a "${result.status}" correctamente`,
        'Cerrar',
        { duration: 3000 }
      );
    } catch {
      // El ErrorInterceptor global muestra el mensaje de error al usuario
    }
  }

  goBack(): void {
    this.router.navigate(['/orders/create']);
  }
}
