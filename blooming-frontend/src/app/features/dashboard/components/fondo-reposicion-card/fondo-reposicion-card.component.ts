import { Component, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-fondo-reposicion-card',
  standalone: true,
  imports: [CurrencyPipe, MatCardModule, MatIconModule],
  templateUrl: './fondo-reposicion-card.component.html',
  styleUrl: './fondo-reposicion-card.component.scss',
})
export class FondoReposicionCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly fondoReposicion = this.dashboardService.fondoReposicion;
}
