import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./components/user-register/user-register.component').then(
        (m) => m.UserRegisterComponent
      ),
  },
];
