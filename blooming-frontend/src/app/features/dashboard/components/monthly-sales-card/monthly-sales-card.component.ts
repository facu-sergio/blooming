import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-monthly-sales-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule, CurrencyPipe],
  templateUrl: './monthly-sales-card.component.html',
  styleUrl: './monthly-sales-card.component.scss',
})
export class MonthlySalesCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly monthlyProfits = this.dashboardService.monthlyProfits;
}
