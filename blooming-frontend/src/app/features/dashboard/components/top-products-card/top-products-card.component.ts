import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';

@Component({
  selector: 'app-top-products-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatListModule],
  templateUrl: './top-products-card.component.html',
  styleUrl: './top-products-card.component.scss',
})
export class TopProductsCardComponent {
  private readonly dashboardService = inject(DashboardMetricsService);

  readonly topProducts = this.dashboardService.topProducts;
}
