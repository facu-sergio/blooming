import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { PurchaseOrderDetail } from '../../../purchase-orders/models/purchase-order.models';

export interface PurchaseOrderDetailsDialogData {
  orderId: number;
  orderDetail: PurchaseOrderDetail;
}

@Component({
  selector: 'app-purchase-order-details-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './purchase-order-details-dialog.component.html',
  styleUrl: './purchase-order-details-dialog.component.scss',
})
export class PurchaseOrderDetailsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PurchaseOrderDetailsDialogComponent>);
  readonly data = inject<PurchaseOrderDetailsDialogData>(MAT_DIALOG_DATA);

  readonly displayedColumns = ['product', 'quantity', 'unitCostPrice', 'lineTotal'];

  close(): void {
    this.dialogRef.close();
  }
}
