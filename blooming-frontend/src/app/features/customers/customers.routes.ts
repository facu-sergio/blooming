import { Routes } from '@angular/router';

export const customersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/customer-list/customer-list.component').then(
        (m) => m.CustomerListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
  // IMPORTANTE: ':id' debe ir DESPUÉS de 'new' y ':id/edit' para evitar conflictos de ruta.
  // ':id' captura cualquier segmento, 'new' es literal y tiene prioridad por orden.
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/customer-form/customer-form.component').then(
        (m) => m.CustomerFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/customer-detail/customer-detail.component').then(
        (m) => m.CustomerDetailComponent
      ),
  },
];
