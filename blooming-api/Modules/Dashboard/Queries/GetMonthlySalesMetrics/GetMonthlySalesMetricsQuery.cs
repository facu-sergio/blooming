using MediatR;

namespace blooming_api.Modules.Dashboard.Queries.GetMonthlySalesMetrics;

public record GetMonthlySalesMetricsQuery() : IRequest<MonthlySalesMetricsDto>;

public record MonthlySalesMetricsDto(int OrderCount, decimal TotalAmount);
