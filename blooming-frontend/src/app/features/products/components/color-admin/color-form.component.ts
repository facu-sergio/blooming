import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColorsAdminService } from '../../services/colors-admin.service';
import { ColorAdmin } from '../../models/catalog.models';

@Component({
  selector: 'app-color-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ isEditMode ? 'Editar color' : 'Nuevo color' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="color-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre interno</mat-label>
          <input matInput formControlName="name" maxlength="50" placeholder="ej: ROJO" />
          <mat-hint>Se guardará en mayúsculas</mat-hint>
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>El nombre es requerido</mat-error>
          }
          @if (form.get('name')?.hasError('maxlength')) {
            <mat-error>Máximo 50 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nombre visible</mat-label>
          <input matInput formControlName="displayName" maxlength="50" placeholder="ej: Rojo" />
          <mat-hint>Opcional</mat-hint>
          @if (form.get('displayName')?.hasError('maxlength')) {
            <mat-error>Máximo 50 caracteres</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Orden</mat-label>
          <input matInput type="number" formControlName="sortOrder" />
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Cancelar</button>
      <button
        mat-raised-button
        color="primary"
        [disabled]="form.invalid || isLoading()"
        (click)="onSubmit()"
      >
        @if (isLoading()) {
          <mat-spinner diameter="20" />
        } @else {
          {{ isEditMode ? 'Guardar' : 'Crear' }}
        }
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .color-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 8px;
      width: 100%;
      box-sizing: border-box;
    }
    .full-width { width: 100%; }
    mat-spinner { display: inline-block; }
  `],
})
export class ColorFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly colorsService = inject(ColorsAdminService);
  private readonly dialogRef = inject(MatDialogRef<ColorFormComponent>);
  private readonly snackBar = inject(MatSnackBar);
  readonly data = inject<ColorAdmin | null>(MAT_DIALOG_DATA);

  readonly isLoading = this.colorsService.isLoading;
  readonly isEditMode = !!this.data;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    displayName: ['', [Validators.maxLength(50)]],
    sortOrder: [0],
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({
        name: this.data.name,
        displayName: this.data.displayName,
        sortOrder: this.data.sortOrder,
      });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, displayName, sortOrder } = this.form.value;
    const dto = {
      name: name!,
      displayName: displayName || undefined,
      sortOrder: sortOrder ?? 0,
    };

    try {
      if (this.isEditMode && this.data) {
        await this.colorsService.update(this.data.id, dto);
      } else {
        await this.colorsService.create(dto);
      }
      this.dialogRef.close(true);
    } catch (err: unknown) {
      const msg = this.extractErrorMessage(err);
      this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
    }
  }

  private extractErrorMessage(err: unknown): string {
    if (
      err &&
      typeof err === 'object' &&
      'error' in err &&
      err.error &&
      typeof err.error === 'object' &&
      'message' in err.error
    ) {
      return String((err as { error: { message: string } }).error.message);
    }
    return 'Error al guardar el color';
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
