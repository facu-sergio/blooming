import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { CustomerFormComponent } from './customer-form.component';
import { CustomersService } from '../../services/customers.service';
import { signal } from '@angular/core';
import { Customer } from '../../models/customer.models';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

const mockCustomer: Customer = {
  id: 1,
  name: 'Ana García',
  phone: '1122334455',
  address: 'Av. Corrientes 1234',
  createdAt: '2026-03-24T00:00:00Z',
};

function buildMockService(customers: Customer[] = []): Partial<CustomersService> {
  return {
    customers: signal<Customer[]>(customers).asReadonly(),
    isLoading: signal(false).asReadonly(),
    selectedCustomer: signal<Customer | null>(null).asReadonly(),
    loadAll: async () => {},
    create: async () => mockCustomer,
    update: async () => mockCustomer,
    selectCustomer: () => {},
  };
}

describe('CustomerFormComponent — create mode', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomerFormComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: CustomersService, useValue: buildMockService() },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => null } } },
        },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should be in create mode when no id param', () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.isEditMode).toBe(false);
  });

  it('form should be invalid when name is empty', () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({ name: '', phone: '1234' });
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('form should be invalid when phone is empty', () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({ name: 'Ana', phone: '' });
    expect(fixture.componentInstance.form.invalid).toBe(true);
  });

  it('form should be valid with name and phone', () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    fixture.detectChanges();
    fixture.componentInstance.form.patchValue({ name: 'Ana García', phone: '1122334455' });
    expect(fixture.componentInstance.form.valid).toBe(true);
  });
});

describe('CustomerFormComponent — edit mode', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomerFormComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: CustomersService, useValue: buildMockService([mockCustomer]) },
        { provide: MatSnackBar, useValue: { open: () => {} } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '1' } } },
        },
      ],
    });
  });

  it('should set isEditMode to true when id param exists', async () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    await fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.isEditMode).toBe(true);
    expect(fixture.componentInstance.customerId).toBe(1);
  });

  it('should populate form with customer data in edit mode', async () => {
    const fixture = TestBed.createComponent(CustomerFormComponent);
    await fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.form.value.name).toBe('Ana García');
    expect(fixture.componentInstance.form.value.phone).toBe('1122334455');
  });
});
