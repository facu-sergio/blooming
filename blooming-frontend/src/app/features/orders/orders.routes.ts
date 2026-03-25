import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./components/create-order/create-order.component').then(
        (m) => m.CreateOrderComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/order-detail/order-detail.component').then(
        (m) => m.OrderDetailComponent
      ),
  },
  { path: '', redirectTo: 'create', pathMatch: 'full' },
];
