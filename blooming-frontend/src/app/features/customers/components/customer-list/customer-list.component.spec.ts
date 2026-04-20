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

function buildMockService(overrides: Partial<CustomersService> = {}): Partial<CustomersService> {
  return {
    customers: signal<Customer[]>([]).asReadonly(),
    isLoading: signal(false).asReadonly(),
    selectedCustomer: signal<Customer | null>(null).asReadonly(),
    searchTerm: signal<string>('').asReadonly(),
    totalCount: signal(0).asReadonly(),
    loadAll: async () => {},
    getCustomersPaged: async () => {},
    selectCustomer: () => {},
    ...overrides,
  };
}

describe('CustomerListComponent', () => {
  let mockCustomersService: Partial<CustomersService>;

  beforeEach(() => {
    mockCustomersService = buildMockService();

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

  it('should show empty state when no customers and no search term', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMsg = compiled.querySelector('.empty-state p')?.textContent;
    expect(emptyMsg).toContain('No hay clientes registrados');
  });

  it('should show no-results message when customers is empty and search term is active', () => {
    TestBed.overrideProvider(CustomersService, {
      useValue: buildMockService({
        customers: signal<Customer[]>([]).asReadonly(),
      }),
    });
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.componentInstance.searchControl.setValue('Ana');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const emptyMsg = compiled.querySelector('.empty-state p')?.textContent;
    expect(emptyMsg).toContain('No se encontraron clientes');
  });

  it('should show table when customers exist (desktop)', () => {
    TestBed.overrideProvider(CustomersService, {
      useValue: buildMockService({
        customers: signal<Customer[]>([mockCustomer]).asReadonly(),
      }),
    });
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.componentInstance.isMobile = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('table')).toBeTruthy();
  });

  it('should render search input', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('input[aria-label="Buscar clientes"]')).toBeTruthy();
  });

  it('should show clear button when searchControl has value', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.componentInstance.searchControl.setValue('test');
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button[aria-label="Limpiar búsqueda"]')).toBeTruthy();
  });

  it('should NOT show clear button when searchControl is empty', () => {
    const fixture = TestBed.createComponent(CustomerListComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('button[aria-label="Limpiar búsqueda"]')).toBeNull();
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
