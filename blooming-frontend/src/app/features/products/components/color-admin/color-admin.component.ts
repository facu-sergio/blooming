import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ColorsAdminService } from '../../services/colors-admin.service';
import { ColorAdmin } from '../../models/catalog.models';
import { ColorFormComponent } from './color-form.component';

@Component({
  selector: 'app-color-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './color-admin.component.html',
  styleUrl: './color-admin.component.scss',
})
export class ColorAdminComponent implements OnInit {
  private readonly colorsService = inject(ColorsAdminService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((r) => r.matches)),
    { initialValue: false }
  );

  readonly colors = this.colorsService.colors;
  readonly isLoading = this.colorsService.isLoading;
  readonly displayedColumns = ['name', 'displayName', 'sortOrder', 'status', 'actions'];

  async ngOnInit(): Promise<void> {
    await this.colorsService.loadAll();
  }

  private get dialogWidth(): string {
    return this.isMobile() ? '95vw' : '480px';
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ColorFormComponent, {
      width: this.dialogWidth,
      maxWidth: '95vw',
      data: null,
    });
    ref.afterClosed().subscribe(async (created) => {
      if (created) {
        this.snackBar.open('Color creado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openEditDialog(color: ColorAdmin): void {
    const ref = this.dialog.open(ColorFormComponent, {
      width: this.dialogWidth,
      maxWidth: '95vw',
      data: color,
    });
    ref.afterClosed().subscribe(async (updated) => {
      if (updated) {
        this.snackBar.open('Color actualizado', 'Cerrar', { duration: 3000 });
      }
    });
  }

  async toggleActive(color: ColorAdmin): Promise<void> {
    try {
      await this.colorsService.toggleActive(color.id);
      const msg = color.isActive ? 'Color desactivado' : 'Color activado';
      this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
    } catch (err: unknown) {
      this.snackBar.open(this.extractErrorMessage(err), 'Cerrar', { duration: 5000 });
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
    return 'Error al actualizar el color';
  }
}
