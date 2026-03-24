import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomersService } from '../../services/customers.service';
import { customersConstants } from '../../constants/customers.constants';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './customer-form.component.html',
  styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly constants = customersConstants;
  readonly isLoading = this.customersService.isLoading;

  isEditMode = false;
  customerId: number | null = null;

  readonly form = this.fb.group({
    name: [
      '',
      {
        validators: [Validators.required, Validators.maxLength(customersConstants.nameMaxLength)],
        updateOn: 'change',
      },
    ],
    phone: [
      '',
      {
        validators: [Validators.required, Validators.maxLength(customersConstants.phoneMaxLength)],
        updateOn: 'change',
      },
    ],
    address: ['', [Validators.maxLength(customersConstants.addressMaxLength)]],
    notes: ['', [Validators.maxLength(customersConstants.notesMaxLength)]],
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.customerId = parseInt(idParam, 10);
      await this.customersService.loadAll();
      const customer = this.customersService.customers().find((c) => c.id === this.customerId);
      if (customer) {
        this.form.patchValue({
          name: customer.name,
          phone: customer.phone,
          address: customer.address ?? '',
          notes: customer.notes ?? '',
        });
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, phone, address, notes } = this.form.value;
    const dto = {
      name: name!,
      phone: phone!,
      address: address || undefined,
      notes: notes || undefined,
    };

    if (this.isEditMode && this.customerId !== null) {
      await this.customersService.update(this.customerId, dto);
      this.snackBar.open('Cliente actualizado', 'Cerrar', { duration: 3000 });
    } else {
      await this.customersService.create(dto);
      this.snackBar.open('Cliente creado', 'Cerrar', { duration: 3000 });
    }

    this.router.navigate(['/customers']);
  }

  onCancel(): void {
    this.router.navigate(['/customers']);
  }
}
