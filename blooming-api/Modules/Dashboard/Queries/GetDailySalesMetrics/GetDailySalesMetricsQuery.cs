using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetDailySalesMetrics;

public record GetDailySalesMetricsQuery() : IRequest<DailySalesMetricsDto>;

public record DailySalesMetricsDto(int OrderCount, decimal TotalAmount);
