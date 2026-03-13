import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { UsersService } from '../../services/users.service';
import { usersConstants } from '../../constants/users.constants';

@Component({
  selector: 'app-user-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.scss',
})
export class UserRegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);

  readonly isSubmitting = this.usersService.isLoading;

  readonly emailMaxLength = usersConstants.emailMaxLength;
  readonly passwordMinLength = usersConstants.passwordMinLength;

  readonly form = this.fb.group({
    email: [
      '',
      {
        validators: [
          Validators.required,
          Validators.email,
          Validators.maxLength(usersConstants.emailMaxLength),
        ],
        updateOn: 'change',
      },
    ],
    password: [
      '',
      {
        validators: [
          Validators.required,
          Validators.minLength(usersConstants.passwordMinLength),
        ],
        updateOn: 'change',
      },
    ],
  });

  readonly emailDuplicateError = signal<string | null>(null);

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) return;

    this.emailDuplicateError.set(null);

    try {
      await this.usersService.register(
        this.form.value.email!,
        this.form.value.password!
      );
      this.form.reset();
      this.snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 4000 });
    } catch (error) {
      if (error instanceof HttpErrorResponse && error.status === 422) {
        const detail: string = error.error?.detail ?? 'El email ya está registrado';
        this.emailDuplicateError.set(detail);
      }
      // otros errores los maneja el ErrorInterceptor global
    }
  }
}
