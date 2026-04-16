import { Component, computed, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { AuthService } from '../../features/auth/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly currentUser = this.authService.currentUser;

  private readonly _isDarkMode = signal(
    localStorage.getItem('theme') === 'dark'
  );
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    if (this._isDarkMode()) {
      document.body.classList.add('dark-mode');
    }
  }

  toggleTheme(): void {
    const next = !this._isDarkMode();
    this._isDarkMode.set(next);
    document.body.classList.toggle('dark-mode', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  }

  readonly isMobile = toSignal(
    this.breakpointObserver.observe(Breakpoints.Handset).pipe(map((r) => r.matches)),
    { initialValue: this.breakpointObserver.isMatched(Breakpoints.Handset) }
  );

  private readonly _sidenavOpened = signal(false);
  readonly sidenavOpened = this._sidenavOpened.asReadonly();

  readonly avatarLetter = computed(() => this.currentUser()?.email?.[0].toUpperCase() ?? '?');

  toggleSidenav(): void {
    this._sidenavOpened.update((v) => !v);
  }

  onSidenavOpenedChange(opened: boolean): void {
    this._sidenavOpened.set(opened);
  }

  onNavItemClick(): void {
    if (this.isMobile()) {
      this._sidenavOpened.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
