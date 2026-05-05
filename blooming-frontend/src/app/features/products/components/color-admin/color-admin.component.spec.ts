import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ComponentFixture } from '@angular/core/testing';
import { ColorAdminComponent } from './color-admin.component';
import { ColorsAdminService } from '../../services/colors-admin.service';
import { ColorAdmin } from '../../models/catalog.models';

const mockActiveColor: ColorAdmin = {
  id: 1,
  name: 'ROJO',
  displayName: 'Rojo',
  sortOrder: 1,
  isActive: true,
};

const mockInactiveColor: ColorAdmin = {
  id: 2,
  name: 'AZUL',
  displayName: 'Azul',
  sortOrder: 2,
  isActive: false,
};

async function initComponent(
  fixture: ComponentFixture<ColorAdminComponent>,
  httpMock: HttpTestingController,
  colors: ColorAdmin[]
): Promise<void> {
  const initPromise = component_ngOnInit(fixture);
  httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush(colors);
  await initPromise;
  fixture.detectChanges();
}

function component_ngOnInit(fixture: ComponentFixture<ColorAdminComponent>): Promise<void> {
  return fixture.componentInstance.ngOnInit();
}

describe('ColorAdminComponent', () => {
  let component: ColorAdminComponent;
  let fixture: ComponentFixture<ColorAdminComponent>;
  let httpMock: HttpTestingController;
  let service: ColorsAdminService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [ColorAdminComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideAnimationsAsync(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorAdminComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    service = TestBed.inject(ColorsAdminService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct displayed columns', () => {
    expect(component.displayedColumns).toContain('name');
    expect(component.displayedColumns).toContain('displayName');
    expect(component.displayedColumns).toContain('sortOrder');
    expect(component.displayedColumns).toContain('status');
    expect(component.displayedColumns).toContain('actions');
  });

  it('should call service.loadAll on init and populate colors', async () => {
    const loadPromise = component.ngOnInit();
    httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockActiveColor]);
    await loadPromise;
    expect(service.colors().length).toBe(1);
  });

  it('should load both active and inactive colors', async () => {
    const loadPromise = component.ngOnInit();
    httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockActiveColor, mockInactiveColor]);
    await loadPromise;
    expect(service.colors().length).toBe(2);
    expect(service.colors().some((c) => !c.isActive)).toBe(true);
  });

  describe('toggleActive()', () => {
    it('should call PATCH to deactivate active color', async () => {
      const loadPromise = component.ngOnInit();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockActiveColor]);
      await loadPromise;

      const togglePromise = component.toggleActive(mockActiveColor);
      httpMock.expectOne((r) => r.url.includes('/api/colors/1/toggle-active')).flush({ ...mockActiveColor, isActive: false });
      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([{ ...mockActiveColor, isActive: false }]);
      await togglePromise;

      expect(service.colors()[0].isActive).toBe(false);
    });

    it('should call PATCH to reactivate inactive color', async () => {
      const loadPromise = component.ngOnInit();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([mockInactiveColor]);
      await loadPromise;

      const togglePromise = component.toggleActive(mockInactiveColor);
      httpMock.expectOne((r) => r.url.includes('/api/colors/2/toggle-active')).flush({ ...mockInactiveColor, isActive: true });
      await Promise.resolve();
      httpMock.expectOne((r) => r.url.includes('/api/colors/admin')).flush([{ ...mockInactiveColor, isActive: true }]);
      await togglePromise;

      expect(service.colors()[0].isActive).toBe(true);
    });
  });
});
