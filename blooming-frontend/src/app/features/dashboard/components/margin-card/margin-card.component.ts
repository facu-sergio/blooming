import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-margin-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule, CurrencyPipe],
  templateUrl: './margin-card.component.html',
  styleUrl: './margin-card.component.scss',
})
export class MarginCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly monthlyNetProfit = this.dashboardService.monthlyNetProfit;
}
