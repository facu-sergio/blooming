import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DashboardMetricsService } from '../../services/dashboard-metrics.service';
import { DailySalesCardComponent } from '../daily-sales-card/daily-sales-card.component';
import { MonthlySalesCardComponent } from '../monthly-sales-card/monthly-sales-card.component';
import { MarginCardComponent } from '../margin-card/margin-card.component';
import { TopProductsCardComponent } from '../top-products-card/top-products-card.component';
import { StockAlertsCardComponent } from '../stock-alerts-card/stock-alerts-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    DailySalesCardComponent,
    MonthlySalesCardComponent,
    MarginCardComponent,
    TopProductsCardComponent,
    StockAlertsCardComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardMetricsService);
  private readonly breakpointObserver = inject(BreakpointObserver);

  readonly isLoading = this.dashboardService.isLoading;
  readonly columns = signal(3);

  ngOnInit(): void {
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small, Breakpoints.Medium])
      .subscribe((state) => {
        if (state.breakpoints[Breakpoints.XSmall] || state.breakpoints[Breakpoints.Small]) {
          this.columns.set(1);
        } else if (state.breakpoints[Breakpoints.Medium]) {
          this.columns.set(2);
        } else {
          this.columns.set(3);
        }
      });

    this.dashboardService.loadAll();
  }
}
