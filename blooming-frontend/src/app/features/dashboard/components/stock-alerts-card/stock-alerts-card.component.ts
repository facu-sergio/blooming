import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-stock-alerts-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule, MatChipsModule],
  templateUrl: './stock-alerts-card.component.html',
  styleUrl: './stock-alerts-card.component.scss',
})
export class StockAlertsCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly stockAlerts = this.dashboardService.stockAlerts;
}
