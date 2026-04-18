import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { PurchaseOrderListItem } from '../../models/purchase-order.models';
import {
  PurchaseOrderDetailsDialogComponent,
  PurchaseOrderDetailsDialogData,
} from '../../../suppliers/components/purchase-order-details-dialog/purchase-order-details-dialog.component';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss',
})
export class PurchaseOrderListComponent implements OnInit {
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

  readonly purchaseOrders = this.purchaseOrdersService.purchaseOrders;
  readonly isLoading = this.purchaseOrdersService.isLoading;
  readonly displayedColumns = ['id', 'supplierName', 'orderDate', 'itemCount', 'totalAmount', 'actions'];

  async ngOnInit(): Promise<void> {
    await this.purchaseOrdersService.loadAll();
  }

  navigateToNew(): void {
    this.router.navigate(['/purchase-orders/new']);
  }

  async viewDetail(order: PurchaseOrderListItem): Promise<void> {
    const detail = await this.purchaseOrdersService.getById(order.id);
    const data: PurchaseOrderDetailsDialogData = { orderId: order.id, orderDetail: detail };
    this.dialog.open(PurchaseOrderDetailsDialogComponent, {
      data,
      width: '640px',
      maxWidth: '95vw',
    });
  }
}
