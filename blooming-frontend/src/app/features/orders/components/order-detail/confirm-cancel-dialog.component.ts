import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-cancel-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Cancelar pedido</h2>
    <mat-dialog-content>
      <p>¿Estás seguro de que deseas cancelar este pedido?</p>
      <p>Si el pedido estaba confirmado, el stock de cada variante se revertirá automáticamente.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-stroked-button (click)="onNo()">No, volver</button>
      <button mat-flat-button color="warn" (click)="onYes()">
        <mat-icon>cancel</mat-icon>
        Sí, cancelar pedido
      </button>
    </mat-dialog-actions>
  `,
})
export class ConfirmCancelDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmCancelDialogComponent>);

  onYes(): void {
    this.dialogRef.close(true);
  }

  onNo(): void {
    this.dialogRef.close(false);
  }
}
