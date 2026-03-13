import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
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
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);

  readonly form = this.fb.group({
    email: ['', { validators: [Validators.required, Validators.email], updateOn: 'change' }],
    password: ['', { validators: [Validators.required], updateOn: 'change' }],
  });

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    try {
      await this.authService.login(
        this.form.value.email!,
        this.form.value.password!
      );
      this.router.navigate(['/dashboard']);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
