import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import {
  HybridAutocompleteComponent,
  HybridOption,
  HybridOptionGroup,
} from './hybrid-autocomplete.component';

describe('HybridAutocompleteComponent', () => {
  let component: HybridAutocompleteComponent;
  let fixture: ComponentFixture<HybridAutocompleteComponent>;
  let ctrl: FormControl<number | null>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HybridAutocompleteComponent, NoopAnimationsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(HybridAutocompleteComponent);
    component = fixture.componentInstance;
    ctrl = new FormControl<number | null>(null, { nonNullable: false });
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('control', ctrl);
    fixture.detectChanges();
  });

  describe('flatOptions()', () => {
    it('returns all options when filterQuery is empty', () => {
      const options: HybridOption[] = [
        { id: 1, displayName: 'Rojo' },
        { id: 2, displayName: 'Azul' },
      ];
      fixture.componentRef.setInput('options', options);

      expect(component.flatOptions()).toEqual(options);
    });

    it('filters options by displayName case-insensitively', () => {
      fixture.componentRef.setInput('options', [
        { id: 1, displayName: 'Rojo' },
        { id: 2, displayName: 'Azul' },
        { id: 3, displayName: 'Rosa' },
      ]);
      component.filterQuery.set('ro');

      const result = component.flatOptions();
      expect(result).toHaveLength(2);
      expect(result.map(o => o.id)).toEqual([1, 3]);
    });
  });

  describe('filteredGroups()', () => {
    const groups: HybridOptionGroup[] = [
      {
        label: 'Ropa',
        options: [
          { id: 1, displayName: 'S' },
          { id: 2, displayName: 'M' },
          { id: 3, displayName: 'XL' },
        ],
      },
    ];

    it('returns all groups when filterQuery is empty', () => {
      fixture.componentRef.setInput('optionGroups', groups);

      expect(component.filteredGroups()).toEqual(groups);
    });

    it('filters group options by displayName', () => {
      fixture.componentRef.setInput('optionGroups', groups);
      component.filterQuery.set('x');

      const result = component.filteredGroups();
      expect(result).toHaveLength(1);
      expect(result[0].options).toHaveLength(1);
      expect(result[0].options[0].id).toBe(3);
    });

    it('removes group when all options are filtered out', () => {
      fixture.componentRef.setInput('optionGroups', groups);
      component.filterQuery.set('zzz');

      expect(component.filteredGroups()).toHaveLength(0);
    });
  });

  describe('displayFn()', () => {
    it('returns displayName for HybridOption', () => {
      expect(component.displayFn({ id: 1, displayName: 'Medium' })).toBe('Medium');
    });

    it('returns string as-is', () => {
      expect(component.displayFn('test')).toBe('test');
    });
  });

  describe('onSelected()', () => {
    it('sets isSelected, updates control value, and clears filterQuery', () => {
      const option: HybridOption = { id: 42, displayName: 'Large' };
      const event = { option: { value: option } } as MatAutocompleteSelectedEvent;

      component.onSelected(event);

      expect(component.isSelected()).toBe(true);
      expect(component.filterQuery()).toBe('');
      expect(ctrl.value).toBe(42);
    });
  });

  describe('clear()', () => {
    it('resets isSelected, filterQuery and control value', () => {
      component.isSelected.set(true);
      component.filterQuery.set('algo');
      ctrl.setValue(5);
      const event = new MouseEvent('click');

      component.clear(event);

      expect(component.isSelected()).toBe(false);
      expect(component.filterQuery()).toBe('');
      expect(ctrl.value).toBeNull();
    });
  });

  describe('writeValue()', () => {
    it('resets to empty when null passed', () => {
      component.isSelected.set(true);

      component.writeValue(null);

      expect(component.isSelected()).toBe(false);
      expect(component.searchControl.value).toBe('');
    });

    it('finds matching option from flat options and sets searchControl', () => {
      fixture.componentRef.setInput('options', [
        { id: 1, displayName: 'Rojo' },
        { id: 5, displayName: 'Azul' },
      ]);

      component.writeValue(5);

      expect(component.isSelected()).toBe(true);
      expect((component.searchControl.value as HybridOption).id).toBe(5);
    });

    it('finds matching option from grouped options and sets searchControl', () => {
      fixture.componentRef.setInput('optionGroups', [
        { label: 'Ropa', options: [{ id: 10, displayName: 'XL' }] },
      ]);

      component.writeValue(10);

      expect(component.isSelected()).toBe(true);
      expect((component.searchControl.value as HybridOption).id).toBe(10);
    });
  });
});
