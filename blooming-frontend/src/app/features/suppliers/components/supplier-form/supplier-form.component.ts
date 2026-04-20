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
import { SuppliersService } from '../../services/suppliers.service';
import { suppliersConstants } from '../../constants/suppliers.constants';

@Component({
  selector: 'app-supplier-form',
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
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss',
})
export class SupplierFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly suppliersService = inject(SuppliersService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly constants = suppliersConstants;
  readonly isLoading = this.suppliersService.isLoading;

  isEditMode = false;
  supplierId: string | null = null;

  readonly form = this.fb.group({
    name: [
      '',
      {
        validators: [Validators.required, Validators.maxLength(suppliersConstants.nameMaxLength)],
        updateOn: 'change',
      },
    ],
    phone: ['', [Validators.maxLength(suppliersConstants.phoneMaxLength)]],
    website: ['', [Validators.maxLength(suppliersConstants.websiteMaxLength)]],
    address: ['', [Validators.maxLength(suppliersConstants.addressMaxLength)]],
    notes: ['', [Validators.maxLength(suppliersConstants.notesMaxLength)]],
  });

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.supplierId = idParam;
      await this.suppliersService.loadAll();
      const supplier = this.suppliersService.suppliers().find((s) => s.id === this.supplierId);
      if (supplier) {
        this.form.patchValue({
          name: supplier.name,
          phone: supplier.phone ?? '',
          website: supplier.website ?? '',
          address: supplier.address ?? '',
          notes: supplier.notes ?? '',
        });
      }
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, phone, website, address, notes } = this.form.value;
    const dto = {
      name: name!,
      phone: phone || undefined,
      website: website || undefined,
      address: address || undefined,
      notes: notes || undefined,
    };

    if (this.isEditMode && this.supplierId !== null) {
      await this.suppliersService.update(this.supplierId, dto);
      this.snackBar.open('Proveedor actualizado', 'Cerrar', { duration: 3000 });
    } else {
      await this.suppliersService.create(dto);
      this.snackBar.open('Proveedor creado', 'Cerrar', { duration: 3000 });
    }

    this.router.navigate(['/suppliers']);
  }

  onCancel(): void {
    this.router.navigate(['/suppliers']);
  }
}
