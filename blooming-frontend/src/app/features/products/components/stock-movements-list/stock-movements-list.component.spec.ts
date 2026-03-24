import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComponentFixture } from '@angular/core/testing';
import { StockMovementsListComponent } from './stock-movements-list.component';
import { StockMovementsService } from '../../services/stock-movements.service';
import { StockMovementListResponse } from '../../models/stock-movement.models';

const mockEmptyResponse: StockMovementListResponse = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 0,
};

const mockListResponse: StockMovementListResponse = {
  items: [
    {
      id: 1,
      movementType: 'In',
      quantity: 10,
      purchaseOrderId: 5,
      createdAt: '2026-03-24T00:00:00Z',
    },
    {
      id: 2,
      movementType: 'Out',
      quantity: 3,
      orderId: 12,
      createdAt: '2026-03-23T00:00:00Z',
    },
  ],
  totalCount: 2,
  pageNumber: 1,
  pageSize: 20,
  totalPages: 1,
};

describe('StockMovementsListComponent', () => {
  let component: StockMovementsListComponent;
  let fixture: ComponentFixture<StockMovementsListComponent>;
  let httpMock: HttpTestingController;
  let service: StockMovementsService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StockMovementsListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StockMovementsListComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(StockMovementsService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show empty state message when no movements', async () => {
    component.variantId = 1;
    const changesPromise = component.ngOnChanges({
      variantId: {
        currentValue: 1,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    httpMock
      .expectOne((r) => r.url.includes('/api/products/variants/1/stock-movements'))
      .flush(mockEmptyResponse);

    await changesPromise;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No hay movimientos registrados');
  });

  it('should load movements on ngOnChanges', async () => {
    component.variantId = 5;
    const changesPromise = component.ngOnChanges({
      variantId: {
        currentValue: 5,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    httpMock
      .expectOne((r) => r.url.includes('/api/products/variants/5/stock-movements'))
      .flush(mockListResponse);

    await changesPromise;
    expect(service.stockMovements()?.items.length).toBe(2);
  });

  it('should not reload when variantId key is absent from changes', async () => {
    await component.ngOnChanges({});
    httpMock.expectNone((r) => r.url.includes('stock-movements'));
  });

  it('should display movements when data is loaded', async () => {
    component.variantId = 1;
    const changesPromise = component.ngOnChanges({
      variantId: {
        currentValue: 1,
        previousValue: undefined,
        firstChange: true,
        isFirstChange: () => true,
      },
    });

    httpMock
      .expectOne((r) => r.url.includes('/api/products/variants/1/stock-movements'))
      .flush(mockListResponse);

    await changesPromise;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('No hay movimientos registrados');
  });
});

describe('StockMovementsListComponent helper methods', () => {
  let component: StockMovementsListComponent;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [StockMovementsListComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(StockMovementsListComponent);
    component = fixture.componentInstance;
  });

  it('getMovementLabel should return "Entrada" for In', () => {
    expect(component.getMovementLabel('In')).toBe('Entrada');
  });

  it('getMovementLabel should return "Salida" for Out', () => {
    expect(component.getMovementLabel('Out')).toBe('Salida');
  });

  it('getReferenceText should return "Pedido #X" when orderId is set', () => {
    expect(component.getReferenceText(42, undefined)).toBe('Pedido #42');
  });

  it('getReferenceText should return "Compra #X" when purchaseOrderId is set', () => {
    expect(component.getReferenceText(undefined, 7)).toBe('Compra #7');
  });

  it('getReferenceText should return "—" when both are undefined', () => {
    expect(component.getReferenceText(undefined, undefined)).toBe('—');
  });
});
