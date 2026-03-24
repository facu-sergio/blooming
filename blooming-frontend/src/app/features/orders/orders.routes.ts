import { Routes } from '@angular/router';

export const ordersRoutes: Routes = [
  {
    path: 'create',
    loadComponent: () =>
      import('./components/create-order/create-order.component').then(
        (m) => m.CreateOrderComponent
      ),
  },
  { path: '', redirectTo: 'create', pathMatch: 'full' },
];
