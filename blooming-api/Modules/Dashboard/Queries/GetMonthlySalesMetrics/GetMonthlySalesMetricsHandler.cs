using blooming_api.Infrastructure.Data;
using blooming_api.Modules.Orders.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace blooming_api.Modules.Dashboard.Queries.GetMonthlySalesMetrics;

public class GetMonthlySalesMetricsHandler : IRequestHandler<GetMonthlySalesMetricsQuery, MonthlySalesMetricsDto>
{
    private readonly AppDbContext _db;

    public GetMonthlySalesMetricsHandler(AppDbContext db)
    {
        _db = db;
    }

    public async Task<MonthlySalesMetricsDto> Handle(GetMonthlySalesMetricsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var startOfNextMonth = startOfMonth.AddMonths(1);

        var result = await _db.Orders
            .Where(o => o.Status == OrderStatus.Delivered
                && o.DeliveredAt >= startOfMonth
                && o.DeliveredAt < startOfNextMonth)
            .GroupBy(_ => 1)
            .Select(g => new { OrderCount = g.Count(), TotalAmount = g.Sum(o => o.Total) })
            .FirstOrDefaultAsync(cancellationToken);

        return result is null
            ? new MonthlySalesMetricsDto(0, 0)
            : new MonthlySalesMetricsDto(result.OrderCount, result.TotalAmount);
    }
}
