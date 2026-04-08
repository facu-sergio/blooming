import { Routes } from '@angular/router';

export const purchaseOrdersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/purchase-order-list/purchase-order-list.component').then(
        (m) => m.PurchaseOrderListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/purchase-order-form/purchase-order-form.component').then(
        (m) => m.PurchaseOrderFormComponent
      ),
  },
];
