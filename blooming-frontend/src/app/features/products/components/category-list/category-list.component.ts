import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/product.models';
import { CategoryFormComponent } from '../category-form/category-form.component';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
})
export class CategoryListComponent implements OnInit {
  private readonly categoriesService = inject(CategoriesService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  readonly router = inject(Router);

  readonly categories = this.categoriesService.categories;
  readonly isLoading = this.categoriesService.isLoading;
  readonly displayedColumns = ['name', 'description', 'actions'];

  async ngOnInit(): Promise<void> {
    await this.categoriesService.loadAll();
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(CategoryFormComponent, {
      width: '480px',
      data: null,
    });
    ref.afterClosed().subscribe(async (created) => {
      if (created) {
        this.snackBar.open('Categoría creada', 'Cerrar', { duration: 3000 });
      }
    });
  }

  openEditDialog(category: Category): void {
    const ref = this.dialog.open(CategoryFormComponent, {
      width: '480px',
      data: category,
    });
    ref.afterClosed().subscribe(async (updated) => {
      if (updated) {
        this.snackBar.open('Categoría actualizada', 'Cerrar', { duration: 3000 });
      }
    });
  }

  async deleteCategory(category: Category): Promise<void> {
    try {
      await this.categoriesService.delete(category.id);
      this.snackBar.open('Categoría eliminada', 'Cerrar', { duration: 3000 });
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
    return 'No se puede eliminar una categoría con productos asociados';
  }
}
