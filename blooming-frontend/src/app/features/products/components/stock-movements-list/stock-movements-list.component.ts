import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { StockMovementsService } from '../../services/stock-movements.service';

@Component({
  selector: 'app-stock-movements-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatChipsModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './stock-movements-list.component.html',
  styleUrl: './stock-movements-list.component.scss',
})
export class StockMovementsListComponent implements OnChanges {
  @Input({ required: true }) variantId!: number;

  private readonly stockMovementsService = inject(StockMovementsService);

  readonly stockMovements = this.stockMovementsService.stockMovements;
  readonly isLoading = this.stockMovementsService.isLoadingStockMovements;

  readonly displayedColumns = ['createdAt', 'movementType', 'quantity', 'reference'];

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['variantId'] && this.variantId) {
      await this.stockMovementsService.getStockMovements(this.variantId);
    }
  }

  async onPageChange(event: PageEvent): Promise<void> {
    await this.stockMovementsService.getStockMovements(
      this.variantId,
      event.pageIndex + 1,
      event.pageSize
    );
  }

  getMovementLabel(type: 'In' | 'Out'): string {
    return type === 'In' ? 'Entrada' : 'Salida';
  }

  getReferenceText(orderId: number | undefined, purchaseOrderId: number | undefined): string {
    if (orderId) return `Pedido #${orderId}`;
    if (purchaseOrderId) return `Compra #${purchaseOrderId}`;
    return '—';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
