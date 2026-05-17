export interface DailySalesMetrics {
  orderCount: number;
  totalAmount: number;
}

export interface MonthlySalesMetrics {
  orderCount: number;
  totalAmount: number;
}

export interface MonthlyProfitsMetrics {
  orderCount: number;
  totalProfit: number;
}

export interface YearlyProfitsMetrics {
  orderCount: number;
  totalProfit: number;
}

export interface TopProduct {
  productName: string;
  imageUrl: string | null;
  unitsSold: number;
}

export interface StockAlert {
  productName: string;
  size: string;
  color: string;
  currentStock: number;
  threshold: number;
}

export interface MonthlyMargin {
  revenue: number;
  cost: number;
  margin: number;
}

export interface MonthlyNetProfit {
  revenue: number;
  cost: number;
  netProfit: number;
}

export interface FondoReposicion {
  fondoCalculado: number;
  saldoFondo: number;
}
