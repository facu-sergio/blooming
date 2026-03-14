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

  it('should display the first letter of the authenticated user email as avatar', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    const avatarBtn = fixture.debugElement.query(By.css('[data-testid="avatar-btn"]'));
    expect(avatarBtn.nativeElement.textContent.trim()).toBe('A');
  });

  it('should call authService.logout() when logout() is called', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    fixture.detectChanges();
    fixture.componentInstance.logout();
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });

  it('should toggle sidenav on mobile when hamburger is clicked', () => {
    const fixture = TestBed.createComponent(LayoutComponent);
    const component = fixture.componentInstance;
    // Simulate mobile by spying on isMobile
    expect(component.sidenavOpened()).toBe(false);
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(true);
    component.toggleSidenav();
    expect(component.sidenavOpened()).toBe(false);
  });
});
