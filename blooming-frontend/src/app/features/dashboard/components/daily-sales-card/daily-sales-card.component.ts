import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-daily-sales-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, CurrencyPipe],
  templateUrl: './daily-sales-card.component.html',
  styleUrl: './daily-sales-card.component.scss',
})
export class DailySalesCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly dailySales = this.dashboardService.dailySales;
}
