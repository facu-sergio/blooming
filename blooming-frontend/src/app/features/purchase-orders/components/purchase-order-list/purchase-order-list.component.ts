import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, map, startWith } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { PurchaseOrdersService } from '../../services/purchase-orders.service';
import { SuppliersService } from '../../../suppliers/services/suppliers.service';
import { PurchaseOrderListItem, PurchaseOrderListFilters } from '../../models/purchase-order.models';
import { Supplier } from '../../../suppliers/models/supplier.models';
import {
  PurchaseOrderDetailsDialogComponent,
  PurchaseOrderDetailsDialogData,
} from '../../../suppliers/components/purchase-order-details-dialog/purchase-order-details-dialog.component';

@Component({
  selector: 'app-purchase-order-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatAutocompleteModule,
  ],
  templateUrl: './purchase-order-list.component.html',
  styleUrl: './purchase-order-list.component.scss',
})
export class PurchaseOrderListComponent implements OnInit {
  private readonly purchaseOrdersService = inject(PurchaseOrdersService);
  private readonly suppliersService = inject(SuppliersService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly purchaseOrders = this.purchaseOrdersService.purchaseOrders;
  readonly isLoading = this.purchaseOrdersService.isLoading;
  readonly totalCount = this.purchaseOrdersService.totalCount;
  readonly displayedColumns = ['id', 'supplierName', 'orderDate', 'itemCount', 'totalAmount', 'actions'];

  private suppliers: Supplier[] = [];
  readonly filteredSuppliers: Observable<Supplier[]>;

  isMobile = false;
  page = 1;
  pageSize = 20;

  readonly filterForm: FormGroup = this.fb.group({
    fromDate: [null],
    toDate: [null],
    supplierId: [null],
    supplierName: [''],
  });

  constructor() {
    this.filteredSuppliers = this.filterForm.get('supplierName')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filterSuppliers(value || ''))
    );
  }

  async ngOnInit(): Promise<void> {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(r => {
      this.isMobile = r.matches;
    });
    await this.suppliersService.loadAll();
    this.suppliers = this.suppliersService.suppliers();
    await this.loadOrders();
  }

  private _filterSuppliers(value: string): Supplier[] {
    const filterValue = value.toLowerCase();
    return this.suppliers.filter(s => s.name.toLowerCase().includes(filterValue));
  }

  displaySupplier(supplier: Supplier | null): string {
    return supplier ? supplier.name : '';
  }

  onSupplierSelected(supplier: Supplier): void {
    this.filterForm.patchValue({ supplierId: supplier.id, supplierName: supplier.name });
  }

  async loadOrders(): Promise<void> {
    const { fromDate, toDate, supplierId } = this.filterForm.value as {
      fromDate: Date | null;
      toDate: Date | null;
      supplierId: string | null;
      supplierName: string;
    };

    const filters: PurchaseOrderListFilters = {
      page: this.page,
      pageSize: this.pageSize,
    };

    if (supplierId) filters.supplierId = supplierId;
    if (fromDate) filters.fromDate = fromDate.toISOString();
    if (toDate) filters.toDate = toDate.toISOString();

    await this.purchaseOrdersService.getPurchaseOrdersPaged(filters);
  }

  onApplyFilters(): void {
    this.page = 1;
    void this.loadOrders();
  }

  onClearFilters(): void {
    this.filterForm.reset({ fromDate: null, toDate: null, supplierId: null, supplierName: '' });
    this.page = 1;
    void this.loadOrders();
  }

  onPageChange(event: PageEvent): void {
    this.page = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    void this.loadOrders();
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
