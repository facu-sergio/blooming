import { Component, OnInit, inject, signal } from '@angular/core';
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
import { OrdersService } from '../../services/orders.service';
import { OrderDetailDto } from '../../models/order.models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatDividerModule,
    MatChipsModule,
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

  async onConfirm(): Promise<void> {
    const order = this._order();
    if (!order || this.isLoading()) return;

    try {
      const result = await this.ordersService.confirmOrder(order.id);
      this._order.update((o) =>
        o ? { ...o, status: 'Confirmado', confirmedAt: result.confirmedAt } : o
      );
      this.snackBar.open('Pedido confirmado correctamente', 'Cerrar', { duration: 3000 });
    } catch {
      // El ErrorInterceptor global muestra el mensaje de error al usuario
    }
  }

  goBack(): void {
    this.router.navigate(['/orders/create']);
  }
}
