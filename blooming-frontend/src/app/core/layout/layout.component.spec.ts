import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { LayoutComponent } from './layout.component';
import { AuthService } from '../../features/auth/services/auth.service';

describe('LayoutComponent', () => {
  let logoutSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    logoutSpy = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            logout: logoutSpy,
            currentUser: signal({ userId: '1', email: 'admin@blooming.com' }),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the authenticated user email', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('admin@blooming.com');
  });

  it('should call authService.logout() when logout button is clicked', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('[data-testid="logout-btn"]'));
    button.nativeElement.click();
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });
});
