import { Component, inject, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { SuppliersService } from '../../services/suppliers.service';
import { SupplierPurchaseHistoryService } from '../../services/supplier-purchase-history.service';
import { Supplier } from '../../models/supplier.models';
import { PurchaseOrderListItem } from '../../../purchase-orders/models/purchase-order.models';
import {
  PurchaseOrderDetailsDialogComponent,
  PurchaseOrderDetailsDialogData,
} from '../purchase-order-details-dialog/purchase-order-details-dialog.component';

@Component({
  selector: 'app-supplier-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './supplier-detail.component.html',
  styleUrl: './supplier-detail.component.scss',
})
export class SupplierDetailComponent implements OnInit, OnDestroy {
  private readonly suppliersService = inject(SuppliersService);
  private readonly purchaseHistoryService = inject(SupplierPurchaseHistoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly isLoading = this.suppliersService.isLoading;
  readonly isLoadingHistory = this.purchaseHistoryService.isLoading;
  readonly isLoadingDetail = this.purchaseHistoryService.isLoadingDetail;
  readonly purchaseOrders = this.purchaseHistoryService.purchaseOrders;

  readonly historyTableColumns = ['orderDate', 'itemCount', 'totalAmount', 'actions'];

  supplierId = '';

  readonly supplier = computed<Supplier | null>(() => {
    const id = this.supplierId;
    return this.suppliersService.suppliers().find((s) => s.id === id) ?? null;
  });

  async ngOnInit(): Promise<void> {
    this.supplierId = this.route.snapshot.paramMap.get('id') ?? '';

    if (this.suppliersService.suppliers().length === 0) {
      await this.suppliersService.loadAll();
    }

    await this.purchaseHistoryService.loadBySupplierId(this.supplierId);
  }

  ngOnDestroy(): void {
    this.purchaseHistoryService.clear();
  }

  goBack(): void {
    this.router.navigate(['/suppliers']);
  }

  editSupplier(): void {
    this.router.navigate(['/suppliers', this.supplierId, 'edit']);
  }

  newPurchaseOrder(): void {
    this.router.navigate(['/purchase-orders', 'new'], {
      queryParams: { supplierId: this.supplierId },
    });
  }

  async viewOrderDetail(order: PurchaseOrderListItem): Promise<void> {
    const detail = await this.purchaseHistoryService.getOrderDetail(order.id);
    const data: PurchaseOrderDetailsDialogData = { orderId: order.id, orderDetail: detail };
    this.dialog.open(PurchaseOrderDetailsDialogComponent, {
      data,
      width: '640px',
      maxWidth: '95vw',
    });
  }
}
