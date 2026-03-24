import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CustomerListComponent } from './customer-list.component';
import { CustomersService } from '../../services/customers.service';
import { signal } from '@angular/core';
import { Customer } from '../../models/customer.models';
import { provideAnimations } from '@angular/platform-browser/animations';

const mockCustomer: Customer = {
  id: 1,
  name: 'Ana García',
  phone: '1122334455',
  address: 'Av. Corrientes 1234',
  createdAt: '2026-03-24T00:00:00Z',
};

describe('CustomerListComponent', () => {
  let mockCustomersService: Partial<CustomersService>;

  beforeEach(() => {
    mockCustomersService = {
      customers: signal<Customer[]>([]).asReadonly(),
      isLoading: signal(false).asReadonly(),
      selectedCustomer: signal<Customer | null>(null).asReadonly(),
      loadAll: async () => {},
      selectCustomer: () => {},
    };

    TestBed.configureTestingModule({
      imports: [CustomerListComponent],
      providers: [
        provideRouter([]),
        provideAnimations(),
        { provide: CustomersService, useValue: mockCustomersService },
      ],
    });
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show empty state when no customers', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should show table when customers exist (desktop)', () => {
    const customersWithData: Partial<CustomersService> = {
      customers: signal<Customer[]>([mockCustomer]).asReadonly(),
      isLoading: signal(false).asReadonly(),
      selectedCustomer: signal<Customer | null>(null).asReadonly(),
      loadAll: async () => {},
      selectCustomer: () => {},
    };
    TestBed.overrideProvider(CustomersService, { useValue: customersWithData });
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.componentInstance.isMobile = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('truncate should return dash for undefined', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    expect(fixture.componentInstance.truncate(undefined)).toBe('—');
  });

  it('truncate should shorten long strings', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    const longStr = 'a'.repeat(50);
    const result = fixture.componentInstance.truncate(longStr, 40);
    expect(result.length).toBeLessThanOrEqual(42); // 40 + '…'
  });
});
