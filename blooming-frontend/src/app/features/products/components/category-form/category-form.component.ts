import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CategoriesService } from '../../services/categories.service';
import { Category } from '../../models/category.models';
import { categoriesConstants } from '../../constants/categories.constants';

@Component({
  selector: 'app-category-form',
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
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly categoriesService = inject(CategoriesService);
  private readonly dialogRef = inject(MatDialogRef<CategoryFormComponent>);
  readonly data = inject<Category | null>(MAT_DIALOG_DATA);

  readonly constants = categoriesConstants;
  readonly isLoading = this.categoriesService.isLoading;
  readonly isEditMode = !!this.data;

  readonly form = this.fb.group({
    name: [
      '',
      {
        validators: [Validators.required, Validators.maxLength(categoriesConstants.nameMaxLength)],
        updateOn: 'change',
      },
    ],
    description: ['', [Validators.maxLength(categoriesConstants.descriptionMaxLength)]],
  });

  ngOnInit(): void {
    if (this.data) {
      this.form.patchValue({ name: this.data.name, description: this.data.description ?? '' });
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid || this.isLoading()) return;

    const { name, description } = this.form.value;
    const dto = { name: name!, description: description || undefined };

    if (this.isEditMode && this.data) {
      await this.categoriesService.update(this.data.id, dto);
    } else {
      await this.categoriesService.create(dto);
    }

    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
