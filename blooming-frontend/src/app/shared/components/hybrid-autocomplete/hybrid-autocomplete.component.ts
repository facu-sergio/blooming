import { Component, OnInit, signal, computed, inject, effect, DestroyRef, viewChild, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, AbstractControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

export interface HybridOption {
  id: number;
  displayName: string;
  description?: string | null;
}

export interface HybridOptionGroup {
  label: string;
  options: HybridOption[];
}

@Component({
  selector: 'app-hybrid-autocomplete',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './hybrid-autocomplete.component.html',
  styleUrl: './hybrid-autocomplete.component.scss',
})
export class HybridAutocompleteComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly triggerRef = viewChild.required('trigger', { read: MatAutocompleteTrigger });

  readonly label = input.required<string>();
  readonly control = input.required<AbstractControl<number | null>>();
  readonly options = input<HybridOption[]>([]);
  readonly optionGroups = input<HybridOptionGroup[]>([]);
  readonly required = input<boolean>(false);

  readonly searchControl = new FormControl<string | HybridOption>('', { nonNullable: true });
  readonly isSelected = signal(false);
  readonly filterQuery = signal('');

  readonly flatOptions = computed(() => {
    const q = this.filterQuery().toLowerCase().trim();
    if (!q) return this.options();
    return this.options().filter(o => o.displayName.toLowerCase().includes(q));
  });

  readonly filteredGroups = computed(() => {
    const q = this.filterQuery().toLowerCase().trim();
    if (!q) return this.optionGroups();
    return this.optionGroups()
      .map(g => ({
        label: g.label,
        options: g.options.filter(o => o.displayName.toLowerCase().includes(q)),
      }))
      .filter(g => g.options.length > 0);
  });

  constructor() {
    // Initializes the visible input when options load (handles edit mode preloading)
    effect(() => {
      const allOptions = this.options().length
        ? this.options()
        : this.optionGroups().flatMap(g => g.options);
      const value = this.control()?.value;
      if (value != null && allOptions.length > 0 && !this.isSelected()) {
        const match = allOptions.find(o => o.id === value);
        if (match) {
          this.isSelected.set(true);
          this.searchControl.setValue(match, { emitEvent: false });
        }
      }
    });
  }

  ngOnInit(): void {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(100),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(value => {
        if (typeof value === 'string') {
          this.isSelected.set(false);
          this.filterQuery.set(value);
          this.control().setValue(null, { emitEvent: false });
        }
      });
  }

  displayFn = (option: HybridOption | string): string => {
    if (typeof option === 'string') return option;
    return option?.displayName ?? '';
  };

  onFocus(): void {
    const trigger = this.triggerRef();
    if (trigger && !trigger.panelOpen) {
      trigger.openPanel();
    }
  }

  onSelected(event: any): void {
    const option = event.option.value as HybridOption;
    this.isSelected.set(true);
    this.filterQuery.set('');
    this.searchControl.setValue(option, { emitEvent: false });
    this.control().setValue(option.id, { emitEvent: true });
  }

  clear(event: MouseEvent): void {
    event.stopPropagation();
    this.isSelected.set(false);
    this.filterQuery.set('');
    this.searchControl.setValue('', { emitEvent: true });
    this.control().setValue(null, { emitEvent: true });
  }

  writeValue(value: number | null): void {
    if (value == null) {
      this.isSelected.set(false);
      this.searchControl.setValue('', { emitEvent: false });
      return;
    }
    const allOptions = this.options().length
      ? this.options()
      : this.optionGroups().flatMap(g => g.options);
    const match = allOptions.find(o => o.id === value);
    if (match) {
      this.isSelected.set(true);
      this.searchControl.setValue(match, { emitEvent: false });
    }
  }
}
