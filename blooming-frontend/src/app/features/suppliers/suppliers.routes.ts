import { Routes } from '@angular/router';

export const suppliersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/supplier-list/supplier-list.component').then(
        (m) => m.SupplierListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/supplier-form/supplier-form.component').then(
        (m) => m.SupplierFormComponent
      ),
  },
  // IMPORTANTE: ':id/edit' debe ir ANTES de ':id' para evitar conflictos de ruta.
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./components/supplier-form/supplier-form.component').then(
        (m) => m.SupplierFormComponent
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./components/supplier-detail/supplier-detail.component').then(
        (m) => m.SupplierDetailComponent
      ),
  },
];
