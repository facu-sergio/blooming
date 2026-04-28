import { Component, inject } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-yearly-profits-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatTooltipModule, CurrencyPipe],
  templateUrl: './yearly-profits-card.component.html',
  styleUrl: './yearly-profits-card.component.scss',
})
export class YearlyProfitsCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly yearlyProfits = this.dashboardService.yearlyProfits;
}
