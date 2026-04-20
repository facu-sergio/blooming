import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { CustomersService } from '../../services/customers.service';
import { Customer } from '../../models/customer.models';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
  ],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss',
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  private readonly customersService = inject(CustomersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly isLoadingDetail = this.customersService.isLoadingDetail;
  readonly customerOrders = this.customersService.customerOrders;
  readonly customerMetrics = this.customersService.customerMetrics;

  readonly ordersTableColumns = ['date', 'status', 'total'];

  customerId = 0;

  /**
   * Cliente obtenido del signal del servicio.
   * Si el usuario navega directamente a la URL (sin pasar por la lista),
   * se llama loadAll() en ngOnInit para asegurar que los datos estén disponibles.
   */
  readonly customer = computed<Customer | null>(() => {
    const id = this.customerId;
    return this.customersService.customers().find((c) => c.id === id) ?? null;
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.customerId = idParam ? parseInt(idParam, 10) : 0;

    // Si la lista de clientes está vacía (navegación directa a la URL),
    // cargar todos para que el computed 'customer' pueda resolver el cliente.
    if (this.customersService.customers().length === 0) {
      await this.customersService.loadAll();
    }

    await Promise.all([
      this.customersService.getCustomerOrders(this.customerId),
      this.customersService.getCustomerMetrics(this.customerId),
    ]);
  }

  ngOnDestroy(): void {
    this.customersService.clearCustomerDetail();
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

  editCustomer(): void {
    this.router.navigate(['/customers', this.customerId, 'edit']);
  }
}
